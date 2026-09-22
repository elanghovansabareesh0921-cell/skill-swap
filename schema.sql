-- ==============================================================================
-- SkillSwap Production PostgreSQL Schema & Stored Procedures
-- Framework: Supabase (PostgreSQL 15+)
-- Architecture: Atomic Credit Escrow Economy, Realtime Collaboration, RLS
-- ==============================================================================

-- 1. Extensions
create extension if not exists "uuid-ossp";

-- 2. Profiles Table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  email text,
  credits int default 50 check (credits >= 0),
  bio text default '',
  github_url text default '',
  linkedin_url text default '',
  website_url text default '',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Skills Master Table
create table if not exists public.skills (
  id uuid default gen_random_uuid() primary key,
  name text unique not null,
  category text default 'General',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. User Skills Junction
create table if not exists public.user_skills (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  skill_id uuid references public.skills(id) on delete cascade not null,
  skill_type text check (skill_type in ('TEACH', 'LEARN')) not null,
  level text default 'Intermediate',
  goal text default '',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, skill_id, skill_type)
);

-- 5. Sessions Table (Credit Escrow Protected)
create table if not exists public.sessions (
  id uuid default gen_random_uuid() primary key,
  requester_id uuid references public.profiles(id) on delete cascade not null,
  receiver_id uuid references public.profiles(id) on delete cascade not null,
  skill_name text not null,
  status text default 'PENDING' check (status in ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED')),
  ai_summary text,
  scheduled_at timestamp with time zone,
  duration_minutes int default 45,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Reviews Table
create table if not exists public.reviews (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references public.sessions(id) on delete cascade not null,
  reviewer_id uuid references public.profiles(id) on delete cascade not null,
  reviewee_id uuid references public.profiles(id) on delete cascade not null,
  rating int check (rating >= 1 and rating <= 5) not null,
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Notifications Table
create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  message text not null,
  link text default '/dashboard',
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Messages Table (Session Planning & In-Dashboard Chat)
create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references public.sessions(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. Credit Ledger Table
create table if not exists public.credit_ledger (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  session_id uuid references public.sessions(id) on delete cascade,
  transaction_type text check (transaction_type in ('ESCROW', 'PAYOUT', 'REFUND', 'PLATFORM_FEE', 'PURCHASE')),
  amount int not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- Row Level Security (RLS) Policies
-- ==============================================================================

alter table public.profiles enable row level security;
alter table public.skills enable row level security;
alter table public.user_skills enable row level security;
alter table public.sessions enable row level security;
alter table public.reviews enable row level security;
alter table public.notifications enable row level security;
alter table public.messages enable row level security;

-- Profiles: Public read, owner update
create policy "Public profiles are viewable by everyone" on public.profiles
  for select using (true);

create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id);

-- Skills: Public read, authenticated insert
create policy "Skills are viewable by everyone" on public.skills
  for select using (true);

create policy "Authenticated users can add skills" on public.skills
  for insert with check (auth.role() = 'authenticated');

-- User Skills: Public read, owner manage
create policy "User skills viewable by everyone" on public.user_skills
  for select using (true);

create policy "Users can manage their own skills" on public.user_skills
  for all using (auth.uid() = user_id);

-- Sessions: Involved parties can view and manage
create policy "Participants can view their sessions" on public.sessions
  for select using (auth.uid() = requester_id or auth.uid() = receiver_id);

-- Notifications: Owner only
create policy "Users can view own notifications" on public.notifications
  for select using (auth.uid() = user_id);

create policy "Users can update own notifications" on public.notifications
  for update using (auth.uid() = user_id);

-- Messages: Session participants only
create policy "Participants can view session messages" on public.messages
  for select using (
    exists (
      select 1 from public.sessions s
      where s.id = session_id and (s.requester_id = auth.uid() or s.receiver_id = auth.uid())
    )
  );

create policy "Participants can send session messages" on public.messages
  for insert with check (
    auth.uid() = sender_id and
    exists (
      select 1 from public.sessions s
      where s.id = session_id and (s.requester_id = auth.uid() or s.receiver_id = auth.uid())
    )
  );

-- ==============================================================================
-- Automatic User Registration Trigger (50 Free Credits)
-- ==============================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, credits)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    50
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ==============================================================================
-- Atomic Credit Escrow Economy (Zero-Leakage Invariant Stored Procedures)
-- ==============================================================================

-- 1. Atomic RPC: Book Session With Escrow
create or replace function public.book_session_with_escrow(
  p_requester_id uuid,
  p_receiver_id uuid,
  p_skill_name text
)
returns json
language plpgsql
security definer
as $$
declare
  v_requester_credits int;
  v_new_session_id uuid;
begin
  -- Pessimistic locking on requester credit balance
  select credits into v_requester_credits
  from public.profiles
  where id = p_requester_id
  for update;

  if v_requester_credits is null then
    return json_build_object('error', 'User profile not found.');
  end if;

  if v_requester_credits < 10 then
    return json_build_object('error', 'Insufficient credits. You need at least 10 credits.');
  end if;

  -- Deduct 10 credits atomically into escrow
  update public.profiles
  set credits = credits - 10
  where id = p_requester_id;

  -- Create session in PENDING state
  insert into public.sessions (requester_id, receiver_id, skill_name, status)
  values (p_requester_id, p_receiver_id, p_skill_name, 'PENDING')
  returning id into v_new_session_id;

  -- Notify receiver
  insert into public.notifications (user_id, title, message, link)
  values (
    p_receiver_id,
    'New Swap Request! 🎯',
    'A peer requested a session for ' || p_skill_name || '. 10 credits held in escrow.',
    '/dashboard'
  );

  return json_build_object('success', true, 'session_id', v_new_session_id);
end;
$$;

-- 2. Atomic RPC: Cancel Session And Refund
create or replace function public.cancel_session_and_refund(
  p_session_id uuid,
  p_actor_id uuid
)
returns json
language plpgsql
security definer
as $$
declare
  v_session record;
begin
  select * into v_session from public.sessions where id = p_session_id for update;

  if v_session is null then
    return json_build_object('error', 'Session not found.');
  end if;

  if v_session.status = 'COMPLETED' then
    return json_build_object('error', 'Completed sessions cannot be refunded.');
  end if;

  if v_session.status = 'CANCELLED' then
    return json_build_object('error', 'Session is already cancelled.');
  end if;

  if p_actor_id != v_session.requester_id and p_actor_id != v_session.receiver_id then
    return json_build_object('error', 'Unauthorized.');
  end if;

  -- Refund 10 credits back to requester
  update public.profiles set credits = credits + 10 where id = v_session.requester_id;
  update public.sessions set status = 'CANCELLED' where id = p_session_id;

  -- Notify requester
  insert into public.notifications (user_id, title, message, link)
  values (
    v_session.requester_id,
    'Credits Refunded 🪙',
    'Your session for ' || v_session.skill_name || ' was cancelled. 10 credits returned.',
    '/dashboard'
  );

  return json_build_object('success', true);
end;
$$;

-- 3. Atomic RPC: Complete Session Payout
create or replace function public.complete_session_payout(p_session_id uuid)
returns json
language plpgsql
security definer
as $$
declare
  v_session record;
begin
  select * into v_session from public.sessions where id = p_session_id for update;

  if v_session is null or v_session.status != 'CONFIRMED' then
    return json_build_object('error', 'Session must be in CONFIRMED status to complete.');
  end if;

  -- Dynamic Economy: 10 Deducted (already escrowed), 7 Paid to Mentor, 3 Platform Fee (Burn)
  
  -- Payout 7 credits to the receiver (mentor/teacher)
  update public.profiles set credits = credits + 7 where id = v_session.receiver_id;
  update public.sessions set status = 'COMPLETED' where id = p_session_id;

  -- Log transaction in credit_ledger
  insert into public.credit_ledger (user_id, session_id, transaction_type, amount, description)
  values 
    (v_session.requester_id, p_session_id, 'ESCROW', -10, 'Session escrow settled for ' || v_session.skill_name),
    (v_session.receiver_id, p_session_id, 'PAYOUT', 7, 'Session payout for ' || v_session.skill_name),
    (null, p_session_id, 'PLATFORM_FEE', 3, 'Platform fee for ' || v_session.skill_name);

  -- Notify receiver
  insert into public.notifications (user_id, title, message, link)
  values (
    v_session.receiver_id,
    'Credits Earned! 🪙',
    'Your teaching session for ' || v_session.skill_name || ' was marked complete. +7 credits awarded.',
    '/dashboard'
  );

  return json_build_object('success', true);
end;
$$;

-- 4. Atomic RPC: Add User Credits (Purchase / Top-Up)
create or replace function public.add_user_credits(p_user_id uuid, p_amount int)
returns json
language plpgsql
security definer
as $$
declare
  v_new_balance int;
begin
  if p_amount <= 0 then
    return json_build_object('error', 'Amount must be positive.');
  end if;

  update public.profiles
  set credits = credits + p_amount
  where id = p_user_id
  returning credits into v_new_balance;

  return json_build_object('success', true, 'newBalance', v_new_balance);
end;
$$;

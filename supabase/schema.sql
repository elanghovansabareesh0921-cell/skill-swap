-- SkillSwap Database Schema Migration
-- Compatible with Supabase PostgreSQL (Run in Supabase Dashboard -> SQL Editor)

-- Enable pgvector extension (for AI semantic matching)
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. Profiles & Core Identity
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    languages TEXT[] NOT NULL DEFAULT '{"English"}',
    timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    city TEXT,
    country TEXT DEFAULT 'IN',
    phone_number TEXT UNIQUE,
    phone_verified BOOLEAN DEFAULT FALSE,
    is_onboarded BOOLEAN DEFAULT FALSE,
    age_confirmed BOOLEAN DEFAULT FALSE,
    is_accepting_requests BOOLEAN DEFAULT TRUE,
    strikes_count INT DEFAULT 0,
    reputation_score NUMERIC(3,2) DEFAULT 5.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Skill Taxonomy
CREATE TABLE IF NOT EXISTS public.skill_taxonomy (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL,
    name TEXT NOT NULL UNIQUE,
    synonyms TEXT[],
    min_hourly_rate INT NOT NULL DEFAULT 20,
    max_hourly_rate INT NOT NULL DEFAULT 1000,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. User Teaching & Learning Skills
CREATE TABLE IF NOT EXISTS public.user_skills_teach (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES public.skill_taxonomy(id),
    level TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    years_experience NUMERIC(3,1) DEFAULT 1,
    hourly_rate INT NOT NULL, -- Tokens/hr
    allowed_durations INT[] DEFAULT '{30, 45, 60, 90}',
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_skills_learn (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES public.skill_taxonomy(id),
    target_level TEXT CHECK (target_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    goal TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Wallets & Double-Entry Ledger (paise precision: 1 token = 100 paise)
CREATE TABLE IF NOT EXISTS public.wallets (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    available_paise BIGINT NOT NULL DEFAULT 0 CHECK (available_paise >= 0),
    held_paise BIGINT NOT NULL DEFAULT 0 CHECK (held_paise >= 0),
    lifetime_earned_paise BIGINT NOT NULL DEFAULT 0,
    lifetime_spent_paise BIGINT NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ledger_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_id TEXT NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('PURCHASE', 'HOLD', 'RELEASE', 'REFUND', 'FEE', 'ADJUSTMENT')),
    source_wallet_id UUID REFERENCES public.wallets(user_id),
    dest_wallet_id UUID REFERENCES public.wallets(user_id),
    amount_paise BIGINT NOT NULL,
    idempotency_key TEXT UNIQUE NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Offers & Sessions
CREATE TABLE IF NOT EXISTS public.offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('DIRECT', 'SWAP')),
    proposer_id UUID NOT NULL REFERENCES public.profiles(id),
    recipient_id UUID NOT NULL REFERENCES public.profiles(id),
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'CANCELLED', 'COMPLETED')),
    swap_factor NUMERIC(3,2) DEFAULT 0.30,
    quote_snapshot JSONB NOT NULL,
    message TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    offer_id UUID NOT NULL REFERENCES public.offers(id) ON DELETE CASCADE,
    leg_index INT NOT NULL,
    teacher_id UUID NOT NULL REFERENCES public.profiles(id),
    learner_id UUID NOT NULL REFERENCES public.profiles(id),
    skill_id UUID NOT NULL REFERENCES public.skill_taxonomy(id),
    duration_minutes INT NOT NULL,
    list_price_tokens INT NOT NULL,
    charged_tokens INT NOT NULL,
    platform_fee_tokens NUMERIC(6,2) NOT NULL,
    teacher_payout_tokens NUMERIC(6,2) NOT NULL,
    scheduled_start TIMESTAMPTZ,
    scheduled_end TIMESTAMPTZ,
    meet_link TEXT,
    status TEXT NOT NULL DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'PENDING_CONFIRMATION', 'SETTLED', 'DISPUTED', 'CANCELLED')),
    teacher_confirmed BOOLEAN DEFAULT FALSE,
    learner_confirmed BOOLEAN DEFAULT FALSE,
    dispute_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Temporary Chat Threads & Messages
CREATE TABLE IF NOT EXISTS public.chat_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    offer_id UUID NOT NULL UNIQUE REFERENCES public.offers(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'READ_ONLY', 'ARCHIVED')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID NOT NULL REFERENCES public.chat_threads(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id),
    content TEXT NOT NULL,
    message_type TEXT NOT NULL DEFAULT 'TEXT' CHECK (message_type IN ('TEXT', 'PROPOSE_TIME', 'TIME_CONFIRMED', 'SYSTEM_ALERT')),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Atomic Escrow Token Hold Stored Procedure
CREATE OR REPLACE FUNCTION hold_tokens_for_offer(
    p_user_id UUID,
    p_amount_paise BIGINT,
    p_idempotency_key TEXT,
    p_offer_id TEXT
) RETURNS VOID AS $$
DECLARE
    v_available BIGINT;
BEGIN
    SELECT available_paise INTO v_available FROM public.wallets WHERE user_id = p_user_id FOR UPDATE;
    IF v_available < p_amount_paise THEN
        RAISE EXCEPTION 'INSUFFICIENT_FUNDS';
    END IF;

    UPDATE public.wallets 
    SET available_paise = available_paise - p_amount_paise,
        held_paise = held_paise + p_amount_paise,
        updated_at = NOW()
    WHERE user_id = p_user_id;

    INSERT INTO public.ledger_transactions (reference_id, transaction_type, source_wallet_id, amount_paise, idempotency_key)
    VALUES (p_offer_id, 'HOLD', p_user_id, p_amount_paise, p_idempotency_key);
END;
$$ LANGUAGE plpgsql;

-- 8. Row Level Security (RLS) Setup
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Public can view active profiles
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Users can view their own wallet
CREATE POLICY "Users can view own wallet" ON public.wallets
    FOR SELECT USING (auth.uid() = user_id);

-- Seed initial skill taxonomy
INSERT INTO public.skill_taxonomy (name, category, min_hourly_rate, max_hourly_rate) VALUES
('Python Programming', 'Software & Tech', 30, 150),
('Rust & Systems Design', 'Software & Tech', 50, 200),
('UI/UX Design (Figma)', 'Design & Creative', 25, 120),
('Advanced Excel & VBA', 'Business & Finance', 20, 90),
('Acoustic Guitar', 'Music & Arts', 20, 80),
('Conversational Spanish', 'Languages', 25, 100),
('Public Speaking & Pitching', 'Personal Growth', 35, 140),
('Financial Modeling', 'Business & Finance', 40, 180)
ON CONFLICT (name) DO NOTHING;

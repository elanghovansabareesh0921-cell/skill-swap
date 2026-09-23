-- ==============================================================================
-- SkillSwap Production PostgreSQL Schema & Stored Procedures
-- Framework: Supabase (PostgreSQL 15+)
-- Architecture: Atomic Credit Escrow Economy, Realtime Collaboration, RLS
-- ==============================================================================

-- 1. Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. Core Relational Tables (Master Specification DDL)
-- ==============================================================================

-- Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    referral_source TEXT,
    role_preference TEXT CHECK (role_preference IN ('learner', 'teacher', 'both')),
    credits_balance INTEGER DEFAULT 100 CHECK (credits_balance >= 0),
    credentials_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    bio TEXT DEFAULT '',
    email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User skills (Offering & Learning)
CREATE TABLE IF NOT EXISTS public.user_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    skill_name TEXT NOT NULL,
    skill_type TEXT CHECK (skill_type IN ('teach', 'learn')),
    proficiency_level TEXT CHECK (proficiency_level IN ('beginner', 'intermediate', 'expert')),
    learning_goal TEXT DEFAULT '',
    years_experience INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teacher pricing packages
CREATE TABLE IF NOT EXISTS public.teacher_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    skill_name TEXT NOT NULL,
    session_rate_credits INTEGER NOT NULL CHECK (session_rate_credits > 0),
    full_course_rate_credits INTEGER CHECK (full_course_rate_credits IS NULL OR full_course_rate_credits > 0),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Swap requests & mutual match flow
CREATE TABLE IF NOT EXISTS public.swap_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    offered_skill TEXT NOT NULL,
    requested_skill TEXT NOT NULL,
    status TEXT CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled')) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Direct booking via credits
CREATE TABLE IF NOT EXISTS public.credit_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    learner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    package_id UUID REFERENCES public.teacher_packages(id) ON DELETE SET NULL,
    booking_type TEXT CHECK (booking_type IN ('per_session', 'full_course')),
    credits_amount INTEGER NOT NULL CHECK (credits_amount > 0),
    escrow_status TEXT CHECK (escrow_status IN ('held', 'released', 'refunded')) DEFAULT 'held',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mutual private chat threads
CREATE TABLE IF NOT EXISTS public.chat_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_one UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    participant_two UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    source_type TEXT CHECK (source_type IN ('swap_match', 'credit_booking')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Session rooms (Virtual Classroom)
CREATE TABLE IF NOT EXISTS public.session_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES public.credit_bookings(id) ON DELETE SET NULL,
    scheduled_start TIMESTAMPTZ NOT NULL,
    scheduled_end TIMESTAMPTZ NOT NULL,
    room_token TEXT NOT NULL UNIQUE,
    status TEXT CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')) DEFAULT 'scheduled',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat messages table (supports Supabase Realtime for private messaging)
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_room_id UUID REFERENCES public.session_rooms(id) ON DELETE SET NULL,
    reviewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    reviewee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT DEFAULT '/dashboard',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 3. Row Level Security (RLS) Policies
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swap_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: Public read, owner update
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- User skills: Public read, owner manage
CREATE POLICY "User skills are viewable by everyone" ON public.user_skills
    FOR SELECT USING (true);
CREATE POLICY "Users can manage their own skills" ON public.user_skills
    FOR ALL USING (auth.uid() = user_id);

-- Teacher packages: Public read, teacher manage
CREATE POLICY "Packages are viewable by everyone" ON public.teacher_packages
    FOR SELECT USING (true);
CREATE POLICY "Teachers can manage their own packages" ON public.teacher_packages
    FOR ALL USING (auth.uid() = teacher_id);

-- Swap requests: Involved parties can view and update
CREATE POLICY "Participants can view their swap requests" ON public.swap_requests
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can create swap requests" ON public.swap_requests
    FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Receiver or sender can update swap status" ON public.swap_requests
    FOR UPDATE USING (auth.uid() = receiver_id OR auth.uid() = sender_id);

-- Credit bookings: Involved parties can view
CREATE POLICY "Participants can view credit bookings" ON public.credit_bookings
    FOR SELECT USING (auth.uid() = learner_id OR auth.uid() = teacher_id);

-- Chat rooms: Only members can view
CREATE POLICY "Participants can view chat rooms" ON public.chat_rooms
    FOR SELECT USING (auth.uid() = participant_one OR auth.uid() = participant_two);

-- Chat messages: Participants only
CREATE POLICY "Participants can view chat messages" ON public.chat_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.chat_rooms cr
            WHERE cr.id = chat_room_id AND (cr.participant_one = auth.uid() OR cr.participant_two = auth.uid())
        )
    );
CREATE POLICY "Participants can insert chat messages" ON public.chat_messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id AND
        EXISTS (
            SELECT 1 FROM public.chat_rooms cr
            WHERE cr.id = chat_room_id AND (cr.participant_one = auth.uid() OR cr.participant_two = auth.uid())
        )
    );

-- Session rooms: Participants can view
CREATE POLICY "Participants can view session rooms" ON public.session_rooms
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.chat_rooms cr
            WHERE cr.id = chat_room_id AND (cr.participant_one = auth.uid() OR cr.participant_two = auth.uid())
        )
    );

-- Notifications: User only
CREATE POLICY "Users can view their notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Reviews: Viewable by all, insert by authenticated participants
CREATE POLICY "Reviews viewable by everyone" ON public.reviews
    FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create reviews" ON public.reviews
    FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- ==============================================================================
-- 4. Auth Registration Trigger (100 Baseline Free Credits)
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        full_name,
        email,
        credits_balance,
        role_preference,
        is_verified
    )
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        new.email,
        100, -- Default baseline credits from Master Specification
        COALESCE(new.raw_user_meta_data->>'role_preference', 'both'),
        FALSE
    );
    RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==============================================================================
-- 5. Atomic Escrow & Swap Stored Procedures (Zero-Leakage Invariants)
-- ==============================================================================

-- A. Accept Swap Request & Create Chat Room
CREATE OR REPLACE FUNCTION public.accept_swap_request_and_create_room(
    p_request_id UUID,
    p_user_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_req RECORD;
    v_chat_room_id UUID;
BEGIN
    SELECT * INTO v_req FROM public.swap_requests WHERE id = p_request_id FOR UPDATE;

    IF v_req IS NULL THEN
        RETURN json_build_object('error', 'Swap request not found');
    END IF;

    IF v_req.receiver_id != p_user_id AND v_req.sender_id != p_user_id THEN
        RETURN json_build_object('error', 'Unauthorized to accept this swap request');
    END IF;

    IF v_req.status != 'pending' THEN
        RETURN json_build_object('error', 'Request is already ' || v_req.status);
    END IF;

    -- Update request status to accepted
    UPDATE public.swap_requests SET status = 'accepted' WHERE id = p_request_id;

    -- Provision private chat room
    INSERT INTO public.chat_rooms (participant_one, participant_two, source_type)
    VALUES (v_req.sender_id, v_req.receiver_id, 'swap_match')
    RETURNING id INTO v_chat_room_id;

    -- Send initial system welcome message
    INSERT INTO public.chat_messages (chat_room_id, sender_id, content)
    VALUES (
        v_chat_room_id,
        v_req.receiver_id,
        'Swap request accepted! 🤝 Let''s coordinate our session date and time using the scheduler above.'
    );

    -- Notify sender
    INSERT INTO public.notifications (user_id, title, message, link)
    VALUES (
        v_req.sender_id,
        'Swap Accepted! 🎉',
        'Your swap request for ' || v_req.requested_skill || ' was accepted. Open chat to schedule!',
        '/messages?roomId=' || v_chat_room_id
    );

    RETURN json_build_object(
        'success', true,
        'chat_room_id', v_chat_room_id,
        'status', 'accepted'
    );
END;
$$;

-- B. Direct Booking via Credits with Atomic Escrow Hold
CREATE OR REPLACE FUNCTION public.book_teacher_package_escrow(
    p_learner_id UUID,
    p_teacher_id UUID,
    p_package_id UUID,
    p_booking_type TEXT,
    p_scheduled_start TIMESTAMPTZ,
    p_scheduled_end TIMESTAMPTZ
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_learner_balance INTEGER;
    v_cost INTEGER;
    v_pkg RECORD;
    v_booking_id UUID;
    v_chat_room_id UUID;
    v_session_room_id UUID;
    v_token TEXT;
BEGIN
    -- Validate package
    SELECT * INTO v_pkg FROM public.teacher_packages WHERE id = p_package_id;
    IF v_pkg IS NULL THEN
        RETURN json_build_object('error', 'Teacher package not found');
    END IF;

    IF p_booking_type = 'full_course' THEN
        v_cost := COALESCE(v_pkg.full_course_rate_credits, v_pkg.session_rate_credits * 4);
    ELSE
        v_cost := v_pkg.session_rate_credits;
    END IF;

    -- Pessimistic locking on learner balance
    SELECT credits_balance INTO v_learner_balance
    FROM public.profiles
    WHERE id = p_learner_id
    FOR UPDATE;

    IF v_learner_balance IS NULL THEN
        RETURN json_build_object('error', 'Learner profile not found');
    END IF;

    IF v_learner_balance < v_cost THEN
        RETURN json_build_object('error', 'Insufficient credits. Required: ' || v_cost || ', available: ' || v_learner_balance);
    END IF;

    -- Deduct credits into escrow (lock)
    UPDATE public.profiles
    SET credits_balance = credits_balance - v_cost
    WHERE id = p_learner_id;

    -- Create credit booking with escrow_status = 'held'
    INSERT INTO public.credit_bookings (
        learner_id,
        teacher_id,
        package_id,
        booking_type,
        credits_amount,
        escrow_status
    )
    VALUES (
        p_learner_id,
        p_teacher_id,
        p_package_id,
        p_booking_type,
        v_cost,
        'held'
    )
    RETURNING id INTO v_booking_id;

    -- Provision chat room
    INSERT INTO public.chat_rooms (participant_one, participant_two, source_type)
    VALUES (p_learner_id, p_teacher_id, 'credit_booking')
    RETURNING id INTO v_chat_room_id;

    -- Generate room token
    v_token := 'room-' || replace(gen_random_uuid()::text, '-', '');

    -- Provision session room
    INSERT INTO public.session_rooms (
        chat_room_id,
        booking_id,
        scheduled_start,
        scheduled_end,
        room_token,
        status
    )
    VALUES (
        v_chat_room_id,
        v_booking_id,
        p_scheduled_start,
        p_scheduled_end,
        v_token,
        'scheduled'
    )
    RETURNING id INTO v_session_room_id;

    -- Notify teacher
    INSERT INTO public.notifications (user_id, title, message, link)
    VALUES (
        p_teacher_id,
        'New Direct Booking! 🪙',
        'A learner booked a session for ' || v_pkg.skill_name || '. ' || v_cost || ' credits held in escrow.',
        '/learn/' || v_token
    );

    RETURN json_build_object(
        'success', true,
        'booking_id', v_booking_id,
        'chat_room_id', v_chat_room_id,
        'session_room_id', v_session_room_id,
        'room_token', v_token,
        'credits_held', v_cost
    );
END;
$$;

-- C. Release Escrow to Teacher Upon Completion
CREATE OR REPLACE FUNCTION public.release_booking_escrow(
    p_booking_id UUID,
    p_actor_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_booking RECORD;
BEGIN
    SELECT * INTO v_booking FROM public.credit_bookings WHERE id = p_booking_id FOR UPDATE;

    IF v_booking IS NULL THEN
        RETURN json_build_object('error', 'Booking not found');
    END IF;

    IF v_booking.escrow_status != 'held' THEN
        RETURN json_build_object('error', 'Escrow status is already ' || v_booking.escrow_status);
    END IF;

    IF p_actor_id != v_booking.learner_id AND p_actor_id != v_booking.teacher_id THEN
        RETURN json_build_object('error', 'Unauthorized to release escrow for this booking');
    END IF;

    -- Release credits to teacher's wallet
    UPDATE public.profiles
    SET credits_balance = credits_balance + v_booking.credits_amount
    WHERE id = v_booking.teacher_id;

    -- Mark escrow released
    UPDATE public.credit_bookings
    SET escrow_status = 'released'
    WHERE id = p_booking_id;

    -- Mark session room completed
    UPDATE public.session_rooms
    SET status = 'completed'
    WHERE booking_id = p_booking_id;

    -- Notify teacher
    INSERT INTO public.notifications (user_id, title, message, link)
    VALUES (
        v_booking.teacher_id,
        'Escrow Released! 💰',
        'Session completed! +' || v_booking.credits_amount || ' credits deposited to your wallet.',
        '/dashboard'
    );

    RETURN json_build_object(
        'success', true,
        'released_amount', v_booking.credits_amount,
        'teacher_id', v_booking.teacher_id
    );
END;
$$;

-- D. Refund Escrow to Learner Upon Cancellation
CREATE OR REPLACE FUNCTION public.refund_booking_escrow(
    p_booking_id UUID,
    p_actor_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_booking RECORD;
BEGIN
    SELECT * INTO v_booking FROM public.credit_bookings WHERE id = p_booking_id FOR UPDATE;

    IF v_booking IS NULL THEN
        RETURN json_build_object('error', 'Booking not found');
    END IF;

    IF v_booking.escrow_status != 'held' THEN
        RETURN json_build_object('error', 'Cannot refund booking with status ' || v_booking.escrow_status);
    END IF;

    IF p_actor_id != v_booking.learner_id AND p_actor_id != v_booking.teacher_id THEN
        RETURN json_build_object('error', 'Unauthorized');
    END IF;

    -- Refund credits back to learner
    UPDATE public.profiles
    SET credits_balance = credits_balance + v_booking.credits_amount
    WHERE id = v_booking.learner_id;

    -- Mark escrow refunded
    UPDATE public.credit_bookings
    SET escrow_status = 'refunded'
    WHERE id = p_booking_id;

    -- Mark session room cancelled
    UPDATE public.session_rooms
    SET status = 'cancelled'
    WHERE booking_id = p_booking_id;

    -- Notify learner
    INSERT INTO public.notifications (user_id, title, message, link)
    VALUES (
        v_booking.learner_id,
        'Credits Refunded 🪙',
        'Booking cancelled. ' || v_booking.credits_amount || ' credits returned to your wallet.',
        '/dashboard'
    );

    RETURN json_build_object('success', true, 'refunded_amount', v_booking.credits_amount);
END;
$$;

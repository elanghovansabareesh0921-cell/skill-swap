ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS languages TEXT[] NOT NULL DEFAULT '{"English"}',
  ADD COLUMN IF NOT EXISTS timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'IN',
  ADD COLUMN IF NOT EXISTS phone_number TEXT,
  ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS age_confirmed BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_accepting_requests BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS strikes_count INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS reputation_score NUMERIC(3,2) DEFAULT 5.00,
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS availability JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_phone_number_unique_idx
  ON public.profiles (phone_number)
  WHERE phone_number IS NOT NULL;

DO $$
BEGIN
  IF to_regclass('public.legacy_sessions') IS NOT NULL OR to_regclass('public.legacy_reviews') IS NOT NULL THEN
    RAISE EXCEPTION 'Legacy backup table already exists; refusing to rename potentially preserved data';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'sessions' AND column_name = 'requester_id'
  ) THEN
    ALTER TABLE public.sessions RENAME TO legacy_sessions;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'reviews' AND column_name = 'comment'
  ) THEN
    ALTER TABLE public.reviews RENAME TO legacy_reviews;
  END IF;
END;
$$;

CREATE TABLE IF NOT EXISTS public.skill_taxonomy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  name TEXT NOT NULL UNIQUE,
  synonyms TEXT[],
  min_hourly_rate INT NOT NULL DEFAULT 20,
  max_hourly_rate INT NOT NULL DEFAULT 1000,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.skills
  ADD COLUMN IF NOT EXISTS min_hourly_rate INT NOT NULL DEFAULT 20,
  ADD COLUMN IF NOT EXISTS max_hourly_rate INT NOT NULL DEFAULT 1000;

INSERT INTO public.skill_taxonomy (name, category, min_hourly_rate, max_hourly_rate)
SELECT DISTINCT ON (lower(trim(source.name)))
  trim(source.name),
  COALESCE(NULLIF(source.category, ''), 'Other'),
  GREATEST(COALESCE(source.min_hourly_rate, 20), 1),
  GREATEST(COALESCE(source.max_hourly_rate, 1000), GREATEST(COALESCE(source.min_hourly_rate, 20), 1))
FROM public.skills AS source
WHERE NULLIF(trim(source.name), '') IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.skill_taxonomy AS existing
    WHERE lower(existing.name) = lower(trim(source.name))
  )
ORDER BY lower(trim(source.name)), source.id;

INSERT INTO public.skill_taxonomy (name, category, min_hourly_rate, max_hourly_rate)
SELECT legacy_skill.name, 'Other', 20, 1000
FROM (
  SELECT unnest(COALESCE(skills_teach, ARRAY[]::TEXT[])) AS name FROM public.profiles
  UNION ALL
  SELECT unnest(COALESCE(skills_learn, ARRAY[]::TEXT[])) AS name FROM public.profiles
) AS legacy_skill
WHERE NULLIF(trim(legacy_skill.name), '') IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.skill_taxonomy AS existing
    WHERE lower(existing.name) = lower(trim(legacy_skill.name))
  )
GROUP BY legacy_skill.name;

INSERT INTO public.skill_taxonomy (name, category, min_hourly_rate, max_hourly_rate)
SELECT seed.name, seed.category, seed.min_rate, seed.max_rate
FROM (VALUES
  ('Python Programming', 'Software & Tech', 30, 150),
  ('Rust & Systems Design', 'Software & Tech', 50, 200),
  ('UI/UX Design (Figma)', 'Design & Creative', 25, 120),
  ('Advanced Excel & VBA', 'Business & Finance', 20, 90),
  ('Acoustic Guitar', 'Music & Arts', 20, 80),
  ('Conversational Spanish', 'Languages', 25, 100),
  ('Public Speaking & Pitching', 'Personal Growth', 35, 140),
  ('Financial Modeling', 'Business & Finance', 40, 180)
) AS seed(name, category, min_rate, max_rate)
WHERE NOT EXISTS (
  SELECT 1 FROM public.skill_taxonomy AS existing
  WHERE lower(existing.name) = lower(seed.name)
);

CREATE UNIQUE INDEX IF NOT EXISTS skill_taxonomy_lower_name_unique_idx
  ON public.skill_taxonomy (lower(name));

CREATE TABLE IF NOT EXISTS public.user_skills_teach (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.skill_taxonomy(id),
  level TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  years_experience NUMERIC(3,1) NOT NULL DEFAULT 1,
  hourly_rate INT NOT NULL,
  allowed_durations INT[] NOT NULL DEFAULT '{30, 45, 60, 90}',
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_skills_learn (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.skill_taxonomy(id),
  target_level TEXT CHECK (target_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  goal TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.user_skills WHERE upper(skill_type) NOT IN ('TEACH', 'LEARN')) THEN
    RAISE EXCEPTION 'Unexpected skill_type in public.user_skills; refusing to drop unmapped records';
  END IF;
END;
$$;

INSERT INTO public.user_skills_teach (
  user_id, skill_id, level, years_experience, hourly_rate, allowed_durations
)
SELECT
  legacy.user_id,
  taxonomy.id,
  CASE WHEN lower(legacy.level) IN ('beginner', 'intermediate', 'advanced', 'expert') THEN lower(legacy.level) ELSE 'intermediate' END,
  1,
  GREATEST(COALESCE(source_skill.min_hourly_rate, taxonomy.min_hourly_rate, 20), 1),
  '{30, 45, 60, 90}'
FROM public.user_skills AS legacy
JOIN public.skills AS source_skill ON source_skill.id = legacy.skill_id
JOIN public.skill_taxonomy AS taxonomy ON lower(taxonomy.name) = lower(source_skill.name)
WHERE upper(legacy.skill_type) = 'TEACH';

INSERT INTO public.user_skills_learn (user_id, skill_id, target_level, goal)
SELECT
  legacy.user_id,
  taxonomy.id,
  CASE WHEN lower(legacy.level) IN ('beginner', 'intermediate', 'advanced', 'expert') THEN lower(legacy.level) ELSE 'beginner' END,
  legacy.goal
FROM public.user_skills AS legacy
JOIN public.skills AS source_skill ON source_skill.id = legacy.skill_id
JOIN public.skill_taxonomy AS taxonomy ON lower(taxonomy.name) = lower(source_skill.name)
WHERE upper(legacy.skill_type) = 'LEARN';

INSERT INTO public.user_skills_teach (user_id, skill_id, level, years_experience, hourly_rate, allowed_durations)
SELECT profile.id, taxonomy.id, 'intermediate', 1, taxonomy.min_hourly_rate, '{30, 45, 60, 90}'
FROM public.profiles AS profile
CROSS JOIN LATERAL unnest(COALESCE(profile.skills_teach, ARRAY[]::TEXT[])) AS skill_name
JOIN public.skill_taxonomy AS taxonomy ON lower(taxonomy.name) = lower(trim(skill_name))
WHERE NULLIF(trim(skill_name), '') IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.user_skills_teach AS existing
    WHERE existing.user_id = profile.id AND existing.skill_id = taxonomy.id
  );

INSERT INTO public.user_skills_learn (user_id, skill_id, target_level)
SELECT profile.id, taxonomy.id, 'beginner'
FROM public.profiles AS profile
CROSS JOIN LATERAL unnest(COALESCE(profile.skills_learn, ARRAY[]::TEXT[])) AS skill_name
JOIN public.skill_taxonomy AS taxonomy ON lower(taxonomy.name) = lower(trim(skill_name))
WHERE NULLIF(trim(skill_name), '') IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.user_skills_learn AS existing
    WHERE existing.user_id = profile.id AND existing.skill_id = taxonomy.id
  );

DROP TABLE public.user_skills;
DROP TABLE public.skills;
ALTER TABLE public.profiles DROP COLUMN skills_teach, DROP COLUMN skills_learn;

CREATE TABLE IF NOT EXISTS public.wallets (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  available_paise BIGINT NOT NULL DEFAULT 0 CHECK (available_paise >= 0),
  held_paise BIGINT NOT NULL DEFAULT 0 CHECK (held_paise >= 0),
  lifetime_earned_paise BIGINT NOT NULL DEFAULT 0,
  lifetime_spent_paise BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ledger_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_id TEXT NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('PURCHASE', 'HOLD', 'RELEASE', 'REFUND', 'FEE', 'ADJUSTMENT')),
  source_wallet_id UUID REFERENCES public.wallets(user_id) ON DELETE CASCADE,
  dest_wallet_id UUID REFERENCES public.wallets(user_id) ON DELETE CASCADE,
  amount_paise BIGINT NOT NULL,
  idempotency_key TEXT UNIQUE NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.wallets (user_id, available_paise)
SELECT id, GREATEST(COALESCE(credits, 0), 0)::BIGINT * 100
FROM public.profiles
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.ledger_transactions (
  reference_id, transaction_type, source_wallet_id, amount_paise, idempotency_key, metadata
)
SELECT
  'legacy-opening-' || profile.id::TEXT,
  'ADJUSTMENT',
  profile.id,
  wallet.available_paise,
  'legacy-opening-' || profile.id::TEXT,
  jsonb_build_object('description', 'Opening balance migrated from legacy profile credits', 'legacyCredits', profile.credits)
FROM public.profiles AS profile
JOIN public.wallets AS wallet ON wallet.user_id = profile.id
WHERE wallet.available_paise > 0
  AND NOT EXISTS (
    SELECT 1 FROM public.ledger_transactions AS existing
    WHERE existing.idempotency_key = 'legacy-opening-' || profile.id::TEXT
  );

CREATE TABLE IF NOT EXISTS public.offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('DIRECT', 'SWAP')),
  proposer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'CANCELLED', 'COMPLETED')),
  swap_factor NUMERIC(3,2) DEFAULT 0.30,
  quote_snapshot JSONB NOT NULL,
  message TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id UUID NOT NULL REFERENCES public.offers(id) ON DELETE CASCADE,
  leg_index INT NOT NULL,
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  learner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES public.skill_taxonomy(id) ON DELETE SET NULL,
  skill_name TEXT NOT NULL DEFAULT 'Skill',
  duration_minutes INT NOT NULL,
  list_price_tokens INT NOT NULL,
  charged_tokens INT NOT NULL,
  platform_fee_tokens NUMERIC(6,2) NOT NULL,
  teacher_payout_tokens NUMERIC(6,2) NOT NULL,
  scheduled_start TIMESTAMPTZ,
  scheduled_end TIMESTAMPTZ,
  meet_link TEXT,
  status TEXT NOT NULL DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'PENDING_CONFIRMATION', 'SETTLED', 'DISPUTED', 'CANCELLED')),
  teacher_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
  learner_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
  dispute_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.chat_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id UUID NOT NULL UNIQUE REFERENCES public.offers(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'READ_ONLY', 'ARCHIVED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES public.chat_threads(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'TEXT' CHECK (message_type IN ('TEXT', 'PROPOSE_TIME', 'TIME_CONFIRMED', 'SYSTEM_ALERT')),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  feedback TEXT,
  tags TEXT[],
  is_revealed BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS user_skills_teach_user_id_idx ON public.user_skills_teach (user_id);
CREATE INDEX IF NOT EXISTS user_skills_learn_user_id_idx ON public.user_skills_learn (user_id);

DO $$
DECLARE
  old_policy RECORD;
BEGIN
  FOR old_policy IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles'
  LOOP
    EXECUTE format('DROP POLICY %I ON public.profiles', old_policy.policyname);
  END LOOP;
END;
$$;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_taxonomy ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills_teach ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills_learn ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ledger_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_public_select" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_user_insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = id);
CREATE POLICY "profiles_user_update" ON public.profiles FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = id) WITH CHECK ((SELECT auth.uid()) = id);
CREATE POLICY "skill_taxonomy_public_select" ON public.skill_taxonomy FOR SELECT USING (true);
CREATE POLICY "teach_skills_public_select" ON public.user_skills_teach FOR SELECT USING (true);
CREATE POLICY "teach_skills_owner_manage" ON public.user_skills_teach FOR ALL TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "learn_skills_public_select" ON public.user_skills_learn FOR SELECT USING (true);
CREATE POLICY "learn_skills_owner_manage" ON public.user_skills_learn FOR ALL TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "wallet_owner_select" ON public.wallets FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "ledger_owner_select" ON public.ledger_transactions FOR SELECT TO authenticated USING (
  (SELECT auth.uid()) = source_wallet_id OR (SELECT auth.uid()) = dest_wallet_id
);
CREATE POLICY "offer_party_select" ON public.offers FOR SELECT TO authenticated USING (
  (SELECT auth.uid()) = proposer_id OR (SELECT auth.uid()) = recipient_id
);
CREATE POLICY "offer_proposer_insert" ON public.offers FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = proposer_id);
CREATE POLICY "offer_party_update" ON public.offers FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = proposer_id OR (SELECT auth.uid()) = recipient_id)
  WITH CHECK ((SELECT auth.uid()) = proposer_id OR (SELECT auth.uid()) = recipient_id);
CREATE POLICY "session_participant_select" ON public.sessions FOR SELECT TO authenticated USING (
  (SELECT auth.uid()) = teacher_id OR (SELECT auth.uid()) = learner_id
);
CREATE POLICY "session_participant_update" ON public.sessions FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = teacher_id OR (SELECT auth.uid()) = learner_id)
  WITH CHECK ((SELECT auth.uid()) = teacher_id OR (SELECT auth.uid()) = learner_id);
CREATE POLICY "chat_thread_party_select" ON public.chat_threads FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.offers AS offer
    WHERE offer.id = offer_id
      AND ((SELECT auth.uid()) = offer.proposer_id OR (SELECT auth.uid()) = offer.recipient_id)
  )
);
CREATE POLICY "chat_message_party_select" ON public.chat_messages FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1
    FROM public.chat_threads AS thread
    JOIN public.offers AS offer ON offer.id = thread.offer_id
    WHERE thread.id = thread_id
      AND ((SELECT auth.uid()) = offer.proposer_id OR (SELECT auth.uid()) = offer.recipient_id)
  )
);
CREATE POLICY "chat_message_party_insert" ON public.chat_messages FOR INSERT TO authenticated WITH CHECK (
  (SELECT auth.uid()) = sender_id
  AND EXISTS (
    SELECT 1
    FROM public.chat_threads AS thread
    JOIN public.offers AS offer ON offer.id = thread.offer_id
    WHERE thread.id = thread_id
      AND ((SELECT auth.uid()) = offer.proposer_id OR (SELECT auth.uid()) = offer.recipient_id)
  )
);
CREATE POLICY "revealed_reviews_select" ON public.reviews FOR SELECT USING (is_revealed = TRUE);
CREATE POLICY "session_participant_review_insert" ON public.reviews FOR INSERT TO authenticated WITH CHECK (
  (SELECT auth.uid()) = reviewer_id
  AND EXISTS (
    SELECT 1 FROM public.sessions AS session
    WHERE session.id = session_id
      AND ((SELECT auth.uid()) = session.teacher_id OR (SELECT auth.uid()) = session.learner_id)
  )
);

ALTER TABLE public.legacy_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legacy_reviews ENABLE ROW LEVEL SECURITY;
DO $$
DECLARE
  old_policy RECORD;
BEGIN
  FOR old_policy IN
    SELECT tablename, policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename IN ('legacy_sessions', 'legacy_reviews')
  LOOP
    EXECUTE format('DROP POLICY %I ON public.%I', old_policy.policyname, old_policy.tablename);
  END LOOP;
END;
$$;
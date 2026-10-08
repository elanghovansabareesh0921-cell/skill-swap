# SkillSwap — Product Requirements Document (PRD)

| | |
|---|---|
| **Version** | 0.2 — draft for review (swap model made core) |
| **Date** | 29 Sep 2026 |
| **Product** | SkillSwap (working name) — web application |
| **Status** | Draft. Decisions I had to assume are in §13; questions that need your answer are in §14 |
| **Companion doc** | `architecture.md` |

**Priority key:** **P0** = required for MVP launch · **P1** = fast follow (first ~3 months after launch) · **P2** = later

---

## 1. Overview

### 1.1 Problem
People have skills they could teach and skills they want to learn, but:
- Paid tutors are expensive, and informal "I'll teach you if you teach me" exchanges fall apart on trust, scheduling and no-shows.
- There is no protection: nobody knows if the other person will show up, and nobody is accountable if they don't.
- Finding the *right* person to learn from is hard on general marketplaces.

### 1.2 Solution
SkillSwap is a **peer-to-peer skill-exchange marketplace**. Members trade skills with each other using **tokens** (1 token = ₹1), and the token cost depends on whether there is something to swap:

| Situation | Token cost |
|---|---|
| **Swap** — two members each want to learn the other's skill | **Much lower** — most of the value is exchanged in kind, so only a reduced swap price is paid (§7.6A) |
| **Direct** — a member has no skill to offer (or the teacher doesn't want what they offer) and simply learns from someone | **Full price** — the teacher's hourly rate × duration |

How it works:

1. A member buys tokens through a payment gateway.
2. They find a person to learn from — ideally a **swap match** surfaced by the **AI Radar**, where both sides want what the other teaches — and send an **offer** (swap or direct). Their tokens are locked in **escrow**.
3. The other member **approves or declines**. On approval, a **temporary chat** opens (and, for a swap, their own tokens lock too).
4. In the chat the two members agree a time (or two times, for a swap); the platform creates a **Google Meet** link for each session.
5. After each session, both confirm; escrow releases the tokens to that session's teacher (minus a platform fee).

### 1.3 Value proposition
| For | Value |
|---|---|
| **Learners** | Affordable — swapping skills costs far fewer tokens than buying lessons outright; well-matched; protected — tokens only move once the session happens |
| **Teachers** | Turn what they know into guaranteed, escrow-backed earnings; no chasing payment |
| **Platform** | Fee on each settled session; token purchases create recurring engagement |

---

## 2. Goals and non-goals

### 2.1 Goals (MVP)
- G1. A new user can sign up, complete onboarding, and see relevant matches in **under 5 minutes**.
- G2. A learner can go from "found a teacher" to "session scheduled with a Meet link" in **under 10 minutes of active time** (excluding the teacher's response time).
- G3. **Money is never lost, duplicated, or stuck.** Every token movement is traceable and reconcilable to gateway records.
- G4. Admins can run the platform day-to-day (users, disputes, refunds, content) without engineering help.
- G5. Users can get answers to common questions instantly via the FAQ chatbot, reducing support load.
- G6. Make swapping clearly the cheapest way to learn: a member who can teach something pays a fraction of what a learner-only member pays, and the product makes that saving visible before they commit.

### 2.2 Non-goals (MVP)
- Hosting our own video calls (we use Google Meet).
- Pre-recorded courses, group classes, or a content library.
- Native mobile apps (responsive web only).
- Cash withdrawal of earned tokens (see §14, Q1 — this is a legal/design decision).
- International payments or multi-currency.
- In-house identity/KYC verification (deferred; see §9).

---

## 3. Success metrics

Targets are starting hypotheses for the first 90 days after launch; calibrate after beta.

| Metric | Definition | Target |
|---|---|---|
| Onboarding completion | Signed-up users who finish onboarding | ≥ 65% |
| Activation | Users who send or receive an offer within 7 days of signup | ≥ 30% |
| Offer acceptance rate | Accepted ÷ (accepted + declined + expired) | ≥ 55% |
| Median time-to-accept | Offer sent → teacher decision | ≤ 12 h |
| Session completion rate | Settled sessions ÷ accepted offers | ≥ 80% |
| Dispute rate | Disputed ÷ completed sessions | ≤ 3% |
| Match quality | Offers sent from Radar ÷ Radar impressions | ≥ 8% |
| Repeat rate | Learners with ≥ 2 sessions in 30 days | ≥ 35% |
| Swap share | Swap sessions ÷ all settled sessions | ≥ 40% |
| Swap conversion | Swap price previews viewed → swap proposals sent | ≥ 25% |
| Token GMV | Tokens purchased per month | Track (no target yet) |
| Chatbot deflection | FAQ chats resolved without a support ticket | ≥ 70% |

---

## 4. Users and personas

| Persona | Description | Key needs |
|---|---|---|
| **Learner (Asha)** | Student or working professional who wants to learn a specific skill | Find a credible, affordable teacher fast; safe payment; easy scheduling |
| **Teacher (Ravi)** | Skilled hobbyist or professional who wants to earn from what they know | Fair pricing; control over availability; reliable payment; low admin overhead |
| **Swapper** | Teaches one thing and wants to learn another — the core peer-to-peer member. The same account is teacher and learner | Find someone whose wants and offers mirror theirs; pay far fewer tokens; two sessions coordinated in one place |
| **Learner-only** | Has no skill to offer (yet) and buys lessons at full price | A clear path to add a teachable skill and unlock swap pricing |
| **Admin / Support / Finance / Moderator** | Internal staff | Visibility, control, and audit trails without touching the database |

Members must be **18+** (assumption — see §14).

---

## 5. Core concepts (glossary)

| Term | Meaning |
|---|---|
| **Token** | Platform unit of value. **1 token = ₹1.** Whole-rupee display; stored internally in paise to allow fee maths without rounding errors |
| **Wallet** | A member's token balance: *Available* (spendable) and *Held* (in escrow for pending/active sessions) |
| **Offer** | A proposal to another member: either **Direct** (I learn from you and pay full price) or **Swap** (we teach each other). Sending it locks the proposer's tokens |
| **Leg** | One taught session inside an offer. A direct offer has one leg; a swap has two (A teaches B, B teaches A), each with its own escrow, time, Meet link and settlement |
| **List price** | Teacher's hourly rate × session duration — what a learner pays in a direct offer |
| **Swap price** | The reduced token amount charged per leg in a swap (formula in §7.6A) |
| **Swap factor** | Configurable share of the in-kind value that is still charged in a swap (default 30%) |
| **Escrow** | Tokens held by the platform until the session is settled, declined, expired or cancelled |
| **Session** | One taught leg of an accepted offer: a scheduled time, a Meet link and a settlement outcome. The offer's chat thread is shared by its sessions |
| **Temp chat** | Chat thread that exists only for an offer's session(s): opens on acceptance, closes after all sessions settle |
| **AI Radar** | The recommendation engine that ranks teachers for a learner based on onboarding answers and behaviour |
| **Strike** | A penalty recorded against a member for a no-show or last-minute cancellation |
| **Platform fee** | Percentage of session tokens retained by SkillSwap on settlement |

---

## 6. End-to-end user journey

### 6.1 Happy path (direct learn)
1. **Sign up / log in** (email + password, or Google). Verify email.
2. **Onboarding** — answer questions about what you want to learn, what you can teach, level, availability, languages and budget (§7.3).
3. **AI Radar** shows a ranked list of teachers with a match score and a short "why".
4. Learner opens a teacher profile and clicks **Request session**: picks skill, duration and preferred time window, and sees the price for **Direct** and — if they have a skill to teach — **Swap** side by side (§6.2). They confirm the option they want.
5. If the wallet is short, the learner is taken to **Buy tokens** (Razorpay checkout) and returns to the offer.
6. On submit, tokens move **Available → Held**. The teacher is notified (email + in-app).
7. Teacher **accepts** (or declines / lets it expire → automatic full refund).
8. On acceptance a **temporary chat** opens for both.
9. In chat, either member **proposes a time**; the other confirms. The platform creates a **Google Meet link** and sends calendar invites + reminders.
10. At the scheduled time both join the Meet.
11. After the session both tap **Confirm completed**. Escrow releases: teacher receives tokens minus fee; platform records revenue.
12. Both leave a **double-blind review**. Chat becomes read-only, then archives.

### 6.2 Swap path (the core peer-to-peer flow)
1. Radar or search surfaces a **Swap match** — someone who teaches what you want *and* wants what you teach — with a price preview (e.g., "Swap 18 tokens vs Direct 60").
2. Member A chooses *what I'll teach* and *what I want to learn* (with a duration for each) and reviews the price breakdown for both sides.
3. A's tokens for their leg lock in escrow; B is notified with the full breakdown.
4. B accepts — B's tokens for their leg lock at that moment (B tops up first if short). B can also decline, or the proposal expires after 48 h and A is refunded.
5. One shared chat opens. A and B agree **two times**, one per leg; each leg gets its own Meet link.
6. Each leg settles on its own: after the session both confirm, and the payer's tokens release to that leg's teacher minus the platform fee.
7. Both members review each other for both legs; the swap is complete.

### 6.3 Unhappy paths
| Situation | System behaviour |
|---|---|
| Teacher declines | Full refund to learner's Available balance; learner notified; Radar suggests alternatives |
| Teacher doesn't respond in 48 h | Offer expires; full refund |
| No time agreed within 7 days of acceptance | Session auto-cancels; full refund |
| Learner cancels ≥ 24 h before start | Full refund |
| Learner cancels < 24 h before start | 50% to teacher (minus fee), 50% refunded *(configurable)* |
| Learner no-show | Teacher receives 100% (minus fee) after teacher confirms |
| Teacher cancels or no-shows | Full refund to learner + **strike** on teacher |
| Only one side confirms completion | 24 h grace, then auto-settle in favour of the confirming side unless the other disputes |
| Either side disputes | Escrow frozen; goes to admin dispute queue (§7.13) |
| Payment fails or is duplicated | No tokens credited on failure; duplicate webhooks are idempotent |
| Either member cancels a swap leg before any session has happened | Whole swap cancels; both refunded per the cancellation timing rules |
| One swap leg is done; the other member no-shows or cancels late on their teaching leg | Strike, swap privileges paused, admin review with possible compensation to the other member |
| Swap recipient can't afford their leg when accepting | Accept blocked with a top-up prompt; proposal stays pending until it expires |
| Both swap legs not scheduled within 14 days | Swap auto-cancels; full refunds |

---

## 7. Functional requirements

### 7.1 Authentication and account (Auth)
| ID | Requirement | Pri |
|---|---|---|
| FR-AUTH-01 | Sign up with email + password (min 10 chars, breach-list check); email verification required before any transaction | P0 |
| FR-AUTH-02 | Sign in with Google (OAuth 2.0 / OIDC) | P0 |
| FR-AUTH-03 | Log in, log out, "forgot password" via emailed one-time link (expires in 30 min) | P0 |
| FR-AUTH-04 | Session management: short-lived access token + rotating refresh token; "log out of all devices" | P0 |
| FR-AUTH-05 | Phone number verification via SMS OTP (required before first token purchase or before receiving an offer — anti-fraud) | P0 |
| FR-AUTH-06 | Rate limiting and lockout on repeated failed logins; CAPTCHA after threshold | P0 |
| FR-AUTH-07 | Account settings: edit profile, change password, notification preferences, connected Google account | P0 |
| FR-AUTH-08 | Account deletion request (data erasure honouring legal retention of financial records) | P0 |
| FR-AUTH-09 | Optional TOTP two-factor authentication for members; **mandatory** for all admin roles | P1 (members) / P0 (admins) |
| FR-AUTH-10 | Age gate: user confirms they are 18+ at signup | P0 |

### 7.2 Profile and skills
| ID | Requirement | Pri |
|---|---|---|
| FR-PRO-01 | Profile: display name, photo, bio, languages, timezone, city/country (optional), links | P0 |
| FR-PRO-02 | **Skills to teach**: skill (from taxonomy), level, years of experience, description, session rate (tokens/hour), allowed durations | P0 |
| FR-PRO-03 | **Skills to learn**: skill, current level, goal | P0 |
| FR-PRO-04 | Weekly availability grid + timezone; option to pause ("not accepting requests") | P0 |
| FR-PRO-05 | Skill taxonomy (categories → skills → synonyms), admin-managed; users can *suggest* a new skill, which goes to a moderation queue | P0 |
| FR-PRO-06 | Public profile page: bio, skills offered, rate, rating, completed sessions, response rate, badges | P0 |
| FR-PRO-07 | Verified skill badges: user attaches proof (GitHub, LinkedIn, Behance, portfolio, short demo video); moderator approves | P1 |
| FR-PRO-08 | Gamification (levels, activity summary, achievement badges) | P2 |

### 7.3 Onboarding questionnaire
Onboarding is a short, skippable-with-consequences wizard (progress saved between steps). It feeds the AI Radar.

| # | Question | Type |
|---|---|---|
| 1 | What do you want to learn? (up to 5) | Skill picker + free text |
| 2 | Why? (career, hobby, exam, project, other) and current level per skill | Choice |
| 3 | How soon do you want to start? | Choice |
| 4 | How do you like to learn? (structured lessons, project-based, Q&A/mentoring, pair practice) | Multi-choice |
| 5 | What can you teach? (skills, level, teaching experience) | Skill picker + text |
| 6 | When are you free? (weekly grid) and timezone | Grid |
| 7 | Which languages can sessions be in? | Multi-choice |
| 8 | Budget per hour (learner) / desired rate per hour (teacher), in tokens | Number range |
| 9 | Preferred session length | Choice |
| 10 | Optional: proof links for your teaching skills | URLs |

| ID | Requirement | Pri |
|---|---|---|
| FR-ONB-01 | Wizard with progress bar; answers auto-saved; can be resumed and edited later | P0 |
| FR-ONB-02 | Minimum to finish: ≥ 1 skill to learn **or** ≥ 1 skill to teach, availability, language | P0 |
| FR-ONB-03 | Free-text answers are normalised to taxonomy skills; unrecognised skills are queued for admin review | P0 |
| FR-ONB-04 | Immediately after onboarding, show first Radar results (or a "we're finding matches" state within 10 s) | P0 |
| FR-ONB-05 | If the member adds no skill to teach, show what they would save by adding one ("Add a skill you can teach and pay up to X% fewer tokens on swaps") and let them add it in one step; never block onboarding on it | P0 |

### 7.4 AI Radar (matching)
| ID | Requirement | Pri |
|---|---|---|
| FR-RAD-01 | Rank teachers for each learner using **two-sided fit** — how well the teacher matches what the learner wants (forward fit) **and** how much the teacher wants what the learner can teach (reverse fit / swap potential) — plus level fit, availability overlap, language, price fit and reputation — see `architecture.md` §9 | P0 |
| FR-RAD-02 | Show each result with a **match %** and 1–2 human-readable reasons ("Teaches Python, free Tue/Thu evenings, within your budget") | P0 |
| FR-RAD-03 | Hard filters: teacher is active and accepting requests, not blocked/suspended, language overlap, not the user themself | P0 |
| FR-RAD-04 | Radar refreshes on profile change and nightly; "new match" notification when a strong new teacher appears | P0 (refresh) / P1 (notification) |
| FR-RAD-05 | Feedback controls: 👍 / 👎 / "not interested" on each result; feed into ranking | P1 |
| FR-RAD-06 | Cold-start fallback: if no strong matches, show popular teachers in the chosen category and offer to notify when a match appears | P0 |
| FR-RAD-07 | Fairness: matching must **not** use age, gender, religion, caste, ethnicity, or similar attributes; new teachers get a small exposure boost | P0 |
| FR-RAD-08 | **Swap matches**: surface members where A wants what B teaches **and** B wants what A teaches, badge them "Swap match", list them in their own tab, and show the swap-vs-direct price preview on the card | P0 |
| FR-RAD-09 | Manual search and filters (skill, category, price, language, rating, availability) always available alongside Radar | P0 |

### 7.5 Wallet and tokens
| ID | Requirement | Pri |
|---|---|---|
| FR-WAL-01 | Each member has a wallet showing **Available**, **Held**, and lifetime earned/spent | P0 |
| FR-WAL-02 | Buy tokens via preset packs (50 / 100 / 250 / 500 / 1,000) or custom amount (min 50, max 10,000 per purchase). 1 token = ₹1 | P0 |
| FR-WAL-03 | Payment via Razorpay: UPI, cards, netbanking, wallets. Tokens are credited **only after server-verified payment confirmation** (webhook), never on client redirect alone | P0 |
| FR-WAL-04 | Transaction history: purchases, holds, releases, refunds, fees, with status and reference IDs; downloadable statement (CSV/PDF) | P0 |
| FR-WAL-05 | GST-compliant invoice/receipt for each purchase | P0 |
| FR-WAL-06 | Hold, release and refund operations are atomic and idempotent (see architecture §7) | P0 |
| FR-WAL-07 | Promotional/bonus tokens tracked separately (non-withdrawable, may expire) | P1 |
| FR-WAL-08 | Withdrawal of earned tokens to bank/UPI with KYC, minimum threshold and settlement delay — **subject to legal review (Q1)** | P1 |
| FR-WAL-09 | Refund of unused purchased tokens to the original payment method under a defined policy (Q8) | P1 |
| FR-WAL-10 | Purchase limits and velocity checks (daily cap, new-account cap) | P0 |

### 7.6 Offers, escrow and approval
| ID | Requirement | Pri |
|---|---|---|
| FR-OFF-01 | Learner creates a **Direct** offer: teacher, skill, duration, preferred time window (optional), short message. The token price is calculated by the pricing engine, not typed by the user (§7.6A) | P0 |
| FR-OFF-02 | Direct price = the teacher's listed hourly rate × duration, within the platform min/max per session | P0 |
| FR-OFF-03 | On submit, the amount is **atomically** moved Available → Held. If the balance is insufficient the offer is not created | P0 |
| FR-OFF-04 | Teacher sees offers in an inbox and can **Accept** or **Decline** (with optional reason). Offers expire after 48 h | P0 |
| FR-OFF-05 | Learner can withdraw a pending offer at any time before acceptance → full refund | P0 |
| FR-OFF-06 | Accept → session created, temp chat opened, both notified. Decline/expire/withdraw → full refund, notification | P0 |
| FR-OFF-07 | Limits: max 5 simultaneously pending offers per learner; max 10 new offers per day | P0 |
| FR-OFF-08 | Teacher counter-offer (different amount/time) | P1 |
| FR-OFF-09 | **Swap offers** (mutual exchange at a reduced token price): see §7.6A | P0 |
| FR-OFF-10 | Teacher can block a learner; blocked users cannot send offers | P0 |

### 7.6A Skill swaps and token pricing

SkillSwap is peer-to-peer: members who can teach something should pay far fewer tokens than members who only learn.

| Mode | When it applies | What the learner pays |
|---|---|---|
| **Direct** | The member has nothing to offer, or the teacher doesn't want what they offer | **List price** = teacher's hourly rate × duration |
| **Swap** | Two members each teach the other a skill — each is the teacher in one session ("leg") and the learner in the other | A reduced **swap price** per leg (rule below) |

**Pricing rule** (defaults are admin-configurable, §8):
1. The `list price` of a leg = the teacher's hourly rate × the leg's duration.
2. The value exchanged in kind, `M`, is the **smaller** of the two legs' list prices.
3. Each learner pays, for the leg they receive: `(list price − M) + swap factor × M` — but never less than the **minimum swap charge** and never more than the list price.

| Example (swap factor 30%) | Direct price | Swap price |
|---|---|---|
| Ravi teaches Asha guitar (60 tokens); Asha teaches Ravi Excel (60 tokens) | 60 each | **18 each** (70% cheaper) |
| Ravi's leg is worth 100 tokens; Asha's is worth 40 | 100 and 40 | **72 and 12** — the 60-token imbalance is still paid in tokens |
| Asha has no skill to teach and learns from Ravi | 60 | 60 (no swap available) |

| ID | Requirement | Pri |
|---|---|---|
| FR-SWP-01 | Any member with at least one active skill to teach can **propose a swap** to another member: they choose the skill they will teach, the skill they want to learn, and a duration for each leg | P0 |
| FR-SWP-02 | Before sending, show a **price preview**: Direct vs Swap for the proposer, and what the recipient will pay. The quote is locked for 10 minutes and snapshotted on the offer; later config changes never change it | P0 |
| FR-SWP-03 | **Escrow:** the proposer's tokens for their leg lock when the proposal is sent; the recipient's tokens lock **atomically when they accept**. If the recipient lacks tokens, accepting is blocked with a top-up prompt and the proposal stays pending until it expires | P0 |
| FR-SWP-04 | A swap is **one offer with two legs (sessions)** sharing **one chat thread**. Each leg has its own time, Meet link, completion confirmation and settlement, and the legs can happen in either order | P0 |
| FR-SWP-05 | Both legs must be scheduled within **14 days** of acceptance, otherwise the swap auto-cancels with full refunds | P0 |
| FR-SWP-06 | If either leg is cancelled **before any leg has taken place**, the whole swap is cancelled and both members are refunded according to the cancellation timing rules | P0 |
| FR-SWP-07 | If one leg has been completed and the other member then no-shows or cancels late on their teaching leg: **strike**, swap privileges paused pending admin review, and the admin may compensate the other member (manual adjustment, maker-checker). Automatic "swap debt" recovery is P1 | P0 |
| FR-SWP-08 | The platform fee applies to each leg's charged amount at settlement, same as a direct session | P0 |
| FR-SWP-09 | Swap pricing only applies if both skills are active on the members' profiles, the members are different people, and the pair passes linked-account/velocity checks (FR-TS-03) | P0 |
| FR-SWP-10 | Teachers set their hourly rate **within an admin-defined min/max band per skill category**, so rates can't be inflated to game swaps | P0 |
| FR-SWP-11 | Learner-only members (no skill to teach) can only use Direct; the product shows how much they would save by adding a teachable skill (onboarding, wallet and offer screens) | P0 |
| FR-SWP-12 | Netting: lock and pay only the net difference plus a commitment stake, easing swaps for members with few tokens | P1 |
| FR-SWP-13 | Multi-session swap packages (e.g., 4 weekly sessions each way) | P1 |

### 7.7 Temporary chat
| ID | Requirement | Pri |
|---|---|---|
| FR-CHAT-01 | Real-time 1:1 text chat between the two members of an offer, opened on acceptance; one shared thread covers both legs of a swap | P0 |
| FR-CHAT-02 | Message history persisted; delivery/read indicators; offline users get email/push notification for new messages (throttled) | P0 |
| FR-CHAT-03 | Chat lifecycle: **open** → (all sessions in the offer settled) → **read-only for 48 h** → **archived** (retained for 90 days for disputes, accessible to admins only) | P0 |
| FR-CHAT-04 | In-chat "Propose time" card (date/time in both users' timezones) with Accept / Suggest another | P0 |
| FR-CHAT-05 | Warn users when messages appear to contain phone numbers, emails, or off-platform payment requests (soft warning, flagged for moderation) | P0 |
| FR-CHAT-06 | Report message / block user from within chat | P0 |
| FR-CHAT-07 | Basic profanity/abuse filter and rate limit on messages | P0 |
| FR-CHAT-08 | File/image sharing with malware scanning | P1 |

### 7.8 Scheduling and Google Meet
| ID | Requirement | Pri |
|---|---|---|
| FR-MEET-01 | When a proposed time is confirmed by both members, the platform creates a **Google Calendar event with a Google Meet link** and invites both members. A swap has two sessions, each with its own event and link | P0 |
| FR-MEET-02 | Session page shows time (in viewer's timezone), Meet link (visible from 15 min before start), add-to-calendar, reschedule and cancel actions | P0 |
| FR-MEET-03 | Reminders: 24 h and 1 h before start (email + in-app) | P0 |
| FR-MEET-04 | Reschedule: either party may propose a new time (up to 2 reschedules per session); late-reschedule rules mirror cancellation rules | P0 |
| FR-MEET-05 | Fallback: if automatic Meet creation fails, members can paste their own meeting link in chat; the session still proceeds | P0 |
| FR-MEET-06 | Track "Join session" clicks per participant (used as evidence in disputes; not proof of attendance) | P0 |
| FR-MEET-07 | Platform must schedule within 7 days of acceptance or the session auto-cancels with a full refund | P0 |

### 7.9 Completion, settlement and disputes
| ID | Requirement | Pri |
|---|---|---|
| FR-SET-01 | After scheduled end time, both participants are prompted to **Confirm completed** or **Report a problem** | P0 |
| FR-SET-02 | Both confirm → settle immediately: release tokens to teacher minus platform fee; fee recorded as platform revenue | P0 |
| FR-SET-03 | One confirms, other silent for 24 h → auto-settle in favour of the confirming party (unless a dispute is raised) | P0 |
| FR-SET-04 | Dispute window: 48 h after scheduled end. Dispute freezes escrow and creates a case with chat transcript, join-click logs, and both statements | P0 |
| FR-SET-05 | Admin resolves: release to teacher / refund learner / split. Resolution requires a written reason; both parties notified | P0 |
| FR-SET-06 | Strike system: teacher no-show or last-minute cancellation = strike; 3 strikes in 90 days triggers review/suspension | P0 |
| FR-SET-07 | Learner no-show or late cancel forfeits the configured share of tokens to the teacher | P0 |
| FR-SET-08 | Dispute SLA: first admin response within 72 h | P0 |

### 7.10 Reviews and reputation
| ID | Requirement | Pri |
|---|---|---|
| FR-REV-01 | After settlement each party can rate (1–5) and write a review within 7 days | P0 |
| FR-REV-02 | **Double-blind**: reviews are hidden until both submit or the window closes | P0 |
| FR-REV-03 | Public reputation for teachers: average rating, review count, completion rate, response rate, strikes hidden but affect ranking | P0 |
| FR-REV-04 | Reviews can be reported; moderators can remove abusive reviews (audit-logged) | P0 |

### 7.11 Notifications
| ID | Requirement | Pri |
|---|---|---|
| FR-NOT-01 | Email + in-app notifications for: offer received/accepted/declined/expired, new chat message (offline), time proposed/confirmed, reminders, completion prompt, settlement, refund, dispute updates, review prompt | P0 |
| FR-NOT-02 | Per-category notification preferences (transactional emails cannot be fully disabled) | P0 |
| FR-NOT-03 | Web push notifications | P1 |
| FR-NOT-04 | WhatsApp/SMS reminders | P2 |

### 7.12 FAQ chatbot
| ID | Requirement | Pri |
|---|---|---|
| FR-BOT-01 | Chat widget available on all pages (logged-in and logged-out) | P0 |
| FR-BOT-02 | Answers questions using **only** the admin-curated FAQ/policy knowledge base (tokens, pricing, refunds, how escrow works, scheduling, disputes, safety) | P0 |
| FR-BOT-03 | Each answer cites the FAQ article it came from | P0 |
| FR-BOT-04 | If confidence is low or the question is out of scope, the bot says so and offers **"Contact support"** (creates a ticket with the conversation attached) | P0 |
| FR-BOT-05 | Refuses to give legal, financial or account-specific advice; never asks for passwords/OTP/card numbers | P0 |
| FR-BOT-06 | Admins see unanswered/low-confidence questions and can turn them into new FAQ entries | P0 |
| FR-BOT-07 | Rate-limited per user/IP; conversation logs retained 90 days with PII masked | P0 |
| FR-BOT-08 | Read-only account help ("Where is my refund?", "Status of my offer") via authenticated, scoped lookups | P1 |
| FR-BOT-09 | Multilingual answers (start with English; add Tamil/Hindi) | P1 |

### 7.13 Admin panel
Separate, access-controlled web app (`admin.` subdomain). Roles: **Super Admin, Finance, Support, Moderator, Content Editor**.

| ID | Requirement | Pri |
|---|---|---|
| FR-ADM-01 | Login with email + password + **mandatory TOTP 2FA**; optional IP allow-list; short session timeout | P0 |
| FR-ADM-02 | **Dashboard**: signups, active users, offers, acceptance rate, sessions, token GMV, revenue, open disputes, failed payments | P0 |
| FR-ADM-03 | **User management**: search/filter, view profile + wallet + history, suspend/unsuspend, verify, force logout, view strikes | P0 |
| FR-ADM-04 | **Offers & sessions monitor**: filter by status and type (direct / swap); view chat transcript (access is logged and reason-gated) | P0 |
| FR-ADM-05 | **Dispute queue**: case view, evidence, resolution actions (release / refund / split), SLA timers | P0 |
| FR-ADM-06 | **Finance**: all transactions, gateway reconciliation report, refunds, failed/pending payments, fee report, GST report exports | P0 |
| FR-ADM-07 | **Manual wallet adjustment** with mandatory reason and **maker-checker** (second admin approves) | P0 |
| FR-ADM-08 | **Configuration**: platform fee %, swap factor and minimum swap charge, token packs, min/max session tokens, expiry windows, cancellation rules, purchase limits — changes are versioned and audit-logged | P0 |
| FR-ADM-09 | **Skill taxonomy** management (including a min/max hourly-rate band per category); approve/merge user-suggested skills | P0 |
| FR-ADM-10 | **Moderation queue**: reported users/messages/reviews, flagged chat messages, badge proofs | P0 |
| FR-ADM-11 | **FAQ knowledge base** editor (create/edit/publish/unpublish); unanswered-questions inbox | P0 |
| FR-ADM-12 | **Support tickets** inbox (from chatbot escalations and contact form) | P0 |
| FR-ADM-13 | **Immutable audit log** of every admin action (who, what, when, before/after, reason) | P0 |
| FR-ADM-14 | Announcements / email template management | P1 |
| FR-ADM-15 | Feature flags and Radar weight tuning | P1 |

### 7.14 Trust and safety
| ID | Requirement | Pri |
|---|---|---|
| FR-TS-01 | Report user / session / message / review | P0 |
| FR-TS-02 | Block user | P0 |
| FR-TS-03 | Fraud signals: multi-account detection (device/IP/phone), self-dealing (two linked accounts trading tokens), unusual purchase velocity, chargeback history | P0 (basic) |
| FR-TS-04 | Chargeback handling: freeze tokens purchased by the disputed payment; claw back if unspent; suspend if spent | P0 |
| FR-TS-05 | Prohibited-skill policy (illegal, adult, weapons, hacking-for-harm, etc.) enforced via taxonomy and moderation | P0 |
| FR-TS-06 | Community guidelines and Terms accepted at signup; versioned acceptance records | P0 |

---

## 8. Business rules and default configuration

All values are **admin-configurable defaults** (FR-ADM-08). They are my starting proposals — confirm or change.

| Rule | Default |
|---|---|
| Token value | 1 token = ₹1 (fixed, INR only) |
| Token packs | 50 / 100 / 250 / 500 / 1,000; custom 50–10,000 |
| Platform fee | **10%** of session tokens, deducted from the teacher's payout on settlement |
| Session price range | 20–5,000 tokens per session |
| Swap factor | **30%** — in a swap, the in-kind portion of value is still charged at 30% of list price (i.e., 70% off) |
| Minimum swap charge | 10 tokens per leg (never above the leg's list price) |
| Swap scheduling deadline | Both legs scheduled within **14 days** of acceptance |
| Swap default | Strike + swap privileges paused + admin review with possible compensation |
| Teacher hourly rate | Set by the teacher within an admin-defined min/max band per skill category |
| Session durations | 30 / 45 / 60 / 90 minutes |
| Offer expiry | 48 h |
| Scheduling deadline | 7 days after acceptance |
| Learner cancels ≥ 24 h before | 100% refund |
| Learner cancels < 24 h before | 50% to teacher (minus fee) / 50% refund |
| Learner no-show | 100% to teacher (minus fee) |
| Teacher cancel / no-show | 100% refund + 1 strike (3 strikes / 90 days → review) |
| Completion auto-settle | 24 h after scheduled end if only one side confirms |
| Dispute window / SLA | 48 h / first response within 72 h |
| Review window | 7 days, double-blind |
| Chat retention | Read-only 48 h after settlement; archived 90 days |
| Pending offers per learner | 5 concurrent, 10 new per day |
| Reschedules per session | 2 |
| Withdrawal of earned tokens | **Off in MVP** (Q1) |
| Signup bonus tokens | **Off** (Q7) |
| Minimum age | 18 |

Rounding: fees are computed in paise and rounded half-up; the teacher receives the remainder so the totals always balance exactly.

---

## 9. Compliance and legal considerations

*This is a product-level checklist, not legal advice. Get a lawyer and a chartered accountant to confirm before launch.*

1. **Stored-value / prepaid instrument rules (highest risk).** RBI's Master Directions on Prepaid Payment Instruments define *closed-system* instruments as usable to buy goods/services **from the issuer only**, with no cash withdrawal — those don't need RBI authorisation. Tokens that members spend on *other members'* services may not fit that definition, which could make them a semi-closed PPI requiring authorisation. Options: (a) obtain a legal opinion on the structure, (b) structure funds flow through a payment aggregator's escrow/nodal arrangement so SkillSwap doesn't hold stored value, or (c) partner with a licensed PPI issuer. **Decide this before building the wallet in production.** See Q5.
2. **GST** on token purchases and platform fees; TDS/TCS implications for payouts to teachers (relevant if/when withdrawals launch).
3. **Data protection**: India's Digital Personal Data Protection Act, 2023 and its rules — consent, purpose limitation, right to erasure, breach notification, data-fiduciary duties. Chat contents and payment metadata are personal data.
4. **Consumer protection / e-commerce rules**: clear pricing, refund and grievance-officer details, terms of service.
5. **IT Act intermediary obligations**: content takedown process, grievance redressal.
6. **KYC/AML** (relevant when withdrawals launch): PAN/bank verification for payouts.
7. **SMS OTP** in India requires DLT registration with the SMS provider.
8. **Google API policies**: OAuth consent screen/verification for any sensitive scopes; Meet/Calendar API usage terms.
9. **Minors**: 18+ only; enforce via declaration at signup and moderate reports.

---

## 10. Non-functional requirements

| Area | Requirement |
|---|---|
| **Performance** | Page LCP ≤ 2.5 s on 4G; API p95 ≤ 300 ms (excluding third-party calls); chat message delivery p95 ≤ 1 s |
| **Availability** | 99.5% monthly for MVP (excluding planned maintenance); payment webhooks must be processed even after downtime (gateway retries + our reconciliation job) |
| **Scalability** | MVP sized for 10,000 registered users, 1,000 daily actives, 500 concurrent chat connections; horizontal path documented in architecture |
| **Correctness** | Ledger invariants hold at all times: entries sum to zero, no negative user balances, escrow equals sum of active holds. Nightly automated check |
| **Security** | OWASP ASVS L2 target; encryption in transit and at rest; secrets management; admin 2FA; third-party penetration test before public launch |
| **Privacy** | Data minimisation; PII masked in logs and LLM prompts; audit access to chat transcripts |
| **Accessibility** | WCAG 2.1 AA |
| **Browser support** | Latest two versions of Chrome, Edge, Safari, Firefox; mobile-first responsive layouts |
| **Internationalisation** | English at launch; UI strings externalised for Tamil/Hindi; all times stored in UTC, displayed in user's timezone |
| **Backup / DR** | Point-in-time recovery for the database; RPO ≤ 15 min, RTO ≤ 4 h |
| **Observability** | Error tracking, structured logs, metrics and alerts on payments, webhooks, escrow jobs and chat |

---

## 11. Analytics and instrumentation

Track (privacy-respecting, consent-aware) events for: signup, onboarding step completion, Radar impression/click/dismiss, offer created (direct or swap) / accepted / declined / expired, swap price preview viewed, token purchase started/succeeded/failed, chat opened, time proposed/confirmed, Meet link created/clicked, session confirmed/disputed, review submitted, chatbot question/resolved/escalated. Build a funnel view: *signup → onboarding → Radar click → offer → accepted → scheduled → completed → repeat*.

---

## 12. Release plan

Assumes a small team (3–4 engineers) and ~12 weeks to a private beta. Adjust after Q11.

| Weeks | Milestone | Contents |
|---|---|---|
| 1–2 | **Foundations + spikes** | Repo, CI/CD, environments; **spike 1**: Google Meet link creation; **spike 2**: Razorpay test-mode purchase + webhook; legal opinion in parallel |
| 3–4 | **Identity & profiles** | Auth, email/phone verification, onboarding wizard, profile, skill taxonomy |
| 5–6 | **Wallet & payments** | Ledger, token purchase, transaction history, invoices, reconciliation job |
| 7–8 | **Offers, escrow, chat** | Pricing engine (direct + swap), offer flow with two-leg swaps, expiry jobs, approval, real-time temp chat, notifications |
| 9 | **Scheduling & settlement** | Propose-time cards, Meet integration (two sessions per swap), reminders, per-leg completion/settlement, strikes, reviews |
| 10 | **AI Radar + FAQ bot** | Embeddings, ranking, "why" reasons; RAG chatbot and admin KB |
| 11 | **Admin panel** | Dashboard, users, disputes, finance, config, audit log, moderation |
| 12 | **Hardening & beta** | Load test, security review, bug bash, beta cohort onboarding |

**P1 (post-launch):** swap netting and multi-session swap packages, counter-offers, verified badges, withdrawals (if cleared legally), web push, file sharing, chatbot account lookups, TOTP for members.
**P2:** gamification, WhatsApp reminders, group sessions, native apps, multilingual UI.

---

## 13. Assumptions I made (veto any of these)

1. The name is **SkillSwap**; the product is web-only (responsive), English-first, India-first (INR, Razorpay, UPI).
2. SkillSwap is **peer-to-peer**: two members who each want to learn the other's skill **swap at a reduced token cost**; a member with nothing to offer pays the **full price**. In a swap, the smaller of the two legs' list prices is treated as exchanged in kind and charged at 30%; any imbalance is paid in tokens (§7.6A). Every member can both teach and learn with one account, and teachers set their hourly rate within an admin-defined band per skill category.
3. Tokens are **held in escrow when the offer is sent**, not when it's accepted — so teachers know funds exist before they respond.
4. Earned tokens stay **inside the platform** in the MVP (can be spent to learn). No cash-out until legal review.
5. The platform fee is **10%**, deducted from the teacher.
6. Google Meet links are created **automatically by the platform** (Calendar API) with a manual-link fallback.
7. Session attendance can't be verified from Google Meet reliably, so completion is **confirmation-based** with dispute resolution.
8. AI Radar is a **hybrid** system (embeddings + rules + reputation), not a pure LLM prompt, so it is fast, cheap and explainable.
9. FAQ bot answers **only from the curated knowledge base** and escalates to human support when unsure.
10. Members are **18+**. Phone OTP is required before money moves.
11. Email is the primary notification channel at launch.
12. Visual design follows the existing SkillSwap UI direction; this PRD covers behaviour, not visuals.

---

## 14. Open questions

Ordered by impact. Each has my recommended default so work can proceed.

| # | Question | Why it matters | Default I used |
|---|---|---|---|
| **Q1** | Can teachers **withdraw earned tokens as cash**? | Drives legal category, KYC, payouts, fraud risk, and whether teachers stay motivated | No cash-out in MVP; P1 after legal review |
| **Q2** | Is the **swap pricing rule** right? (in-kind value charged at 30%, imbalance between the two skills paid in tokens, 10-token minimum per leg) | Core unit economics and the product's main promise | As specified in §7.6A |
| **Q3** | Should teachers **set their own hourly rate** (within a band per category), or should the platform fix one price per skill category? | Stops rate inflation to game swaps; affects supply and Radar price-fit | Teacher sets a rate inside an admin-defined band |
| **Q4** | Platform fee — how much, and who pays? | Unit economics | 10% from teacher |
| **Q5** | Is the company registered / GST-registered, and has anyone taken **legal advice on holding stored value (RBI PPI)**? | Could block launch or force a different funds flow | Assume opinion will be obtained in weeks 1–4 |
| **Q6** | Do you have a **Google Workspace** account for the Meet organiser? | Determines Meet integration approach (architecture §11) | Spike in week 1; manual-link fallback |
| **Q7** | Give **free signup tokens** to solve cold start? | Marketing cost vs. liquidity | Off |
| **Q8** | Refund policy for **unused purchased tokens**? | Consumer-law and gateway-fee impact | Refundable within 7 days if fully unspent (P1) |
| **Q9** | Do teachers need **ID / skill verification** before being listed? | Trust vs. onboarding friction | Email + phone; optional proof badges |
| **Q10** | Launch languages? | Chatbot, Radar embeddings, UI | English |
| **Q11** | Team size, target launch date, hosting/budget preferences (AWS vs. simple PaaS)? | Scope and stack choices | 3–4 engineers, ~12 weeks |
| **Q12** | Which **LLM/embedding provider** and monthly AI budget? | Radar and chatbot costs | Small fast LLM for chatbot/tagging; hosted embedding model |
| **Q13** | Minimum age — 18+ only? | Legal/contract capacity, payments | 18+ |
| **Q14** | What should happen when a member defaults on their leg **after** receiving the other member's session? | Swap fairness and fraud exposure | Strike, swap privileges paused, admin-reviewed compensation (automatic "swap debt" recovery in P1) |

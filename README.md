# SkillSwap — Peer-to-Peer Asynchronous Skill-Trading Marketplace

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=flat&logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20%26%20Realtime-3ECF8E?style=flat&logo=supabase)](https://supabase.com/)
[![WebRTC](https://img.shields.io/badge/WebRTC-P2P%20Streaming-333333?style=flat&logo=webrtc)](https://webrtc.org/)
[![Gemini](https://img.shields.io/badge/Google%20Gemini-2.5%20Flash-4285F4?style=flat&logo=google)](https://ai.google.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)

**SkillSwap** is a production grade peer-to-peer skill-trading platform built with Next.js, Supabase, WebRTC, and Google Gemini. It facilitates reciprocal knowledge transfer between peers using an atomic credit escrow economy, real-time collaboration tools, and AI-driven pedagogical planning.

---

## 🏛️ System Architecture

```
                                  ┌────────────────────────────────┐
                                  │   Next.js App Router Client    │
                                  │   (Linear/Notion/Airbnb UI)    │
                                  └──────────────┬─────────────────┘
                                                 │
                  ┌──────────────────────────────┼──────────────────────────────┐
                  │                              │                              │
                  ▼                              ▼                              ▼
      ┌──────────────────────┐      ┌─────────────────────────┐     ┌───────────────────────┐
      │  Supabase PostgreSQL │      │ Pure WebRTC P2P Stream  │     │   Google Gemini API   │
      │  - Row-Level Security │      │ - STUN / TURN Failover  │     │   - 2.5 Flash Model   │
      │  - Atomic Escrow RPCs│      │ - Dynamic ICE Config    │     │   - Reciprocal Match  │
      │  - Realtime Broadcast│      │ - HTML5 Whiteboard Sync │     │   - 45-min Agendas    │
      │  - 50-Credit Trigger │      │ - Speech-to-Text Stream │     │   - Takeaways & Notes │
      └──────────────────────┘      └─────────────────────────┘     └───────────────────────┘
```

---

## 🔑 Key Architectural Capabilities

### 1. Atomic Credit Escrow Economy (Zero-Leakage Invariant)
All monetary balance updates execute via PostgreSQL `security definer` stored procedures with pessimistic row-locking (`for update`):
- **Starting Capital:** Automatic registration trigger grants **50 credits** on account creation.
- **Booking / Escrow (`book_session_with_escrow`):** Atomically locks 10 credits from the learner and places the session into `PENDING`.
- **Cancellation / Refund (`cancel_session_and_refund`):** Reimburses 10 credits to the learner if a session is declined or cancelled prior to completion.
- **Completion / Payout (`complete_session_payout`):** Transfers 10 credits to the teacher's wallet once confirmed.
- **Top-Up (`add_user_credits`):** Simulates or processes credit package additions atomically.

### 2. Peer-to-Peer Real-Time Collaboration (WebRTC & Whiteboard)
- **Direct P2P Video:** Low-latency media streaming via browser `RTCPeerConnection` with STUN (Google) and TURN (OpenRelay / Metered) failover fetched dynamically from `/api/webrtc/ice`.
- **Screen Sharing:** Dynamic video track swapping via `replaceTrack` and `navigator.mediaDevices.getDisplayMedia`.
- **Live Collaborative Whiteboard:** Synchronized drawing strokes broadcast via Supabase Realtime channels.
- **Live Audio Transcription:** Browser Web Speech API continuously transcribes conversation audio and streams live closed captions.

### 3. Gemini 2.5 Flash Pedagogical Engine (`@google/genai`)
- **Reciprocal Matching Engine (`/api/matches`):** Analyzes skill overlaps between what User A teaches vs wants to learn and what User B teaches vs wants to learn, calculating an AI compatibility score and reasoning rationale.
- **Dynamic 45-Minute Session Agendas (`/api/sessions/agenda`):** Synthesizes structured timing, milestones, and hands-on exercises tailored to the participants' skill levels.
- **Transcript Distillation (`/api/sessions/transcript`):** Converts speech transcripts into bulleted key concepts, code snippets, and practice items saved to PostgreSQL.
- **Roadmap Advisor (`/api/skills/recommendations`):** Recommends 3 complementary skills based on current teaching and learning portfolios.

### 4. Async Services & Engagement
- **Transactional Notifications:** Automated HTML emails via Resend SDK (`/lib/email.ts`).
- **Automated Cron Reminders:** Daily scanning for upcoming sessions scheduled within 24 hours (`/api/cron/reminders` via `vercel.json`).
- **Calendar Integration:** Dynamic `.ics` download and Google Calendar template links (`/lib/calendar.ts`).

---

## 🗄️ Database Setup & DDL

Execute the complete schema and stored procedures located in [schema.sql](./schema.sql) in your Supabase SQL Editor:

```bash
# Tables created:
# - public.profiles (with 50 credits default trigger)
# - public.skills
# - public.user_skills
# - public.sessions
# - public.reviews
# - public.notifications
# - public.messages

# Stored Procedures (RPC):
# - public.book_session_with_escrow(requester_id, receiver_id, skill_name)
# - public.cancel_session_and_refund(session_id, actor_id)
# - public.complete_session_payout(session_id)
# - public.add_user_credits(user_id, amount)
```

---

## ⚙️ Environment Variables

Configure the following variables in your `.env.local` or deployment dashboard (Vercel / Supabase):

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Google Gemini API
GEMINI_API_KEY=your-gemini-api-key

# Resend Transactional Email
RESEND_API_KEY=re_your_resend_api_key

# WebRTC TURN / STUN Credentials (Optional / Metered / OpenRelay)
TURN_SERVER_URL=turn:openrelay.metered.ca:80
TURN_SERVER_USERNAME=openrelayproject
TURN_SERVER_CREDENTIAL=openrelayproject

# Cron Security (Optional)
CRON_SECRET=your_secure_cron_secret
```

---

## 🚀 Running Locally

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run production build validation
npm run build
```

Open [http://localhost:3000](http://localhost:3000) to view SkillSwap.

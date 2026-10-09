# SkillSwap Repository Analysis

### 🛠️ The Tech Stack

SkillSwap is built with a modern, full-stack JavaScript ecosystem, leveraging the following technologies:

**Frontend (Client & UI)**
*   **Framework:** **Next.js (v16.3.7)** utilizing the **App Router** paradigm (`src/app` directory structure).
*   **Language:** **TypeScript** for strict typing across both frontend and backend logic.
*   **Styling:** **Tailwind CSS v4** combined with Vanilla CSS (`globals.css`), providing utility-first styling without external UI component libraries like shadcn/ui.
*   **Animations:** **Framer Motion** for fluid UI transitions and micro-interactions, plus `canvas-confetti` for success states.
*   **Icons:** **Lucide React** and **React Icons**.

**Backend & Infrastructure**
*   **Database:** **Supabase (PostgreSQL)**.
*   **Authentication:** **Supabase Auth** (primarily tailored for Google OAuth 2.0).
*   **Payments:** **Razorpay SDK** for processing fiat transactions to top-up platform credits.
*   **Real-time & AI:** Uses **pgvector** within PostgreSQL for AI semantic skill matching, and standard WebRTC / WebSockets for live video calls and chat.
*   **Testing & Linting:** **Playwright** for End-to-End (E2E) testing and **ESLint**.

---

### ⚙️ How Everything Works (Architecture & Data Flow)

SkillSwap is a peer-to-peer knowledge exchange platform operating on a "time-credit" (token) system rather than direct fiat payments. Here is how the core systems interact:

#### 1. Identity & Onboarding
*   **Auth Flow:** Users authenticate via Supabase Auth (Google OAuth).
*   **Profile Creation:** Once authenticated, a record is created in the `profiles` table. Users go through an onboarding flow where they set up their timezone, bio, and languages.
*   **Skill Tagging:** Users declare what they want to teach (`user_skills_teach`) and what they want to learn (`user_skills_learn`). The platform uses a centralized `skill_taxonomy` table to keep skills standardized (e.g., "Python Programming").

#### 2. Discovery & Matching
*   **Finding Peers:** The app matches users based on complementary skills (e.g., User A wants to learn Spanish and teaches React; User B wants to learn React and teaches Spanish).
*   **Semantic Matching:** The database schema has the `pgvector` extension enabled, indicating that skill matching goes beyond exact keyword matches and utilizes AI embeddings to find relevant mentors.

#### 3. Proposals & The "Swap" Flow
Users don't just book directly; they create `offers` which can be of two types:
*   **DIRECT:** A standard booking where the learner pays the teacher in credits.
*   **SWAP:** A reciprocal agreement where both users trade time (e.g., 1 hour of Guitar for 1 hour of Excel). The schema even supports a `swap_factor` to account for differences in skill hourly rates.

#### 4. Temporary Chat & Scheduling
*   When an offer is proposed, it generates a unique thread in the `chat_threads` table.
*   Users can negotiate terms and propose times within this chat. The system supports structured message types (`PROPOSE_TIME`, `TIME_CONFIRMED`) alongside standard text, making scheduling frictionless.

#### 5. Wallet, Credits & The Escrow System
SkillSwap features a robust double-entry ledger system built directly into PostgreSQL to handle its token economy:
*   **Credit System:** 1 Token = 100 paise (smallest currency unit, likely an Indian Rupee reference due to Razorpay integration).
*   **Atomic Escrow:** When an offer is accepted, a PostgreSQL Stored Procedure (`hold_tokens_for_offer`) is triggered. It securely deducts tokens from the learner's `available_paise` and moves them to `held_paise` (escrow) in a single atomic transaction. This prevents double-spending or race conditions.
*   **Ledger:** Every movement of tokens (PURCHASE, HOLD, RELEASE, REFUND, FEE) is immutably logged in the `ledger_transactions` table with an idempotency key.

#### 6. Live Sessions
*   Once a time is confirmed, a `sessions` record is generated with a scheduled start/end time.
*   The application features an integrated live classroom. Rather than relying on external tools like Zoom, it uses native **WebRTC** for peer-to-peer video/audio and a synchronized Canvas API for a shared whiteboard. 

#### 7. Settlement & Review
*   After the session concludes, both users confirm completion.
*   The escrowed tokens are released to the teacher (`teacher_payout_tokens`), minus a small platform cut (`platform_fee_tokens`).
*   If there is a disagreement, the session status updates to `DISPUTED` for admin intervention. Users then rate each other, updating the `reputation_score` on their public profile. 

### Security Highlights
The entire database is locked down using **Supabase Row-Level Security (RLS)**. For example, policies ensure that users can only view their own wallets, and they can only update their own profile records, ensuring data privacy at the database layer.

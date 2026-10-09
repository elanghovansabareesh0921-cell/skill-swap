# SkillSwap

SkillSwap is a peer-to-peer knowledge exchange platform where users trade skills instead of paying traditional tutoring fees. It operates on a time-credit system called Skill Points (SP). Users earn SP by teaching a subject they know, and they spend SP to learn from others.

## Architecture and Tech Stack

SkillSwap is a full-stack application built with the following technologies:

- Frontend: Next.js (App Router), React, TypeScript, Tailwind CSS
- Backend and Database: Supabase (PostgreSQL) with Row-Level Security
- Payments: Razorpay SDK (for purchasing SP)
- Real-Time Communication: WebRTC and WebSockets (for live video and shared whiteboards)
- AI Matching: pgvector (PostgreSQL extension for semantic skill matching)

## Core Systems

- Identity and Profiles: Authentication is handled via Supabase Google OAuth. Users maintain profiles detailing the skills they can teach and the skills they want to learn.
- Skill Points and Ledger: The platform uses a closed-loop economy. Wallets and transactions are strictly managed via a PostgreSQL double-entry ledger. Escrow holds and token releases are executed atomically via database stored procedures.
- Offers and Escrow: Users can propose standard direct learning or 1-to-1 skill swaps. When an offer is accepted, the required SP is locked in an escrow state until the session concludes successfully.
- Integrated Live Sessions: Confirmed sessions launch directly into an in-app WebRTC video call with an integrated shared whiteboard, removing the need for external meeting links.

## Local Development Setup

### Prerequisites

- Node.js (v18.0.0 or later)
- A Supabase project
- A Razorpay test account
- Google Cloud Console OAuth 2.0 credentials

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure Environment Variables:
   Create a `.env.local` file in the root directory based on the following keys:
   
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXT_PUBLIC_RAZORPAY_KEY_ID=your-razorpay-key
   RAZORPAY_KEY_SECRET=your-razorpay-secret
   ```

3. Database Setup:
   Apply the `schema.sql` file provided in the `supabase/` directory to your Supabase project's SQL Editor to instantiate the required tables, RLS policies, and stored procedures.

4. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at http://localhost:3000.

## License

This project is licensed under the MIT License.

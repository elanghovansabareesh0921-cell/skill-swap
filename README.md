# SkillSwap 

> Learn anything. Teach what you know. No paywalls attached.

SkillSwap is a peer-to-peer knowledge exchange platform built on the idea that expertise shouldn't be locked behind expensive course platforms or hourly tutoring fees. 

Instead of traditional currency, SkillSwap runs on a reciprocal time-credit system: spend an hour mentoring someone in a skill you know—whether that's React state management, acoustic guitar, or conversational Spanish—and use your earned credits to learn directly from someone else.

---

##  Why SkillSwap?

Most online learning platforms suffer from two major flaws: pre-recorded video libraries offer zero personalized feedback, while private tutoring sites charge steep hourly rates. SkillSwap bridges the gap:

- **Credit Escrow Protection:** When you book a mentor, credits sit safely in an automated escrow lock. They're only released when the session wraps up successfully.
- **Integrated Live Classroom:** No juggling Zoom links or Calendly invites. Sessions launch straight into an in-app WebRTC video call with an interactive real-time whiteboard.
- **Fair Contribution Model:** Earn credits through teaching or kickstart your journey with credit packages via integrated payments.
- **Frictionless Onboarding:** Instant sign-in via Google OAuth, profile customisation, and instant skill matching.

---

##  Tech Stack

| Layer | Tools & Frameworks |
| :--- | :--- |
| **Frontend** | Next.js, React, Tailwind CSS, TypeScript, Lucide Icons |
| **Backend & Database** | Supabase (PostgreSQL, Row-Level Security, Database Triggers) |
| **Authentication** | Supabase Auth + Google OAuth 2.0 |
| **Real-Time Collaboration** | WebRTC (Peer-to-Peer Video/Audio), Canvas API / WebSockets |
| **Payments** | Razorpay SDK (Optional credit top-ups) |
| **Hosting** | Vercel (Frontend), Supabase Cloud (Backend) |

---

##  Getting Started

### Prerequisites

Make sure you have installed:
- [Node.js](https://nodejs.org/) (v18.0.0 or later)
- `npm`, `pnpm`, or `yarn`
- A [Supabase](https://supabase.com/) project
- A [Google Cloud Console](https://console.cloud.google.com/) OAuth 2.0 Client ID

---

### Step-by-Step Setup

#### 1. Clone the Repository
```bash
git clone https://github.com/your-username/skillswap.git
cd skillswap
```

#### 2. Install Dependencies
```bash
npm install
```

#### 3. Environment Configuration
Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Populate the keys with your credentials:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Razorpay (Optional - for credit purchases)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxx
RAZORPAY_KEY_SECRET=xxxxxx
```

#### 4. Run Migrations & Start Developing
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to start exploring!

---

##  Google OAuth Configuration Notes

If you are setting up authentication:

1. In the **Google Cloud Console**:
   - Go to **Credentials > OAuth 2.0 Client IDs**.
   - Add your Supabase callback URL under **Authorized redirect URIs**:
     ```text
     https://<your-project-ref>.supabase.co/auth/v1/callback
     ```
   - Make sure your app status under **OAuth Consent Screen** has test users added if published in *Testing* mode.

2. In the **Supabase Dashboard**:
   - Navigate to **Authentication > Providers > Google** and toggle it **Enabled**.
   - Paste your Google `Client ID` and `Client Secret`.
   - Go to **Authentication > URL Configuration**:
     - Set **Site URL** to `http://localhost:3000` (or your production domain).
     - Add `http://localhost:3000/**` to **Redirect URLs**.

---

##  Roadmap

- [x] Google OAuth & Session Management
- [x] Member Profiles & Skill Tagging
- [x] Real-time Booking & Escrow Flow
- [x] In-app WebRTC Video Calls
- [x] Synchronized Shared Whiteboard
- [ ] Automated session notes & recap generation
- [ ] Community reputation badges & verified skills
- [ ] Group workshops and open office hours

---

## Contributing

Feedback, bug reports, and pull requests are welcome!

1. Fork the project
2. Create your feature branch (`git checkout -b feature/cool-feature`)
3. Commit your changes (`git commit -m 'feat: add cool feature'`)
4. Push to the branch (`git push origin feature/cool-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

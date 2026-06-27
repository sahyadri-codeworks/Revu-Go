# RevuGo - AI-Powered Review & Reward Platform

RevuGo helps Indian local businesses collect authentic Google reviews through AI-generated review suggestions, gamified QR-based customer flows, and automated coupon rewards.

## Features

- **Business Dashboard** — Overview, campaigns, review inbox, coupon verification, analytics, QR flyer manager, profile settings
- **Customer Review Flow** — QR scan → star rating → MCQ → AI-generated review options → Google review → scratch card reward
- **Super Admin Panel** — Multi-business management, subscriptions, plans, account suspension, impersonation, analytics
- **QR Flyer Generator** — Branded print-ready flyers with dynamic business info and RevuGo branding (PDF/PNG export)
- **AI Review Generation** — Groq-powered contextual review suggestions based on star rating and MCQ answers
- **Coupon System** — Auto-generated reward coupons with business-side verification

## Tech Stack

- **Frontend**: Next.js (App Router + Turbopack), React, Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes, Supabase (Auth + PostgreSQL + RLS)
- **AI**: Groq API (Llama models for review generation)
- **PDF**: jsPDF + Canvas API for flyer export
- **QR**: qrcode.react

## Setup

### 1. Clone & Install

```bash
git clone https://github.com/sahyadri-codeworks/Revu-Go.git
cd Revu-Go
npm install
```

### 2. Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the full contents of `supabase/schema.sql`
3. Enable **Email/Password** auth in Authentication → Providers
4. (Optional) Enable **Google OAuth** in Authentication → Providers

### 3. Environment Variables

```bash
cp .env.example .env.local
```

Fill in your actual keys in `.env.local`:

| Variable | Where to find |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API (keep secret!) |
| `GROQ_API_KEY` | [console.groq.com](https://console.groq.com) |
| `RESEND_API_KEY` | [resend.com](https://resend.com) (optional, for email coupons) |

### 4. Create Super Admin

1. Start the app and sign up with your admin email
2. Copy the user UUID from Supabase → Authentication → Users
3. Run in Supabase SQL Editor:

```sql
INSERT INTO super_admins (user_id, email)
VALUES ('<your-user-uuid>', 'your-admin@email.com');
```

### 5. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/
│   ├── api/              # API routes (AI, email, super-admin)
│   ├── auth/             # Supabase auth callbacks
│   ├── dashboard/        # Business dashboard pages
│   ├── login/            # Login/signup page
│   ├── onboarding/       # New business setup
│   ├── r/[slug]/         # Customer review flow (public)
│   └── super-admin/      # Admin panel
├── components/
│   ├── customer/         # Customer flow components
│   ├── dashboard/        # Dashboard components
│   └── ui/               # Shared UI components (shadcn)
├── lib/
│   ├── app-context.tsx   # Global app state
│   ├── auth-context.tsx  # Auth state
│   └── supabase/         # Supabase client config
└── types/                # TypeScript interfaces
```

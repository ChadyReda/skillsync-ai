<div align="center">

<img src="public/logo.png" alt="SkillSync" width="96" height="96" />

# SkillSync

### The AI-native career platform where talent and opportunity sync.

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![PostgreSQL](https://img.shields.io/badge/Postgres-Neon-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech)
[![Drizzle](https://img.shields.io/badge/Drizzle-ORM-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black)](https://orm.drizzle.team)

</div>

---

## Overview

**SkillSync** is a modern career ecosystem that connects **candidates** and **recruiters** through AI. Candidates upload their CV, get instant AI insights, follow personalised learning roadmaps, earn XP, take quizzes, and apply to jobs. Recruiters search a smart talent pool, shortlist candidates, manage applications, and reach out with AI-assisted outreach — all in one polished, realtime workspace.

> Think Linear meets Discord meets LinkedIn — but actually useful, and powered by Claude/GPT-class models.

---

## Highlights

- **AI Career Assistant** — context-aware chat that knows your CV, roadmap progress, and profile.
- **AI Roadmaps & Quizzes** — generated learning journeys with XP, levels, and validation quizzes.
- **CV Intelligence** — upload a PDF, get parsed structure, scoring, and improvement suggestions.
- **GitHub Insights** — pull repo stats, languages, and contribution signals into your profile.
- **Sync Feed** — a community feed where posts rank by "Syncs" (likes).
- **Realtime Chat** — Ably-powered private conversations between candidates and recruiters.
- **Recruiter Toolkit** — search, shortlists, jobs CRUD, applications pipeline, AI outreach emails.
- **Branded Emails** — Resend + React Email for welcome, application, and shortlist notifications.

---

## Tech Stack

| Layer | Tools |
|---|---|
| **Framework** | Next.js 16 (App Router), React 19, TypeScript 5 |
| **Styling** | TailwindCSS 4, Framer Motion, Lucide icons |
| **Auth** | Clerk (with Svix webhooks) |
| **Database** | PostgreSQL on Neon, Drizzle ORM, Drizzle Kit |
| **AI** | OpenRouter, Vercel AI SDK, OpenAI SDK |
| **Realtime** | Ably |
| **Files** | UploadThing, `pdf-parse`, `jspdf` |
| **Email** | Resend + React Email |
| **Misc** | Server Actions, Edge-friendly handlers |

---

## Architecture

```
SkillSync
├── app/                              # Next.js App Router
│   ├── (public)                      # Landing, sign-in, sign-up
│   ├── onboarding/                   # Role selection + profile setup
│   ├── dashboard/
│   │   ├── ai/                       # AI career chat
│   │   ├── cv/                       # CV upload, parsing, insights
│   │   ├── github/                   # GitHub profile insights
│   │   ├── roadmaps/                 # AI roadmaps + quizzes + XP
│   │   ├── jobs/                     # Browse + apply (candidate)
│   │   ├── feed/                     # Sync social feed
│   │   ├── chat/                     # Realtime private chat
│   │   ├── candidates/[id]/          # Public candidate profile
│   │   ├── outreach/                 # AI-generated recruiter outreach
│   │   └── recruiter/                # Search, shortlist, jobs, applications
│   └── api/                          # Webhooks, AI streaming, uploads
├── components/                       # Reusable UI (feed, chat, profile, layout, ui)
├── lib/
│   ├── ai/                           # AI generation utilities
│   ├── roadmaps/                     # Roadmap + quiz generation
│   ├── recruiter/                    # Recruiter search logic
│   ├── resume/                       # CV extract / parse / analyze
│   ├── github/                       # GitHub fetch + insights
│   ├── ably/                         # Realtime server + client
│   ├── email/                        # Resend templates
│   ├── xp/                           # Level + XP calculations
│   ├── i18n/                         # Translations + language context
│   └── auth.ts                       # Clerk + DB user resolution
└── src/db/schemas/                   # Drizzle schemas (users, jobs, posts, chat, ...)
```

### Role separation

Every protected surface is guarded **both** on the frontend and inside server actions:

- **Candidates** cannot create jobs or access recruiter pages.
- **Recruiters** cannot apply to jobs or use candidate-only tooling.
- **Mentors** (planned) get their own surface.

---

## Getting Started

### 1. Prerequisites

- **Node.js** ≥ 20
- **PostgreSQL** (recommended: a free [Neon](https://neon.tech) project)
- Accounts on **Clerk**, **Ably**, **UploadThing**, **Resend**, and **OpenRouter**

### 2. Clone & install

```bash
git clone https://github.com/<your-username>/skillsync.git
cd skillsync
npm install
```

### 3. Environment variables

Create a `.env.local` at the project root:

```env
# Database
DATABASE_URL="postgres://..."

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
CLERK_WEBHOOK_SIGNING_SECRET="whsec_..."

# AI
OPENROUTER_API_KEY="sk-or-..."

# Realtime
ABLY_API_KEY="xxxx:yyyy"

# Uploads
UPLOADTHING_TOKEN="..."

# Email
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="SkillSync <noreply@yourdomain.com>"

# GitHub (optional, for /dashboard/github)
GITHUB_TOKEN="ghp_..."
```

### 4. Database

```bash
npx drizzle-kit push      # sync schemas to your Postgres
```

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Feature Tour

### Candidate

| Feature | What it does |
|---|---|
| **Onboarding** | Picks role, sets profile, lands in dashboard |
| **AI Chat** | Streaming career assistant aware of CV + roadmap progress |
| **CV** | Upload PDF, parse structure, view insights and gaps |
| **GitHub** | Connect handle, surface repos, languages, contribution signals |
| **Roadmaps** | Generate AI learning paths, complete nodes, earn XP |
| **Quizzes** | Validate roadmap nodes with auto-graded quizzes |
| **Jobs** | Browse openings, one-click apply |
| **Feed** | Post updates, collect Syncs, climb the ranking |
| **Chat** | Realtime DMs with recruiters who reach out |

### Recruiter

| Feature | What it does |
|---|---|
| **Search** | Query the candidate pool with smart filters |
| **Shortlist** | Save candidates for later, get notified on updates |
| **Jobs** | Create, edit, publish roles (internships, FT, remote) |
| **Applications** | Triage incoming applicants in a clean pipeline |
| **Outreach** | Generate personalised outreach emails with AI |
| **Chat** | Open a private conversation with any shortlisted candidate |

---

## Scripts

```bash
npm run dev      # start the dev server
npm run build    # production build
npm run start    # serve the production build
npm run lint     # eslint
```

---

## Design Principles

- **Modular** — server components, client components, server actions and feature modules are kept apart.
- **Optimistic & responsive** — async surfaces ship with loading skeletons, disabled states and toast feedback.
- **AI-native** — every AI call returns validated, structured output with safe fallbacks.
- **Relational integrity** — cascade deletes and indexed FKs across Drizzle schemas.
- **Strict TypeScript** — no `any` smuggling, narrow types at boundaries.

---

## Roadmap

- [ ] Mentor role + mentorship matching
- [ ] Achievements & badges on top of XP
- [ ] Team accounts for recruiter orgs
- [ ] Interview prep simulator
- [ ] Public profile pages with custom slugs
- [ ] Mobile-first PWA polish

---

## Contributing

Issues and PRs are welcome. Please:

1. Open an issue describing the change before large refactors.
2. Keep PRs scoped — one feature or one fix.
3. Run `npm run lint` and make sure `npm run build` passes.
4. Respect role separation rules (candidate vs. recruiter) in both UI and server actions.

---

## License

This project is licensed under the GNU Affero General Public License v3.0 (AGPL-3.0).

See the LICENSE file for details.
---

<div align="center">

Built with care by the SkillSync team.
If this project helped you, consider starring the repo.

</div>

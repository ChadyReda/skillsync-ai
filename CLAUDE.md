@AGENTS.md
# SkillSync — AI Career Platform

## Overview

SkillSync is an AI-powered career ecosystem built with:

- Next.js App Router
- TypeScript
- TailwindCSS
- Clerk Authentication
- Drizzle ORM
- PostgreSQL
- OpenRouter AI
- Socket.IO (custom self-hosted realtime server in socket-server/)
- UploadThing
- Resend

The platform connects candidates and recruiters through:
- AI roadmaps
- AI quizzes
- CV parsing and analysis
- Realtime chat
- Job offers
- Applications
- Social feed system ("Syncs")
- Recruiter candidate discovery

The project already contains working backend modules and database schemas.

Your role is to:
- improve architecture
- improve frontend UX/UI
- improve responsiveness
- connect modules together cleanly
- finish production-quality flows
- preserve existing logic

DO NOT rewrite the entire backend unless necessary.

---

# Tech Stack

## Frontend

- Next.js 16 App Router
- React
- TypeScript
- TailwindCSS

## Backend

- Server Actions
- Drizzle ORM
- PostgreSQL

## Services

- Clerk → auth
- UploadThing → file uploads
- Resend → emails
- OpenRouter → AI
- Socket.IO (socket-server/) → realtime chat + file messages

---

# Core Product Philosophy

The app must feel:
- modern
- intelligent
- fast
- premium
- emotionally engaging

The UI should feel closer to:
- Linear
- Notion
- Discord
- Framer
- modern SaaS dashboards

NOT like:
- Bootstrap admin panel
- outdated CRUD dashboard
- generic templates

---

# Existing Features

## Authentication

- Clerk authentication
- onboarding flow
- candidate/recruiter roles

## Candidate Features

- AI chat assistant
- CV upload
- CV parsing
- CV insights
- AI roadmaps
- quizzes
- XP and leveling system
- job applications
- social posts

## Recruiter Features

- candidate search
- candidate shortlists
- jobs CRUD
- applications management

## Shared Features

- realtime private chat
- notifications/emails
- social feed
- sync system (likes)

---

# CRITICAL RULES

## ROLE SEPARATION

Candidates CANNOT:
- create jobs
- access recruiter pages
- view recruiter dashboards

Recruiters CANNOT:
- apply for jobs
- access candidate-only tools

All role checks must exist BOTH:
- frontend
- backend/server actions

---

# FRONTEND EXPECTATIONS

You MUST heavily improve frontend quality.

## Required UI qualities

- responsive
- animated
- modern spacing
- loading skeletons
- optimistic updates
- proper empty states
- smooth hover states
- modals/dialogs
- toast notifications
- polished forms
- accessible UI

## UI Components

Create reusable:
- cards
- buttons
- modals
- tabs
- forms
- loaders
- empty states
- avatars
- badges
- dropdowns

## Design Language

Use:
- rounded-2xl
- subtle borders
- soft shadows
- spacing consistency
- strong typography hierarchy

Prefer:
- dark/light compatible architecture
- clean gradients
- minimalistic UI

---

# FRONTEND ENGINEERING REQUIREMENTS

## Component Architecture

Frontend MUST be modular.

Separate:
- server components
- client components
- actions
- reusable UI
- feature modules

Example:

/components/ui
/components/feed
/components/chat
/components/jobs
/components/roadmaps

---

## State Management

Use:
- local state when enough
- optimistic UI when possible
- avoid unnecessary global state

---

## Loading UX

Every async interaction MUST include:
- loading states
- disabled buttons
- feedback
- retry/error UI

Examples:
- uploading CV
- creating roadmap
- syncing posts
- sending messages
- applying for jobs

---

# EMAIL SYSTEM

Use Resend for:

- welcome emails
- roadmap completion
- quiz success
- application submitted
- recruiter receives application
- recruiter shortlist notifications

Emails must feel modern and branded.

---

# AI SYSTEMS

AI should:
- know current user context
- use resume data
- use roadmap progress
- use profile data

AI outputs should always return:
- structured JSON when required
- safe fallbacks
- validated outputs

---

# DATABASE RULES

- keep schemas clean
- add indexes when necessary
- use cascade deletes
- preserve relational consistency

---

# CHAT SYSTEM

Realtime chat uses Ably.

Improve:
- typing indicators
- unread counters
- online presence
- conversation previews

---

# FEED SYSTEM

The social feed is called:
# Sync Feed

Likes are called:
# Syncs

Posts with more syncs rank higher.

The feed should feel:
- addictive
- alive
- community-driven

---

# ROADMAP SYSTEM

Roadmaps are AI-generated learning journeys.

Future-ready architecture:
- roadmap nodes
- quizzes
- XP
- levels
- achievements

Keep system scalable.

---

# JOB SYSTEM

Jobs support:
- internships
- full-time jobs
- remote opportunities

Applications should:
- feel premium
- be easy
- encourage conversions

---

# PERFORMANCE

Optimize:
- database queries
- unnecessary rerenders
- client bundle size
- loading waterfalls

---

# CODING STYLE

Use:
- strict TypeScript
- clean naming
- reusable utilities
- feature-first organization

Avoid:
- massive files
- duplicated logic
- inline complex logic
- ugly UI

---

# FINAL GOAL

Transform the current MVP into:
- a polished production-ready SaaS
- modern AI-native career platform
- beautiful responsive application
- highly modular codebase
- delightful UX

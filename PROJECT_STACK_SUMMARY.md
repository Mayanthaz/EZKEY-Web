# EZKEY Project Stack Summary

## 1) Project Overview
This project is a full-stack digital marketplace application for buying and selling digital products, vouchers, keys, and accounts. It combines a modern Next.js frontend, Supabase-powered authentication and database layer, a Spring Boot backend, and external KYC / verification services.

---

## 2) Full-Stack Architecture

### Frontend
- Next.js (App Router)
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui component system
- Radix UI primitives
- Vercel-ready deployment

### Backend
- Java 17
- Spring Boot 3.3.5
- Spring Web
- Spring Validation
- Maven build system

### Database / Auth / Real-time
- Supabase Postgres
- Supabase Auth
- Row Level Security (RLS)
- Server-side and browser-side Supabase clients

### External Services
- Didit Protocol SDK for KYC / identity verification
- Webhook validation for seller verification
- Google OAuth integration via Supabase

### Styling / UI
- Tailwind CSS
- custom dark cyber theme
- Google Fonts (Poppins, Orbitron, JetBrains Mono)
- Lucide React icons

---

## 3) Tech Stack by Layer

### Frontend Stack
- Language: TypeScript, TSX
- Framework: Next.js
- UI Library: React 19
- Styling: Tailwind CSS, custom CSS variables
- Components: shadcn/ui + Radix UI
- Auth: Supabase SSR + Auth
- State/UI Helpers: clsx, tailwind-merge, class-variance-authority
- Icons: lucide-react
- Fonts: next/font/google
- Deployment target: Vercel

### Backend Stack
- Language: Java
- Framework: Spring Boot 3.3.5
- API layer: Spring Web (REST controllers)
- Validation: spring-boot-starter-validation
- Build Tool: Maven
- Java version: 17

### Data Layer
- Database: PostgreSQL via Supabase
- Migration system: SQL migration files in supabase/migrations
- Security: Supabase RLS policies
- Data model: profiles, seller_verifications, didit webhook events

### Security / Identity / KYC
- Supabase Authentication
- Google OAuth
- Email OTP confirmation flow
- Didit KYC verification sessions
- Signed webhook verification (timestamp + signature checks)

---

## 4) File-by-File Scan

| File / Folder | Primary Language | Tech Used | Purpose |
|---|---|---|---|
| package.json | JSON / Node | Next.js, React, Supabase, Tailwind, TypeScript, ESLint | Frontend dependencies, scripts, app setup |
| next.config.ts | TypeScript | Next.js config | App configuration |
| tsconfig.json | JSON | TypeScript compiler | TypeScript project config |
| tailwind.config.ts | TypeScript | Tailwind CSS | Theme setup and custom design tokens |
| components.json | JSON | shadcn/ui | UI component config |
| app/layout.tsx | TypeScript / JSX | Next.js App Router, React, Google Fonts | Global app layout, metadata, Navbar/Footer |
| app/page.tsx | TypeScript / JSX | Next.js page UI | Main landing page |
| app/auth/** | TypeScript / JSX | Next.js routes, Supabase auth pages | Login, signup, forgot password, callback flow |
| app/dashboard/** | TypeScript / JSX | Next.js app pages | Protected dashboard and seller/buyer sections |
| app/marketplace/** | TypeScript / JSX | Next.js pages, React | Marketplace browsing and product views |
| app/api/** | TypeScript / Route Handlers | Next.js API routes, server-side logic | KYC session endpoints, webhooks, auth callbacks |
| components/** | TypeScript / JSX | React, shadcn/ui, Tailwind | Reusable UI components |
| lib/** | TypeScript | Supabase, Didit SDK, utility code | Service logic, auth helpers, seller verification |
| lib/supabase/client.ts | TypeScript | Supabase SSR browser client | Frontend Supabase client |
| lib/supabase/server.ts | TypeScript | Supabase SSR server client | Server-side auth/session handling |
| lib/didit.ts | TypeScript | Didit SDK / API integration | Didit KYC configuration and logic |
| lib/didit-webhook.ts | TypeScript | Webhook validation | Signature and timestamp verification |
| lib/seller-verification.ts | TypeScript | Supabase + verification logic | Seller KYC state management |
| supabase/migrations/*.sql | SQL | PostgreSQL / Supabase | Database schema and RLS policies |
| backend/pom.xml | XML | Maven, Spring Boot | Java backend dependency and plugin config |
| backend/src/main/** | Java | Spring Boot | Main backend application code |
| backend/README.md | Markdown | Docs | Backend documentation |
| README.md | Markdown | Docs | Project setup and product notes |

---

## 5) Core Technologies Identified

### JavaScript / TypeScript Stack
- TypeScript
- React
- Next.js
- Node.js ecosystem
- ESLint

### Java Stack
- Java 17
- Spring Boot 3.3.5
- Maven
- Jakarta / Spring Validation

### Database Stack
- PostgreSQL (via Supabase)
- SQL migrations
- RLS policies

### Cloud / Hosting Stack
- Vercel (frontend hosting)
- Supabase (auth, database, storage, RLS)
- External KYC provider: Didit

### UI / Design Stack
- Tailwind CSS
- shadcn/ui
- Radix UI
- custom cyber-themed styling

---

## 6) What This Project Uses Overall

This is a modern full-stack application using:
- Next.js + React for the frontend
- TypeScript for strongly typed frontend development
- Tailwind CSS for styling
- Supabase for auth and database
- Spring Boot + Java for backend APIs
- PostgreSQL for data persistence
- Didit for KYC / identity verification
- Vercel-ready deployment

---

## 7) Quick Summary

### Primary stack
- Frontend: Next.js + React + TypeScript + Tailwind
- Backend: Java + Spring Boot + Maven
- Database/Auth: Supabase + PostgreSQL
- KYC: Didit
- Deployment: Vercel / Supabase ecosystem

### Business model fit
This project is built as a digital marketplace with:
- buyer/seller flows
- protected dashboard areas
- authentication and onboarding
- KYC verification for sellers
- escrow-oriented marketplace logic
- webhooks and secure verification status processing

---

## 8) Best One-Line Tech Stack Statement

EZKEY is a full-stack marketplace application built with Next.js + React + TypeScript on the frontend, Java + Spring Boot on the backend, Supabase + PostgreSQL for authentication and database services, Tailwind CSS for styling, and Didit for seller KYC verification and webhook-based compliance flows.

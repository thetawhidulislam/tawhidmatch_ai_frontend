# TawhidMatch AI — Frontend

Next.js 15 (App Router) + TypeScript + Tailwind CSS v4 + shadcn/ui (components hand-added,
not via CLI — see note below) + TanStack Query + Zustand + React Hook Form + Zod.

## Setup

```bash
npm install
npm run dev
```
Runs at `http://localhost:3000`. Make sure the backend is running at `http://localhost:5000`
(check `.env.local` if you changed the backend port).

## Folder Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── dashboard/page.tsx      # placeholder — protected page
│   ├── layout.tsx
│   ├── page.tsx                # redirects to /login
│   └── providers.tsx           # React Query + Toaster
├── components/ui/              # shadcn components (button, input, card, form, etc.)
├── lib/
│   ├── api.ts                  # axios instance + auth header + 401 handling
│   ├── auth.ts                 # registerUser(), loginUser()
│   └── get-error-message.ts    # extracts backend error message from axios errors
├── store/
│   └── auth-store.ts           # zustand — user, token, persisted to localStorage
└── types/index.ts              # shared TS types matching backend API shapes
```

## About the shadcn/ui setup

The sandbox this was built in couldn't reach `ui.shadcn.com` (network-restricted), so instead
of running `npx shadcn@latest add ...`, the component files were written by hand using the
same code shadcn's CLI would generate (Tailwind v4 + CSS variables, "new-york" style,
neutral base color). This means:
- `components.json` is already configured correctly
- Running `npx shadcn@latest add <component>` on your own machine (with internet) will work
  normally for any *new* components you want to add later (dialog, select, dropdown-menu, etc.)
- Already-added components: button, input, label, card, form, badge, avatar, sonner (toast)

## What's built

- Login page (`/login`) — form validation, error toast, redirects to `/dashboard` on success
- Register page (`/register`) — same pattern
- Auth state persisted in localStorage via zustand (survives refresh)
- Axios auto-attaches `Authorization: Bearer <token>`, auto-logs-out on 401
- Placeholder dashboard with logout

## What's next (build in this order)

1. Job listing page (`/jobs`) — search, filter, pagination — calls `GET /api/jobs`
2. Job detail page (`/jobs/[id]`) — apply button, AI match score
3. Resume upload UI (`/dashboard/resumes`) — file input, list, analyze button, AI analysis result display
4. Applications tracker (`/dashboard/applications`)
5. Mock interview UI (`/dashboard/interviews`) — question flow, answer submission, results
6. Admin pages (`/admin/*`) — job CRUD, applications management, users list, dashboard stats

Ask for a Copilot prompt for each of these one at a time, same pattern as the backend.

# Insighta Labs+ — Web Portal

The Web Portal is the browser-based interface for the **Insighta Labs+ Platform** — a secure, multi-interface profile intelligence system. It gives non-technical users (analysts, stakeholders) full access to profile data through a clean, authenticated UI backed by the same API used by the CLI.

> **Part of a 3-repository system:** [Backend](https://github.com/your-org/insighta-backend) · **Web Portal** (this repo) · [CLI](https://github.com/your-org/insighta-cli)

---

## Table of Contents

- [Live Demo](#live-demo)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Authentication Flow](#authentication-flow)
- [Token Handling](#token-handling)
- [Role Enforcement](#role-enforcement)
- [Pages & Features](#pages--features)
- [Environment Variables](#environment-variables)
- [Local Development](#local-development)
- [Running Tests](#running-tests)
- [CI/CD](#cicd)
- [Deployment](#deployment)

---

## Live Demo

| | URL |
|---|---|
| Web Portal | `https://your-portal-url.vercel.app` |
| Backend API | `https://your-backend-url.railway.app` |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + Vite 8 |
| Routing | React Router DOM v7 |
| HTTP Client | Axios |
| Styling | Tailwind CSS v3 |
| Auth | GitHub OAuth (HTTP-only cookies via backend) |
| Testing | Vitest + Testing Library |
| Linting | ESLint v10 (flat config) |
| CI/CD | GitHub Actions |

---

## System Architecture

The Web Portal is a **pure frontend SPA**. It has no server of its own — all data, authentication, and business logic is handled by the shared backend.

```
┌─────────────────────────────────────────────────────┐
│                  Insighta Labs+                      │
│                                                     │
│   ┌──────────────┐        ┌──────────────────────┐  │
│   │  Web Portal  │◄──────►│   Backend API        │  │
│   │  (this repo) │  HTTP  │   /auth/*            │  │
│   │  React + Vite│        │   /api/profiles/*    │  │
│   └──────────────┘        └──────────┬───────────┘  │
│                                      │               │
│   ┌──────────────┐                   │               │
│   │  CLI Tool    │◄──────────────────┘               │
│   │  (insighta)  │  Same API, token-based auth       │
│   └──────────────┘                                   │
└─────────────────────────────────────────────────────┘
```

The Web Portal and CLI are **independent clients** that share one backend. Any data created or modified through either interface is immediately reflected in the other.

---

## Authentication Flow

The portal uses **GitHub OAuth** managed entirely by the backend. The browser never handles tokens directly.

```
User clicks "Continue with GitHub"
        │
        ▼
GET /auth/github  (backend redirects to GitHub)
        │
        ▼
User authorises on GitHub
        │
        ▼
GitHub redirects to → GET /auth/github/callback (backend)
        │
        ├── Backend exchanges code for GitHub user info
        ├── Creates or updates user record
        ├── Issues access token (3 min) + refresh token (5 min)
        └── Sets both as HTTP-only cookies on the response
        │
        ▼
Browser lands on /dashboard (authenticated)
```

**Why HTTP-only cookies?**
Tokens are stored in HTTP-only cookies, making them inaccessible to JavaScript. This prevents XSS attacks from ever reading or stealing auth tokens. CSRF protection is enforced on the backend for all state-mutating requests.

---

## Token Handling

| Token | Lifetime | Storage |
|---|---|---|
| Access token | 3 minutes | HTTP-only cookie |
| Refresh token | 5 minutes | HTTP-only cookie |

The backend handles the token lifecycle. From the browser's perspective:

- Every request automatically includes cookies (Axios is configured with `withCredentials: true`)
- If the backend returns `401`, Axios's response interceptor automatically calls `POST /auth/refresh`
- If the refresh also fails (expired or invalidated), the user is redirected to `/login`
- Refresh tokens are **single-use** — each refresh invalidates the old token and issues a new pair

```js
// src/lib/api.js — simplified interceptor logic
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true
      await api.post('/auth/refresh')
      return api(error.config)  // retry original request
    }
    return Promise.reject(error)
  }
)
```

---

## Role Enforcement

The backend enforces two roles. The portal adapts its UI to match.

| Role | Permissions | Default? |
|---|---|---|
| `admin` | Full access — view, search, create, and delete profiles | No |
| `analyst` | Read-only — view and search profiles only | Yes (all new users) |

**How the portal handles roles:**

- After login, the current user's role is fetched from `GET /auth/me` and stored in `AuthContext`
- `ProtectedRoute` wraps all pages that require authentication — unauthenticated users are redirected to `/login`
- Admin-only UI elements (e.g. "Create Profile" button) are conditionally rendered based on `user.role`
- Even if an analyst manually navigates to a restricted action, the backend rejects the request with `403 Forbidden`

```jsx
// Role-gated UI element example
{user.role === 'admin' && (
  <button onClick={handleCreate}>Create Profile</button>
)}
```

> The portal enforces roles in the UI as a UX convenience. The backend is the real enforcement layer.

---

## Pages & Features

| Page | Route | Access | Description |
|---|---|---|---|
| Login | `/login` | Public | GitHub OAuth entry point |
| OAuth Callback | `/callback` | Public | Handles GitHub redirect, establishes session |
| Dashboard | `/dashboard` | Auth required | Summary metrics and quick navigation |
| Profiles List | `/profiles` | Auth required | Paginated list with filters and sorting |
| Profile Detail | `/profiles/:id` | Auth required | Full profile view for a single record |
| Search | `/search` | Auth required | Natural language search (e.g. "young males from Nigeria") |
| Account | `/account` | Auth required | Logged-in user info and logout |

### Profiles List — Supported Filters

| Filter | Query param | Example |
|---|---|---|
| Gender | `gender` | `?gender=male` |
| Country | `country` | `?country=NG` |
| Age group | `age_group` | `?age_group=adult` |
| Min age | `min_age` | `?min_age=25` |
| Max age | `max_age` | `?max_age=40` |
| Sort by | `sort_by` | `?sort_by=age` |
| Order | `order` | `?order=desc` |
| Page | `page` | `?page=2` |
| Limit | `limit` | `?limit=20` |

---

## Environment Variables

Create a `.env` file in the project root. Never commit this file.

```env
VITE_API_BASE_URL=https://your-backend-url.railway.app
```

> All environment variables exposed to the browser must be prefixed with `VITE_`. The backend URL is the only required variable — it is injected at build time by Vite.

A `.env.example` is provided — copy it to get started:

```bash
cp .env.example .env
```

---

## Local Development

**Prerequisites:** Node.js 20+, npm 9+

```bash
# 1. Clone the repository
git clone https://github.com/your-org/insighta-web-portal.git
cd insighta-web-portal

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env and point VITE_API_BASE_URL at your backend

# 4. Start the dev server
npm run dev
```

The app will be available at `http://localhost:5173`.

**Available scripts:**

| Script | Description |
|---|---|
| `npm run dev` | Start local dev server with hot reload |
| `npm run build` | Production build (outputs to `dist/`) |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint |
| `npm test` | Run tests (single pass) |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with V8 coverage report |

---

## Running Tests

The test suite uses **Vitest** and **Testing Library**.

```bash
npm test
```

Tests are colocated with their components (e.g. `src/components/ProtectedRoute.test.jsx`).

```bash
npm run test:coverage
# Coverage report saved to ./coverage/
```

**What's currently tested:**

- `ProtectedRoute` — loading state, authenticated render, unauthenticated redirect to `/login`

---

## CI/CD

GitHub Actions runs on every **pull request to `main`** and every **direct push to `main`**.

```
lint → test → build
```

| Job | What it checks |
|---|---|
| Lint | ESLint passes with zero errors |
| Test | All Vitest tests pass |
| Build | `vite build` completes successfully |

The workflow is defined at `.github/workflows/ci.yml`. All three jobs must pass before a PR can be merged.

---

## Deployment

The Web Portal is a static SPA and can be deployed to any static host.

**Recommended: Vercel**

```bash
npm i -g vercel
vercel --prod
```

Set `VITE_API_BASE_URL` in your Vercel project's Environment Variables (Settings → Environment Variables). Vercel injects it at build time.

**Required: SPA redirect rule**

Add a `vercel.json` at the project root so all paths serve `index.html` (required for client-side routing):

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

For Netlify, add a `public/_redirects` file with:

```
/* /index.html 200
```

---

## Engineering Standards

This project follows the conventions defined in the Insighta Labs+ TRD:

- **Commits:** Conventional commits with scope — e.g. `feat(auth): add github oauth callback`, `fix(profiles): correct pagination offset`
- **Branches:** Feature branches only; all changes merged to `main` via pull request
- **PRs:** CI must pass before merging — no direct pushes to `main`
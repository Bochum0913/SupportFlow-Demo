# SupportFlow — Interactive IT Support Portfolio Demo

**A modern React support-ticket dashboard with simulated AI-driven ticket workflows.**

### [Open the live demo](https://supportflow-demo.pages.dev) · [Explore the full-stack AI Support Agent source](https://github.com/Bochum0913/AISupportAgent)

![Deployment](https://img.shields.io/badge/Hosting-Cloudflare%20Pages-orange) ![React](https://img.shields.io/badge/Frontend-React-blue) ![Demo](https://img.shields.io/badge/AI-Simulated-yellow)

> **Important:** This public portfolio version uses **rule-based, simulated AI responses**, not an actual AI model or API. Tickets are saved only in your own browser's `localStorage`; visitors do not share a database. The banner in the app makes this clear.

## Highlights

- Responsive SaaS-style ticket dashboard with total, open and resolved counts
- Create support tickets and browse existing requests
- Search and filter by status, priority and category
- Review ticket details and update support workflows
- Chat-style **simulated** assistant that can demonstrate ticket creation and priority changes
- Browser-local persistence across page refreshes
- Static hosting with Cloudflare Pages and GitHub-based deployments

## Try it

1. Open [supportflow-demo.pages.dev](https://supportflow-demo.pages.dev).
2. Create a ticket in **New support ticket**.
3. Click **Ask AI** and enter: `Create a ticket for my VPN issue and set priority to High`.
4. Find the new ticket in the list, then refresh the page to see browser-local persistence.
5. Try: `Change INC-1001 priority to High` (replace the ID with a ticket shown in your browser).

The assistant matches common patterns; it is **not** an open-ended language model. Other instructions may not be recognized.

## Tech stack

| Area | Technology |
| --- | --- |
| UI | React, JavaScript, Vite, CSS |
| Demo workflows | Browser-side mock API and rule-based message handling |
| Storage | Browser `localStorage` |
| Hosting | Cloudflare Pages |
| Source and deployment | GitHub + Git-triggered builds |

## Run locally

Requirements: Node.js and npm.

```bash
npm install
```

Set the demo flag and start Vite:

**Windows PowerShell**

```powershell
$env:VITE_DEMO_MODE="true"
npm.cmd run dev
```

**macOS / Linux**

```bash
VITE_DEMO_MODE=true npm run dev
```

Open the localhost URL displayed in the terminal. To build the public version locally:

```bash
# macOS / Linux
VITE_DEMO_MODE=true npm run build
```

On Windows PowerShell:

```powershell
$env:VITE_DEMO_MODE="true"
npm.cmd run build
```

## Cloudflare Pages deployment

This repository places `package.json` and `index.html` at its root.

| Setting | Value |
| --- | --- |
| Production branch | `main` |
| Framework preset | React (Vite) |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | Repository root (default) |
| Build environment variable | `VITE_DEMO_MODE=true` |

**Keep `VITE_DEMO_MODE=true` set for public deployment.** Never put API keys or secrets in variables prefixed with `VITE_`, because those values can be exposed in client-side bundles.

## How it differs from the full-stack project

The [AI Support Agent repository](https://github.com/Bochum0913/AISupportAgent) demonstrates a **real ASP.NET Core (.NET 10) backend**, Entity Framework Core, SQLite, knowledge-base services, and OpenAI API integration. This repository is a **safe, no-backend-cost frontend showcase** with simulated API behavior.

This demo does not collect tickets centrally, provide accounts, use a hosted database, or call OpenAI. Avoid entering private information into any public demo.

## Future improvements

- More accessible keyboard and mobile interactions
- Stronger automated UI tests
- Authenticated hosted backend with a persistent database
- Protected real-AI mode with explicit rate and spend limits

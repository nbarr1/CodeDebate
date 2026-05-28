# Multi-Agent Code Review

A web app that sends your code to **Claude**, **GPT-4o**, and **Gemini** simultaneously. Each model sees the others' responses across up to 3 debate rounds (extendable to 6), then a Claude "senior engineering lead" synthesizes a final verdict. A patch panel then lets Claude apply the recommendations and generate the corrected file directly.

## Features

- Real API calls to all three models — not personas
- Up to 3 debate rounds with early-exit on ≥2 HIGH consensus signals
- Extend by 3 more rounds after synthesis (up to 6 total)
- Final synthesis by Claude acting as engineering lead
- **Agentic patch generation** — Claude applies the synthesis to produce a corrected file with copy/download
- **GitHub integration** — load a file or PR diff directly from a URL
- API keys saved to `localStorage` — enter once per session

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## API Keys

You'll need keys for all three models. Enter them in the **API Keys** panel on first load — they persist in `localStorage` for the session.

| Model   | Provider  | Where to get one |
|---------|-----------|-----------------|
| Claude  | Anthropic | [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys) |
| GPT-4o  | OpenAI    | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |
| Gemini  | Google    | [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) |
| GitHub  | GitHub    | [github.com/settings/tokens](https://github.com/settings/tokens) — optional, for private repos |

Keys are stored in `localStorage` only — never committed to git, never sent anywhere except their respective APIs.

> **Note for Codespaces / ephemeral environments:** `localStorage` is cleared on container restart. Re-enter your keys after each restart, or set `VITE_CLAUDE_KEY`, `VITE_OPENAI_KEY`, `VITE_GEMINI_KEY` as Codespaces Secrets (GitHub → Settings → Secrets and variables → Codespaces) so they are available as environment variables when the dev server starts.

## GitHub Integration

Paste a GitHub URL into the **Load from GitHub** panel to populate the code field automatically:

| URL format | Example |
|---|---|
| File | `https://github.com/owner/repo/blob/main/src/index.js` |
| Pull request | `https://github.com/owner/repo/pull/42` |

Public repos work without a token. Add a GitHub token for private repos or to avoid the 60 req/hr unauthenticated rate limit.

## Project Structure

```
src/
├── api/
│   ├── claude.js        # Anthropic API client
│   ├── openai.js        # OpenAI API client
│   ├── gemini.js        # Google Generative Language client
│   ├── github.js        # GitHub URL parser + file/PR fetcher
│   └── index.js         # Dispatcher, prompt builders, patch caller
├── components/
│   ├── KeysPanel/       # API key management (all 4 keys + optional GitHub)
│   ├── GitHubPanel/     # Load file or PR diff from a GitHub URL
│   ├── CodeInput/       # Code + problem input
│   ├── DebateRound/     # Per-round 3-column agent response cards
│   ├── Synthesis/       # Engineering lead verdict panel
│   ├── Patch/           # Agentic patch generator (corrected file output)
│   └── StatusBar/       # Running status indicator
├── utils/
│   ├── agents.js        # Agent config, system prompts, MAX_ROUNDS
│   ├── storage.js       # localStorage helpers
│   └── format.js        # Response formatter + consensus extractor
├── App.jsx              # Main debate state machine
└── index.css            # Design tokens + global styles
```

## Roadmap

- [x] GitHub integration — load files/PRs from a URL
- [x] Extendable rounds — run 3 more rounds after synthesis
- [x] Agentic patch output — Claude generates the corrected file
- [ ] File upload — drag-and-drop `.js`, `.py`, `.ts`, etc.
- [ ] Conversation history — persist past debates
- [ ] Persistent API keys — env-var fallback for ephemeral environments

## Development

Built with [Vite](https://vitejs.dev/) 5.4.21 + [React](https://react.dev/) 18. No UI framework — CSS Modules and CSS custom properties only.

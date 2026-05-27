# Multi-Agent Code Review

A web app that sends your code to **Claude**, **GPT-4o**, and **Gemini** simultaneously, lets them debate the best approach across 3 rounds (each model sees the others' responses), then synthesizes a final recommendation from a senior engineering lead perspective.

## Features

- Real API calls to all three models — not personas
- Up to 3 debate rounds with early-exit on consensus
- Final synthesis by Claude acting as engineering lead
- API keys saved to `localStorage` — enter once, persist across sessions
- Responsive sidebar layout

## Getting Started

```bash
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173).

## API Keys

You'll need:

| Model   | Provider | Key source |
|---------|----------|------------|
| Claude  | Anthropic | No key needed — authenticated via Anthropic proxy |
| GPT-4o  | OpenAI   | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |
| Gemini  | Google   | [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) |

Keys are stored in `localStorage` — never committed to git, never sent anywhere except their respective APIs.

## Project Structure

```
src/
├── api/
│   ├── claude.js        # Anthropic API client
│   ├── openai.js        # OpenAI API client
│   ├── gemini.js        # Google Generative Language client
│   └── index.js         # Dispatcher + prompt builders
├── components/
│   ├── KeysPanel/       # API key management UI
│   ├── CodeInput/       # Code + problem input
│   ├── DebateRound/     # Per-round agent response cards
│   ├── Synthesis/       # Final verdict panel
│   └── StatusBar/       # Running status indicator
├── utils/
│   ├── agents.js        # Agent config + system prompts
│   ├── storage.js       # localStorage helpers
│   └── format.js        # Response formatter + consensus extractor
├── App.jsx              # Main debate state machine
└── index.css            # Design tokens + global styles
```

## Roadmap

- [ ] GitHub integration — pull files/PRs directly from a repo URL
- [ ] File upload — drag-and-drop `.js`, `.py`, `.ts`, etc.
- [ ] Patch output — export synthesis as a unified diff / PR
- [ ] Conversation history — persist past debates

## Development

Built with [Vite](https://vitejs.dev/) + [React](https://react.dev/). No UI framework — just CSS Modules and CSS custom properties.

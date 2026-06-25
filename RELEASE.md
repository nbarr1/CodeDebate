# Stable Release: 1.0.0

Release date: 2026-06-25

This repository is marked as a stable, functional release of the Multi-Agent Code Review web application.

## Current stable capabilities

- Runs as a Vite + React browser application.
- Accepts pasted source code plus a problem statement for review.
- Loads a single GitHub file URL or a pull request diff URL into the review input.
- Runs a multi-agent debate across Claude, GPT-5.3 Codex, and Gemini when the user supplies the required API keys.
- Synthesizes the debate with Claude and can generate a corrected single-file output from the synthesis.

## Explicit non-capabilities in this release

This release does **not** currently provide full repository ingestion or automated pull request creation against a linked GitHub repository. GitHub integration is limited to loading either one file from a `github.com/.../blob/...` URL or a PR diff from a `github.com/.../pull/...` URL. Patch generation returns corrected text in the browser for copy/download; it does not create branches, commit changes, push to GitHub, or open a PR.

## Stability note

The application is stable for its documented browser-only workflow. Repository-wide analysis and PR automation should be treated as future feature work rather than supported behavior in this release.

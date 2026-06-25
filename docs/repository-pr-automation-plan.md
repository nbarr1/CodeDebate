# Repository-Wide Review and Pull Request Automation Plan

This plan describes how to add support for repository-wide ingestion, multi-file edits, and automated GitHub pull request creation to the current browser-first code review app.

## Goal

Enable a user to paste a linked GitHub repository URL, let the app inspect the repository tree, generate recommended multi-file changes, create a branch, commit those changes, push them to GitHub, and open a pull request automatically.

## Recommended architecture

The current app makes provider API calls directly from the browser. Repository-wide PR automation should add a small backend service because GitHub write operations require safer token handling, larger payload processing, retries, job state, and server-side validation.

Recommended components:

1. **Frontend workflow**
   - Accept a repository URL, base branch, optional target paths, and review instructions.
   - Show a repository scan summary before any model call.
   - Let the user approve proposed changes before branch creation and PR submission.

2. **Backend API**
   - Store GitHub tokens only server-side or use a GitHub App installation token.
   - Crawl repository trees with GitHub APIs.
   - Filter binary, generated, vendored, and oversized files.
   - Chunk repository context for model review.
   - Apply model-generated multi-file patches in a temporary workspace.
   - Run validations.
   - Create commits and pull requests through GitHub APIs.

3. **Job queue**
   - Run repository scans, model reviews, patch application, and validation asynchronously.
   - Persist progress so long-running jobs can survive page refreshes.

## Implementation phases

### Phase 1: Repository URL parsing and tree crawl

- Extend GitHub URL parsing to support repository URLs such as `https://github.com/owner/repo` and branch URLs such as `https://github.com/owner/repo/tree/main`.
- Fetch repository metadata, default branch, branch refs, and recursive trees.
- Add filtering rules for files that should not be reviewed by default:
  - binary files
  - lockfiles unless explicitly requested
  - dependency/vendor directories
  - generated build output
  - files above a configurable size limit
- Return a scan summary with file counts, language breakdown, total bytes, skipped files, and selected files.

### Phase 2: Read all selected repository files

- Fetch selected file blobs by SHA instead of one path at a time when possible.
- Decode UTF-8 text safely and skip unsupported encodings.
- Build a repository manifest containing each file path, size, language hint, and content hash.
- Enforce hard limits for total bytes and total files to control model cost and latency.

### Phase 3: Repository-aware review planning

- Replace the single `code` text area workflow with a repository review job view.
- Ask the models for a structured change plan before generating patches.
- Require model output in a schema (enforced via provider-native structured outputs or tool calling) such as:
  - summary
  - risks
  - files to change
  - per-file rationale
  - patch operations
  - validation commands
- Add a user approval step before applying edits.

### Phase 4: Multi-file patch generation and application

- Generate unified diffs or structured file operations for multiple files.
- Apply patches in a clean, isolated temporary checkout of the target branch (e.g., using unique temporary directories per job).
- Reject patches that touch files outside the approved file set unless the user re-approves.
- Detect conflicts, malformed patches, and attempts to modify binary files.
- Show a reviewable diff in the UI.

### Phase 5: Validation

- Infer project validation commands from repository metadata where possible.
- Allow the user to configure commands before execution, subject to strict input sanitization.\n- Run validations server-side in a highly restricted, ephemeral sandbox (e.g., gVisor or unprivileged containers) with no access to internal networks or credentials.
- Capture logs and include failures in the UI.
- Block automatic PR creation by default if validation fails, unless the user explicitly overrides.

### Phase 6: Branch creation

- Create a uniquely named branch from the selected base branch, for example `code-debate/review-YYYYMMDD-HHMMSS`.
- Use the GitHub Git refs API or a local clone plus authenticated push.
- Check whether the branch already exists and retry with a new suffix if needed.

### Phase 7: Commit generated changes

- Commit only the approved patch set.
- Use a generated commit message that includes:
  - concise title
  - summary of changed areas
  - validation results
  - model/tool provenance if desired
- Support both single-commit and multi-commit modes, with single-commit as the simpler default.

### Phase 8: Push to GitHub

- Push the generated branch using the GitHub API or authenticated Git transport.
- Handle protected branches by always pushing to a new branch, never directly to the base branch.
- Surface permission failures clearly, including missing `contents:write` scope or GitHub App permissions.

### Phase 9: Open the pull request automatically

- Create a PR from the generated branch into the selected base branch.
- Generate a PR title and body containing:
  - review objective
  - summary of changes
  - files changed
  - validation commands and outcomes
  - known limitations or follow-up work
- Return the PR URL to the frontend and keep the job record linked to that PR.

## Security and safety requirements

- Prefer GitHub App installation tokens over user personal access tokens.
- Never send GitHub write tokens to the browser after authentication.
- Require explicit user approval before writing branches or opening PRs.
- Limit repository access to the selected owner/repo.
- Redact secrets from logs and model prompts.
- Run validations in a sandbox with network policy controls.
- Add audit logs for branch creation, commit creation, pushes, and PR creation.

## Suggested API endpoints

- `POST /api/repositories/scan` — parse URL and return tree summary.
- `POST /api/reviews` — create a repository review job.
- `GET /api/reviews/:id` — fetch job status, model findings, and generated diffs.
- `POST /api/reviews/:id/apply` — apply approved patches in a workspace.
- `POST /api/reviews/:id/validate` — run configured validation commands.
- `POST /api/reviews/:id/pull-request` — create branch, commit, push, and open a PR.

## Milestones

1. **Read-only repository ingestion**: repository URL parsing, recursive tree crawl, file fetching, filtering, and scan UI.
2. **Repository-level recommendations**: structured review plans across selected files.
3. **Multi-file diff generation**: model-produced patches, patch application, and diff preview.
4. **Server-side validation**: configurable commands and validation result display.
5. **GitHub write automation**: branch creation, commit, push, and PR creation after user approval.
6. **Hardening**: GitHub App auth, audit logs, rate-limit handling, secret scanning, and job persistence.

## Acceptance criteria

- A user can paste a repository URL and see a filtered tree summary.
- The system can read all selected text files within configured limits.
- The system can produce and preview a multi-file diff.
- The user must approve before any GitHub write action occurs.
- The system can create a branch from the base branch.
- The system can commit generated changes to that branch.
- The system can push the branch to GitHub.
- The system can open a pull request and return its URL.
- Validation output is included in the final PR body.

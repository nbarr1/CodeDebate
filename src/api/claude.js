const ENDPOINT = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-sonnet-4-20250514'

/**
 * Calls the Anthropic Claude API.
 * API key is injected by the Anthropic proxy when running inside claude.ai artifacts.
 * In standalone mode the browser handles auth via the proxy — no key needed in code.
 */
export async function callClaude(systemPrompt, userContent) {
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userContent }],
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(`Claude ${response.status}: ${err.error?.message || response.statusText}`)
  }

  const data = await response.json()
  return data.content?.[0]?.text ?? 'No response.'
}

const ENDPOINT = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-sonnet-4-20250514'

export async function callClaude(systemPrompt, userContent, apiKey) {
  if (!apiKey?.trim()) throw new Error('Claude API key is required')

  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
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

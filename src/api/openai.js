const ENDPOINT = 'https://api.openai.com/v1/chat/completions'
const MODEL = 'gpt-4o'

/**
 * Calls the OpenAI Chat Completions API.
 * @param {string} systemPrompt
 * @param {string} userContent
 * @param {string} apiKey  — user-supplied OpenAI key
 */
export async function callOpenAI(systemPrompt, userContent, apiKey) {
  if (!apiKey?.trim()) throw new Error('OpenAI API key is required')

  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1000,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ],
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(`OpenAI ${response.status}: ${err.error?.message || response.statusText}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content ?? 'No response.'
}

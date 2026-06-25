const ENDPOINT = 'https://api.openai.com/v1/responses'
const MODEL = 'gpt-5.3-codex'

/**
 * Calls the OpenAI Responses API.
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
      instructions: systemPrompt,
      input: userContent,
      max_output_tokens: 1000,
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(`OpenAI ${response.status}: ${err.error?.message || response.statusText}`)
  }

  const data = await response.json()
  const outputText = data.output
    ?.flatMap((item) => item.content ?? [])
    ?.map((content) => content.text ?? '')
    ?.filter(Boolean)
    ?.join('\n')

  return data.output_text ?? outputText ?? 'No response.'
}

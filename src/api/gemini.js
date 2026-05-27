const MODEL = 'gemini-2.0-flash'

/**
 * Calls the Google Generative Language (Gemini) API.
 * @param {string} systemPrompt
 * @param {string} userContent
 * @param {string} apiKey  — user-supplied Google AI Studio key
 */
export async function callGemini(systemPrompt, userContent, apiKey) {
  if (!apiKey?.trim()) throw new Error('Gemini API key is required')

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: 'user', parts: [{ text: userContent }] }],
      generationConfig: { maxOutputTokens: 1000 },
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(
      `Gemini ${response.status}: ${err.error?.message || err.error?.status || response.statusText}`
    )
  }

  const data = await response.json()
  if (data.error) throw new Error(`Gemini: ${data.error.message}`)
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? 'No response.'
}

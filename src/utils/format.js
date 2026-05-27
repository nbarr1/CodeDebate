/**
 * Converts plain-text agent responses into safe HTML.
 * Handles: fenced code blocks, inline code, section labels, newlines.
 */
export function formatResponse(text = '') {
  return text
    // Fenced code blocks
    .replace(
      /```(\w+)?\n?([\s\S]*?)```/g,
      (_, _lang, code) =>
        `<pre><code>${code.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`
    )
    // Inline code
    .replace(
      /`([^`\n]+)`/g,
      (_, c) => `<code>${c.replace(/</g, '&lt;')}</code>`
    )
    // Section labels (ANALYSIS:, RECOMMENDATION:, etc.)
    .replace(
      /^(ANALYSIS:|RECOMMENDATION:|CONSENSUS:|AGREEMENT:|DISAGREEMENTS:|FINAL RECOMMENDATION:)/gm,
      '<span class="response-label">$1</span>'
    )
    // Newlines
    .replace(/\n/g, '<br>')
}

/**
 * Extracts the CONSENSUS level from an agent response.
 * Returns 'HIGH' | 'MEDIUM' | 'LOW' | null
 */
export function extractConsensus(text = '') {
  const match = text.match(/CONSENSUS:\s*(HIGH|MEDIUM|LOW)/i)
  return match ? match[1].toUpperCase() : null
}

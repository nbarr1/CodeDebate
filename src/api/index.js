import { callClaude } from './claude.js'
import { callOpenAI } from './openai.js'
import { callGemini } from './gemini.js'
import { SYNTHESIS_SYSTEM, PATCH_SYSTEM } from '../utils/agents.js'

export async function callAgent(agent, system, user, keys) {
  switch (agent.id) {
    case 'claude':
      return callClaude(system, user, keys.claude)
    case 'openai':
      return callOpenAI(system, user, keys.openai)
    case 'gemini':
      return callGemini(system, user, keys.gemini)
    default:
      throw new Error(`Unknown agent: ${agent.id}`)
  }
}

export async function callSynthesis(userContent, claudeKey) {
  return callClaude(SYNTHESIS_SYSTEM, userContent, claudeKey)
}

export async function callPatch(code, synthesis, claudeKey) {
  const user = `ORIGINAL CODE:\n\`\`\`\n${code}\n\`\`\`\n\nREVIEW SYNTHESIS:\n${synthesis}\n\nReturn the corrected file.`
  return callClaude(PATCH_SYSTEM, user, claudeKey, 4096)
}

/**
 * Builds the user message for a given debate round.
 * @param {number} roundNum        — 1-indexed current round
 * @param {string} code            — code under review
 * @param {string} problem         — user's question/problem
 * @param {Array}  previousRounds  — array of completed round arrays
 */
export function buildRoundPrompt(roundNum, code, problem, previousRounds) {
  let msg = `CODE UNDER REVIEW:\n\`\`\`\n${code}\n\`\`\`\n\nPROBLEM / QUESTION:\n${problem}`

  if (previousRounds.length > 0) {
    msg += '\n\n--- PREVIOUS ROUNDS ---'
    previousRounds.forEach((round, ri) => {
      msg += `\n\nROUND ${ri + 1}:`
      round.forEach((r) => {
        msg += `\n\n${r.name} (${r.company}):\n${r.response}`
      })
    })
    msg += `\n\n--- This is Round ${roundNum}. Engage directly with the responses above. ---`
  } else {
    msg += '\n\nRound 1: provide your independent analysis.'
  }

  return msg
}

/**
 * Builds the synthesis prompt from all completed rounds.
 */
export function buildSynthesisPrompt(code, problem, allRounds) {
  let msg = `CODE:\n\`\`\`\n${code}\n\`\`\`\n\nPROBLEM: ${problem}\n\nFULL DEBATE:`
  allRounds.forEach((round, ri) => {
    msg += `\n\nROUND ${ri + 1}:`
    round.forEach((r) => {
      msg += `\n${r.name} (${r.company}): ${r.response}`
    })
  })
  msg += '\n\nSynthesize into AGREEMENT, DISAGREEMENTS, and FINAL RECOMMENDATION.'
  return msg
}

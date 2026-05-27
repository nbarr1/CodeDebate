const STORAGE_KEY = 'macr_api_keys_v1'

export function loadKeys() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { openai: '', gemini: '' }
    return JSON.parse(raw)
  } catch {
    return { openai: '', gemini: '' }
  }
}

export function saveKeys(keys) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(keys))
    return true
  } catch {
    return false
  }
}

export function clearKeys() {
  try {
    localStorage.removeItem(STORAGE_KEY)
    return true
  } catch {
    return false
  }
}

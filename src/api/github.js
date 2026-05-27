const FILE_RE = /^(?:https?:\/\/)?(?:www\.)?github\.com\/([^\/]+)\/([^\/]+)\/blob\/([^\/]+)\/(.+)$/i
const PR_RE = /^(?:https?:\/\/)?(?:www\.)?github\.com\/([^\/]+)\/([^\/]+)\/pull\/(\d+)\/??$/i

export function parseGitHubUrl(url) {
  const cleanUrl = url.trim().split('?')[0].split('#')[0]
  let m
  if ((m = FILE_RE.exec(cleanUrl))) {
    return { type: 'file', owner: m[1], repo: m[2], branch: m[3], path: m[4] }
  }
  if ((m = PR_RE.exec(cleanUrl))) {
    return { type: 'pr', owner: m[1], repo: m[2], number: m[3] }
  }
  throw new Error('Unrecognised GitHub URL — paste a file or pull request URL')
}

async function checkResponse(res) {
  if (res.ok) return
  let msg = `GitHub ${res.status}`
  try {
    const body = await res.json()
    if (body.message) msg += `: ${body.message}`
  } catch {
    if (res.statusText) msg += `: ${res.statusText}`
  }
  throw new Error(msg)
}

export async function fetchGitHubContent(url, token = '') {
  const parsed = parseGitHubUrl(url)
  const headers = {}
  if (token) headers['Authorization'] = `token ${token}`

  if (parsed.type === 'file') {
    const { owner, repo, branch, path } = parsed
    const endpoint = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`
    const res = await fetch(endpoint, {
      headers: { ...headers, Accept: 'application/vnd.github.v3.raw' },
    })
    await checkResponse(res)
    const content = await res.text()
    const filename = path.split('/').pop()
    return { content, filename, type: 'file' }
  }

  // PR diff
  const { owner, repo, number } = parsed
  const endpoint = `https://api.github.com/repos/${owner}/${repo}/pulls/${number}`
  const res = await fetch(endpoint, {
    headers: { ...headers, Accept: 'application/vnd.github.v3.diff' },
  })
  await checkResponse(res)
  const content = await res.text()
  return { content, filename: `PR #${number}.diff`, type: 'diff' }
}

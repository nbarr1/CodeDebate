const FILE_RE = /github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)/
const PR_RE = /github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/

export function parseGitHubUrl(url) {
  let m
  if ((m = FILE_RE.exec(url))) {
    return { type: 'file', owner: m[1], repo: m[2], branch: m[3], path: m[4] }
  }
  if ((m = PR_RE.exec(url))) {
    return { type: 'pr', owner: m[1], repo: m[2], number: m[3] }
  }
  throw new Error('Unrecognised GitHub URL — paste a file or pull request URL')
}

export async function fetchGitHubContent(url, token = '') {
  const parsed = parseGitHubUrl(url)
  const headers = {}
  if (token) headers['Authorization'] = `Bearer ${token}`

  if (parsed.type === 'file') {
    const { owner, repo, branch, path } = parsed
    const endpoint = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`
    const res = await fetch(endpoint, { headers })
    if (!res.ok) throw new Error(`GitHub ${res.status}: ${res.statusText}`)
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
  if (!res.ok) throw new Error(`GitHub ${res.status}: ${res.statusText}`)
  const content = await res.text()
  return { content, filename: `PR #${number}.diff`, type: 'diff' }
}

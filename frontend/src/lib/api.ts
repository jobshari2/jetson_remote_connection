const BASE = '/api'

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export async function apiDelete<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { method: 'DELETE' })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export async function uploadFiles(path: string, files: FileList): Promise<Response> {
  const form = new FormData()
  for (const file of files) {
    form.append('files', file)
  }
  return fetch(`${BASE}${path}`, { method: 'POST', body: form })
}

export async function saveFile(projectId: string, path: string, content: string): Promise<void> {
  const form = new FormData()
  form.append('content', content)
  await fetch(`${BASE}/projects/${projectId}/file?path=${encodeURIComponent(path)}`, {
    method: 'PUT',
    body: form,
  })
}

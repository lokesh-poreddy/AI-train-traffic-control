export async function fetchJSON<T = any>(url: string, init?: RequestInit) {
  const res = await fetch(url, {
    ...init,
    headers: {
      ...(init?.headers || {}),
    },
    cache: "no-store",
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || res.statusText)
  }
  return (await res.json()) as T
}

export const jsonFetcher = async <T = any>(url: string): Promise<T> => {
  return fetchJSON<T>(url)
}

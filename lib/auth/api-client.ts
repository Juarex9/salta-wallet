const API_BASE = ""

async function getToken(): Promise<string | null> {
  if (typeof window === "undefined") return null
  return localStorage.getItem("auth_token")
}

export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getToken()
  
  const headers: HeadersInit = {
    ...options.headers,
  }
  
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`
  }
  
  if (!(options.body instanceof FormData)) {
    (headers as Record<string, string>)["Content-Type"] = "application/json"
  }
  
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  })
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Request failed" }))
    throw new Error(error.error || "Request failed")
  }
  
  return res.json()
}

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    apiFetch<{ user: { id: string; email: string }; token: string }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  
  register: (email: string, password: string) =>
    apiFetch<{ user: { id: string; email: string }; token: string }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
}

// Balance
export const balanceApi = {
  get: () => apiFetch<any>("/api/balance"),
}

// Wallets
export const walletsApi = {
  getAll: () => apiFetch<{ wallets: any[] }>("/api/wallets"),
  add: (data: { type: string; network?: string; address: string; currency?: string }) =>
    apiFetch<{ wallet: any }>("/api/wallets", {
      method: "POST",
      body: JSON.stringify(data),
    }),
}

// Agent
export const agentApi = {
  recommend: (data: { amount: number; currency: string; category?: string; urgency?: string }) =>
    apiFetch<any>("/api/agent/recommend", {
      method: "POST",
      body: JSON.stringify(data),
    }),
}
import { getSession, signOut } from "next-auth/react";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function apiFetch(endpoint, options = {}) {
  // Session
  const session = await getSession();
  if (!session?.backendToken) {
    throw new Error("No backend token found.");
  }

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    Authorization: `Bearer ${session.backendToken}`,
  };

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (res.status === 401) {
    await signOut({ callbackUrl: "/" });
    throw new Error("Session expired.");
  }

  if (!res.ok){
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.message || "API request Failed.")
  }

  return res.json()
}

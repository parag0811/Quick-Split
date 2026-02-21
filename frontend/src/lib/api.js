import { getSession, signOut } from "next-auth/react";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function apiFetch(endpoint, options = {}) {
  try {
    // Session
    const session = await getSession();
    if (!session?.backendToken) {
      const error = new Error("No backend token found.");
      error.statusCode = 401;
      throw error;
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

    if (!res.ok) {
      let errorData = {};
      try {
        errorData = await res.json();
      } catch (parseError) {
        // Response is not JSON, create generic error
        errorData = {
          message: `HTTP ${res.status}: ${res.statusText || "Request failed"}`,
        };
      }

      const error = new Error(errorData.message || "API request failed.");
      error.statusCode = res.status;
      error.validation = errorData.data; // Field errors for UI display
      throw error;
    }

    return res.json();
  } catch (error) {
    // Ensure error has a message property
    if (!error.message) {
      error.message = "An unexpected error occurred";
    }
    throw error;
  }
}

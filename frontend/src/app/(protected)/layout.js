"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { connectSocket } from "@/lib/socket";

export default function ProtectedLayout({ children }) {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.backendToken) {
      connectSocket(session.backendToken);
    }
  }, [session]);

  return children;
}

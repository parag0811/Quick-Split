"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { connectSocket } from "@/lib/socket";
import { useDispatch } from "react-redux";
import { fetchCurrentUser } from "../../../store/authSlice";

export default function ProtectedLayout({ children }) {
  const { data: session } = useSession();
  const dispatch = useDispatch()

  useEffect(() => {
    if (session?.backendToken) {
      connectSocket(session.backendToken);
      dispatch(fetchCurrentUser())
    }
  }, [session, dispatch]);

  return children;
}

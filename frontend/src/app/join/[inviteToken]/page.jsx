'use client';

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { apiFetch } from "@/lib/api";
import { toastSuccess, toastError } from "@/lib/toast";

export default function JoinPage() {
  const { inviteToken } = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push(`/?redirect=/join/${inviteToken}`);
      return;
    }

    const joinGroup = async () => {
      try {
        const response = await apiFetch("/groups/join-group", {
          method: "POST",
          body: JSON.stringify({ inviteToken }),
        });

        toastSuccess(response.message);
        router.push(`/groups/${response.groupId}`);
      } catch (error) {
        toastError(error.message);
        router.push("/dashboard");
      }
    };

    joinGroup();
  }, [status]);

  return <p>Joining group...</p>;
}

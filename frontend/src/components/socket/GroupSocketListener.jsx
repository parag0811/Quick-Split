"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { getSocket } from "@/lib/socket";
import { triggerRefresh } from "@/store/groupSlice";
import { toastSuccess, toastInfo } from "@/lib/toast";

export default function GroupSocketListener({ groupId }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !groupId) return;

    socket.emit("join-group", groupId);

    // Expense Added
    socket.on("expense-added", () => {
      toastSuccess("New expense added");
      dispatch(triggerRefresh());
    });

    // Expense Deleted
    socket.on("expense-deleted", () => {
      toastInfo("Expense removed");
      dispatch(triggerRefresh());
    });

    // Settlement Generated
    socket.on("settlement-generated", () => {
      toastSuccess("Settlement generated");
      dispatch(triggerRefresh());
    });

    // Settlement Paid
    socket.on("settlement-paid", () => {
      toastSuccess("Settlement marked as paid");
      dispatch(triggerRefresh());
    });

    // Member Joined
    socket.on("member-joined", (data) => {
      toastInfo(`${data.member?.name || "A member"} joined the group`);
      dispatch(triggerRefresh());
    });

    // Member Removed
    socket.on("member-removed", () => {
      toastInfo("A member was removed");
      dispatch(triggerRefresh());
    });

    return () => {
      socket.emit("leave-group", groupId);

      socket.off("expense-added");
      socket.off("expense-deleted");
      socket.off("settlement-generated");
      socket.off("settlement-paid");
      socket.off("member-joined");
      socket.off("member-removed");
    };
  }, [dispatch, groupId]);

  return null;
}

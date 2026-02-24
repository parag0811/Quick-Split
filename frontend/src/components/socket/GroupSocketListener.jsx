"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { getSocket } from "@/lib/socket";
import { triggerRefresh } from "../../../store/groupSlice";
import { toastSuccess, toastInfo } from "@/lib/toast";

export default function GroupSocketListener({ groupId }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !groupId) return;

    try {
      socket.emit("join-group", groupId);
    } catch (error) {
      console.error("Failed to join group socket:", error);
      return;
    }

    // Expense Added
    socket.on("expense-added", (data) => {
      try {
        toastSuccess("New expense added");
        dispatch(triggerRefresh());
      } catch (error) {
        console.error("Error handling expense-added event:", error);
      }
    });

    // Expense Deleted
    socket.on("expense-deleted", (data) => {
      try {
        toastInfo("Expense removed");
        dispatch(triggerRefresh());
      } catch (error) {
        console.error("Error handling expense-deleted event:", error);
      }
    });

    // Settlement Generated
    socket.on("settlement-generated", (data) => {
      try {
        toastSuccess("Settlement generated");
        dispatch(triggerRefresh());
      } catch (error) {
        console.error("Error handling settlement-generated event:", error);
      }
    });

    // Settlement Paid
    socket.on("settlement-paid", (data) => {
      try {
        toastSuccess("Settlement marked as paid");
        dispatch(triggerRefresh());
      } catch (error) {
        console.error("Error handling settlement-paid event:", error);
      }
    });

    // Member Joined
    socket.on("member-joined", (data) => {
      try {
        const memberName = data?.member?.name || "A member";
        toastInfo(`${memberName} joined the group`);
        dispatch(triggerRefresh());
      } catch (error) {
        console.error("Error handling member-joined event:", error);
      }
    });

    // Member Removed
    socket.on("member-removed", (data) => {
      try {
        toastInfo("A member was removed");
        dispatch(triggerRefresh());
      } catch (error) {
        console.error("Error handling member-removed event:", error);
      }
    });

    return () => {
      try {
        socket.emit("leave-group", groupId);
      } catch (error) {
        console.error("Failed to leave group socket:", error);
      }

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

"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { addExpense, removeExpense } from "@/store/groupSlice";
import { getSocket } from "@/lib/socket";

export default function GroupSocketListener({ groupId }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.emit("join-group", groupId);

    socket.on("expense-added", (data) => {
      dispatch(addExpense(data.expense));
    });

    socket.on("expense-deleted", (data) => {
      dispatch(removeExpense(data.expenseId));
    });

    return () => {
      socket.emit("leave-group", groupId);
      socket.off("expense-added");
      socket.off("expense-deleted");
    };
  }, [dispatch, groupId]);

  return null;
}

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CircleDollarSign,
  RefreshCw,
  AlertCircle,
  RotateCcw,
  Sparkles,
  Wallet,
  X,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { apiFetch } from "@/lib/api";
import { toastError, toastSuccess } from "@/lib/toast";
import GroupSocketListener from "@/components/socket/GroupSocketListener";
import { triggerRefresh } from "../../../../../../../store/groupSlice";

const PAYMENT_METHODS = [
  { label: "UPI", value: "upi" },
  { label: "Cash", value: "cash" },
  { label: "Bank Transfer", value: "bank" },
  { label: "Other", value: "other" },
];

const getRiskStyles = (riskLevel) => {
  switch ((riskLevel || "").toLowerCase()) {
    case "high":
      return "border-red-400/35 bg-red-500/10 text-red-200";
    case "medium":
      return "border-amber-400/35 bg-amber-500/10 text-amber-100";
    case "low":
      return "border-emerald-400/35 bg-emerald-500/10 text-emerald-100";
    default:
      return "border-slate-500/35 bg-slate-500/10 text-slate-200";
  }
};

export default function GroupBalancePage() {
  const { groupId } = useParams();
  const router = useRouter();
  const dispatch = useDispatch();

  const refreshKey = useSelector((state) => state.group.refreshKey);
  const currentUserId = useSelector((state) => state.auth.user?._id);

  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [balanceData, setBalanceData] = useState({
    members: [],
    balance: {},
    suggestions: [],
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({
    method: "upi",
    notes: "",
  });

  const fetchBalanceData = useCallback(async () => {
    try {
      setLoading(true);
      setFetchError("");
      const response = await apiFetch(`/group/${groupId}/balances`);
      setBalanceData({
        members: response?.members || [],
        balance: response?.balance || {},
        suggestions: response?.suggestions || [],
      });
    } catch (error) {
      setFetchError(error?.message || "Failed to load balances.");
      setBalanceData({ members: [], balance: {}, suggestions: [] });
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    if (groupId) fetchBalanceData();
  }, [groupId, fetchBalanceData, refreshKey]);

  const memberStanding = useMemo(() => {
    const members = Array.isArray(balanceData.members)
      ? balanceData.members
      : [];
    const balanceMap = balanceData.balance || {};

    return members
      .map((member) => {
        const value = Number(balanceMap[member._id] || 0);
        const type = value > 0 ? "gets" : value < 0 ? "owes" : "settled";
        return {
          ...member,
          net: value,
          type,
        };
      })
      .sort((a, b) => Math.abs(b.net) - Math.abs(a.net));
  }, [balanceData]);

  const summary = useMemo(() => {
    const standings = memberStanding;
    const creditors = standings.filter((m) => m.net > 0).length;
    const debtors = standings.filter((m) => m.net < 0).length;
    const unsettledTotal = standings
      .filter((m) => m.net < 0)
      .reduce((acc, m) => acc + Math.abs(m.net), 0);

    return {
      creditors,
      debtors,
      unsettledTotal,
      suggestionCount: balanceData.suggestions?.length || 0,
    };
  }, [memberStanding, balanceData.suggestions]);

  const openSettleModal = (suggestion) => {
    setSelectedSuggestion(suggestion);
    setForm({ method: "upi", notes: "" });
    setFormError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSuggestion(null);
    setFormError("");
    setForm({ method: "upi", notes: "" });
  };

  const handleRecordPayment = async () => {
    if (!selectedSuggestion?.from?._id || !selectedSuggestion?.to?._id) {
      setFormError("Missing payer or receiver in this suggestion.");
      return;
    }

    const amount = Number(selectedSuggestion.amount || 0);
    if (amount <= 0) {
      setFormError("Amount must be greater than zero.");
      return;
    }

    try {
      setSubmitting(true);
      setFormError("");

      const payload = {
        from: selectedSuggestion.from._id,
        to: selectedSuggestion.to._id,
        amount,
        method: form.method,
        notes: form.notes.trim() || undefined,
      };

      await apiFetch(`/group/${groupId}/settlements`, {
        method: "POST",
        body: payload,
      });

      toastSuccess("Payment recorded successfully.");
      closeModal();
      await fetchBalanceData();
      dispatch(triggerRefresh());
    } catch (error) {
      setFormError(error?.message || "Failed to record settlement.");
      toastError(error?.message || "Failed to record settlement.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderAvatar = (member) => {
    if (member?.image) {
      return (
        <img
          src={member.image}
          alt={member.name}
          className="h-10 w-10 rounded-xl border border-[#244a80] object-cover sm:h-12 sm:w-12"
        />
      );
    }

    const initials = (member?.name || "??")
      .split(" ")
      .map((part) => part?.[0] || "")
      .join("")
      .slice(0, 2)
      .toUpperCase();

    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#244a80] bg-[#0b2a5f] text-xs font-bold text-[#c9dcff] sm:h-12 sm:w-12 sm:text-sm">
        {initials}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[radial-gradient(circle_at_18%_0%,#0e2f75_0%,#081d4f_45%,#030b1d_100%)] p-4 sm:p-6 lg:p-8">
        <div className="mx-auto w-full max-w-6xl animate-pulse space-y-6">
          <div className="h-12 w-44 rounded-lg bg-[#10274f]" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-24 rounded-xl border border-[#173b70] bg-[#081b45]"
              />
            ))}
          </div>
          <div className="h-56 rounded-2xl border border-[#173b70] bg-[#081b45]" />
          <div className="h-64 rounded-2xl border border-[#173b70] bg-[#081b45]" />
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="w-full min-h-screen bg-[radial-gradient(circle_at_18%_0%,#0e2f75_0%,#081d4f_45%,#030b1d_100%)] p-4 sm:p-6 lg:p-8">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-center py-28 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-red-400/30 bg-red-500/12">
            <AlertCircle className="h-9 w-9 text-red-400" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-[#dce8ff]">
            Could not load balances
          </h2>
          <p className="mb-8 max-w-md text-sm text-[#93acd5]">{fetchError}</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={fetchBalanceData}
              className="inline-flex items-center gap-2 rounded-lg bg-linear-to-r from-cyan-500 to-blue-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:from-cyan-600 hover:to-blue-600"
            >
              <RotateCcw className="h-4 w-4" />
              Retry
            </button>
            <button
              onClick={() => router.push(`/dashboard/groups/${groupId}`)}
              className="rounded-lg border border-[#2a4778] bg-[#091a42] px-6 py-2.5 text-sm font-semibold text-[#c6d7f6] transition hover:border-[#3f629e] hover:text-white"
            >
              Back to Group
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <GroupSocketListener groupId={groupId} />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35 }}
        className="w-full min-h-screen bg-[radial-gradient(circle_at_18%_0%,#0e2f75_0%,#081d4f_45%,#030b1d_100%)] p-4 sm:p-6 lg:p-8"
      >
        <div className="mx-auto w-full max-w-6xl space-y-6">
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => router.push(`/dashboard/groups/${groupId}`)}
            className="inline-flex cursor-pointer items-center gap-1.5 text-sm text-[#9ab1d8] transition hover:text-white"
          >
            <ArrowLeft size={16} />
            Back to Group
          </motion.button>

          <section className="rounded-2xl border border-[#1a3c72] bg-[#07183f]/85 p-4 sm:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#79a0d8]">
                  Group Net Balance
                </p>
                <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#dce8ff] sm:text-4xl">
                  Settle Suggestions
                </h1>
                <p className="mt-2 max-w-xl text-sm text-[#8fa6cf]">
                  Smart suggestions of who should pay whom to settle up quickly.
                </p>
              </div>

              <button
                onClick={fetchBalanceData}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#2a5b96] bg-[#0b2558] px-4 py-2.5 text-sm font-semibold text-[#9edfff] transition hover:border-[#3b75bc] hover:bg-[#10306d] md:w-auto"
              >
                <RefreshCw size={16} />
                Refresh
              </button>
            </div>
          </section>

          <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-[#173b70] bg-[#081c46] p-4">
              <p className="text-[10px] uppercase tracking-[0.16em] text-[#7f99c7]">
                Creditors
              </p>
              <p className="mt-1 text-2xl font-bold text-[#7fe9ff]">
                {summary.creditors}
              </p>
            </div>
            <div className="rounded-xl border border-[#173b70] bg-[#081c46] p-4">
              <p className="text-[10px] uppercase tracking-[0.16em] text-[#7f99c7]">
                Debtors
              </p>
              <p className="mt-1 text-2xl font-bold text-[#ff9ab1]">
                {summary.debtors}
              </p>
            </div>
            <div className="rounded-xl border border-[#173b70] bg-[#081c46] p-4">
              <p className="text-[10px] uppercase tracking-[0.16em] text-[#7f99c7]">
                Transfers
              </p>
              <p className="mt-1 text-2xl font-bold text-[#dce8ff]">
                {summary.suggestionCount}
              </p>
            </div>
            <div className="rounded-xl border border-[#173b70] bg-[#081c46] p-4">
              <p className="text-[10px] uppercase tracking-[0.16em] text-[#7f99c7]">
                Unsettled
              </p>
              <p className="mt-1 text-2xl font-bold text-[#dce8ff]">
                ₹{summary.unsettledTotal.toFixed(2)}
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-[#1a3c72] bg-[#06173d]/88 p-4 sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#8fa7d2]">
                Member Standings
              </h2>
              <span className="rounded-full border border-[#255089] bg-[#0b2558] px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[#9fd6ff]">
                {memberStanding.length} Members
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {memberStanding.map((member) => {
                const isYou = currentUserId && member._id === currentUserId;
                const isPositive = member.net > 0;
                const isNegative = member.net < 0;

                return (
                  <div
                    key={member._id}
                    className="rounded-xl border border-[#1b457d] bg-[#081a43] p-4"
                  >
                    <div className="flex items-center gap-3">
                      {renderAvatar(member)}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-[#dce8ff]">
                          {member.name}
                        </p>
                        <p className="truncate text-xs text-[#8ba4ce]">
                          {member.email}
                        </p>
                      </div>
                      {isYou && (
                        <span className="rounded-md border border-[#00CDFF]/30 bg-[#00CDFF]/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#8be9ff]">
                          You
                        </span>
                      )}
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7f98c4]">
                        Net balance
                      </span>
                      <span
                        className={`text-lg font-bold ${
                          isPositive
                            ? "text-[#7fe9ff]"
                            : isNegative
                              ? "text-[#ff9ab1]"
                              : "text-[#97aed6]"
                        }`}
                      >
                        {isPositive ? "+" : ""}₹
                        {Math.abs(member.net).toFixed(2)}
                      </span>
                    </div>

                    <p
                      className={`mt-1 text-xs font-medium ${
                        isPositive
                          ? "text-[#7fe9ff]"
                          : isNegative
                            ? "text-[#ff9ab1]"
                            : "text-[#8ba4ce]"
                      }`}
                    >
                      {isPositive
                        ? "Will receive"
                        : isNegative
                          ? "Needs to pay"
                          : "Settled"}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-[#1a3c72] bg-[#06173d]/88 p-4 sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#8fa7d2]">
                Suggested Settlements
              </h2>
              <span className="rounded-full border border-[#6f4cc0]/35 bg-[#8f5bff]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[#d4c2ff]">
                {summary.suggestionCount} Transfers
              </span>
            </div>

            {balanceData.suggestions.length === 0 ? (
              <div className="rounded-xl border border-[#1b457d] bg-[#081a43] px-4 py-14 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#2e5d97] bg-[#0a2353]">
                  <CheckCircle2 className="h-7 w-7 text-[#7fe9ff]" />
                </div>
                <h3 className="text-lg font-semibold text-[#dce8ff]">
                  Everything is settled
                </h3>
                <p className="mt-1 text-sm text-[#8fa6cf]">
                  No transfers are required right now.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {balanceData.suggestions.map((suggestion, index) => (
                  <motion.div
                    key={`${suggestion?.from?._id}-${suggestion?.to?._id}-${index}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, delay: index * 0.04 }}
                    className="rounded-xl border border-[#1b457d] bg-[#081a43] p-3 sm:p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        {renderAvatar(suggestion.from)}
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#dce8ff]">
                            {suggestion?.from?.name || "Unknown"}
                          </p>
                          <p className="text-xs text-[#8ca4ce]">pays</p>
                        </div>

                        <div className="mx-1 hidden h-8 w-8 items-center justify-center rounded-lg border border-[#2d5a95] bg-[#0a2659] text-[#7fe9ff] sm:flex">
                          <ArrowRight size={16} />
                        </div>

                        {renderAvatar(suggestion.to)}
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#dce8ff]">
                            {suggestion?.to?.name || "Unknown"}
                          </p>
                          <p className="text-xs text-[#8ca4ce]">receives</p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 sm:items-end">
                        <div className="inline-flex items-center gap-2 rounded-lg border border-[#26538c] bg-[#0a2559] px-3 py-1.5 text-sm font-bold text-[#dce8ff]">
                          <CircleDollarSign
                            size={16}
                            className="text-[#7fe9ff]"
                          />
                          ₹{Number(suggestion.amount || 0).toFixed(2)}
                        </div>
                        {suggestion?.risk && (
                          <div
                            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] ${getRiskStyles(
                              suggestion.risk.risk_level,
                            )}`}
                          >
                            <span>
                              Risk: {suggestion.risk.risk_level || "Low"}
                            </span>
                            <span className="text-[10px] normal-case tracking-normal opacity-80">
                              {Math.round(
                                Number(suggestion.risk.delay_probability || 0) *
                                  100,
                              )}% delay probability
                            </span>
                          </div>
                        )}
                        <button
                          onClick={() => openSettleModal(suggestion)}
                          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#00CDFF] px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] text-[#03203f] transition hover:bg-[#35dcff]"
                        >
                          <Sparkles size={14} />
                          Record Payment
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </section>
        </div>
      </motion.div>

      <AnimatePresence>
        {isModalOpen && selectedSuggestion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
            onClick={closeModal}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.96 }}
              transition={{ type: "spring", damping: 24, stiffness: 280 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-2xl border border-[#1c467e] bg-[#051536] p-5 sm:p-6"
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-bold text-[#dce8ff]">
                    Settle Up
                  </h3>
                  <p className="mt-1 text-sm text-[#8fa6cf]">
                    Confirm payment record for reconciliation.
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="rounded-lg border border-[#2a4f83] bg-[#0a2150] p-2 text-[#95add7] transition hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="mb-4 rounded-xl border border-[#1e477f] bg-[#071a43] p-3 sm:p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 sm:gap-3">
                    {renderAvatar(selectedSuggestion.from)}
                    <div>
                      <p className="text-[11px] uppercase tracking-widest text-[#7f99c7]">
                        From
                      </p>
                      <p className="max-w-30 truncate text-sm font-semibold text-[#dce8ff] sm:max-w-44">
                        {selectedSuggestion.from.name}
                      </p>
                    </div>
                  </div>

                  <ArrowRight className="h-5 w-5 text-[#7fe9ff]" />

                  <div className="flex items-center gap-2 sm:gap-3">
                    <div>
                      <p className="text-right text-[11px] uppercase tracking-widest text-[#7f99c7]">
                        To
                      </p>
                      <p className="max-w-30 truncate text-right text-sm font-semibold text-[#dce8ff] sm:max-w-44">
                        {selectedSuggestion.to.name}
                      </p>
                    </div>
                    {renderAvatar(selectedSuggestion.to)}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-[#7f99c7]">
                    Amount
                  </label>
                  <div className="flex items-center gap-2 rounded-lg border border-[#254e82] bg-[#0b2659] px-3 py-2.5 text-[#dce8ff]">
                    <Wallet size={16} className="text-[#7fe9ff]" />
                    <span className="text-xl font-bold">
                      ₹{Number(selectedSuggestion.amount || 0).toFixed(2)}
                    </span>
                  </div>
                </div>

                {selectedSuggestion?.risk && (
                  <div
                    className={`rounded-lg border px-3 py-2 text-sm font-medium ${getRiskStyles(
                      selectedSuggestion.risk.risk_level,
                    )}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span>
                        Settlement Risk: {selectedSuggestion.risk.risk_level || "Low"}
                      </span>
                      <span className="text-xs normal-case tracking-normal opacity-80">
                        {Math.round(
                          Number(selectedSuggestion.risk.delay_probability || 0) *
                            100,
                        )}% probability
                      </span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-[#7f99c7]">
                    Payment Method
                  </label>
                  <select
                    value={form.method}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, method: e.target.value }))
                    }
                    className="w-full rounded-lg border border-[#254e82] bg-[#0b2659] px-3 py-2.5 text-sm text-[#dce8ff] outline-none transition focus:border-[#2e66ab]"
                  >
                    {PAYMENT_METHODS.map((method) => (
                      <option key={method.value} value={method.value}>
                        {method.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-[#7f99c7]">
                    Notes
                  </label>
                  <textarea
                    value={form.notes}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, notes: e.target.value }))
                    }
                    rows={3}
                    maxLength={280}
                    placeholder="Optional note about this transfer"
                    className="w-full resize-none rounded-lg border border-[#254e82] bg-[#0b2659] px-3 py-2.5 text-sm text-[#dce8ff] placeholder:text-[#7f99c7] outline-none transition focus:border-[#2e66ab]"
                  />
                </div>

                {formError && (
                  <div className="rounded-lg border border-red-400/35 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                    {formError}
                  </div>
                )}

                <button
                  onClick={handleRecordPayment}
                  disabled={submitting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#00CDFF] px-4 py-3 text-sm font-bold uppercase tracking-[0.08em] text-[#03203f] transition hover:bg-[#35dcff] disabled:cursor-not-allowed disabled:bg-[#1f6d80] disabled:text-[#8ab6c1]"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Recording...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      Record Payment
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

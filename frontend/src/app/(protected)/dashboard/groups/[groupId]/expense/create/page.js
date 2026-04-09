"use client";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  DollarSign,
  FileText,
  Tag,
  Plus,
  Check,
  Users,
  AlertCircle,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { toastInfo } from "@/lib/toast";
import GroupSocketListener from "@/components/socket/GroupSocketListener";
import { useSelector } from "react-redux";

function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <p className="mt-1.5 flex items-center gap-1 text-xs text-[#ff9bb7]">
      <AlertCircle size={11} className="shrink-0" />
      {msg}
    </p>
  );
}

function renderMemberAvatar(member, isSelected) {
  if (member.image) {
    return (
      <img
        src={member.image}
        alt={member.name}
        className="h-11 w-11 shrink-0 rounded-full border border-[#17345f] object-cover"
      />
    );
  }

  return (
    <div
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#17345f] text-sm font-bold text-white ${
        isSelected
          ? "bg-linear-to-br from-[#00CDFF] to-[#1d7eff]"
          : "bg-linear-to-br from-[#314a7a] to-[#1d355f]"
      }`}
    >
      {member.name?.charAt(0)?.toUpperCase() || "?"}
    </div>
  );
}

export default function CreateExpenseForm() {
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [splits, setSplits] = useState({});
  const [contextDescription, setContextDescription] = useState("");
  const [aiReason, setAiReason] = useState("");
  const [aiError, setAiError] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const { groupId } = useParams();
  const router = useRouter();
  const refreshKey = useSelector((state) => state.group.refreshKey);

  const fetchMembers = async () => {
    try {
      setMembersLoading(true);
      const res = await apiFetch(`/groups/${groupId}/summary`);
      setMembers(res.members ?? []);
    } catch (error) {
      setSubmitError(error?.message || "Failed to load group members.");
    } finally {
      setMembersLoading(false);
    }
  };

  useEffect(() => {
    if (groupId) fetchMembers();
  }, [groupId, refreshKey]);

  const [formData, setFormData] = useState({
    title: "",
    totalAmount: "",
    paidBy: "",
    category: "",
    notes: "",
    splitType: "equal",
    participants: [],
  });

  const categories = ["food", "travel", "rent", "shopping", "other"];

  const clearFieldError = (name) => {
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    clearFieldError(name);
    setSubmitError("");
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const syncParticipantSplits = (participants) => {
    const nextSplits = participants.reduce((acc, participant) => {
      if (participant.value !== "" && participant.value !== null && !Number.isNaN(participant.value)) {
        acc[participant.userId] = Number(participant.value);
      }
      return acc;
    }, {});

    setSplits(nextSplits);
  };

  const updateParticipants = (nextParticipants) => {
    setFormData((prev) => ({
      ...prev,
      participants: nextParticipants,
    }));
    syncParticipantSplits(nextParticipants);
  };

  const handleSplitTypeChange = (type) => {
    const nextParticipants = formData.participants.map(({ userId }) => ({ userId, value: "" }));
    setAiError("");
    setAiReason("");
    setFormData((prev) => ({
      ...prev,
      splitType: type,
      participants: nextParticipants,
    }));
    setSplits({});
  };

  const toggleParticipant = (userId) => {
    const exists = formData.participants.some((participant) => participant.userId === userId);
    const nextParticipants = exists
      ? formData.participants.filter((participant) => participant.userId !== userId)
      : [...formData.participants, { userId, value: "" }];

    setAiError("");
    updateParticipants(nextParticipants);
  };

  const handleParticipantValue = (userId, value) => {
    clearFieldError("split");
    const nextParticipants = formData.participants.map((participant) =>
      participant.userId === userId ? { ...participant, value: value === "" ? "" : Number(value) } : participant,
    );

    updateParticipants(nextParticipants);
  };

  const selectAllParticipants = () => {
    const nextParticipants = members.map((member) => ({ userId: member._id, value: "" }));
    updateParticipants(nextParticipants);
  };

  const clearAllParticipants = () => {
    updateParticipants([]);
  };

  const handleContextDescriptionChange = (e) => {
    setContextDescription(e.target.value);
    setAiError("");
  };

  const handleSuggestSplit = async () => {
    setAiError("");
    setAiReason("");

    const amount = Number(formData.totalAmount);
    if (!amount || amount <= 0) {
      setAiError("Enter a valid amount before asking for a suggestion.");
      return;
    }

    if (formData.participants.length < 2) {
      setAiError("Select at least 2 participants to generate a split.");
      return;
    }

    const payload = {
      amount,
      participants: formData.participants
        .map((participant) => {
          const member = members.find((item) => item._id === participant.userId);
          if (!member) return null;

          return {
            userId: member._id,
            name: member.name,
          };
        })
        .filter(Boolean),
      context: {
        description: contextDescription.trim(),
      },
    };

    if (payload.participants.length < 2) {
      setAiError("Could not resolve the selected participants. Please try again.");
      return;
    }

    try {
      setAiLoading(true);
      const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
      const res = await fetch(`${apiBaseUrl}/ai/suggest-split`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      let data = {};
      try {
        data = await res.json();
      } catch (parseError) {
        data = {};
      }

      if (!res.ok || !data?.success || !Array.isArray(data?.data?.suggestions)) {
        throw new Error(data?.message || "AI suggestion failed. Please try again.");
      }

      const suggestionMap = data.data.suggestions.reduce((acc, suggestion) => {
        acc[suggestion.userId] = Number(suggestion.percentage);
        return acc;
      }, {});

      const nextParticipants = formData.participants.map((participant) => ({
        ...participant,
        value: suggestionMap[participant.userId] ?? participant.value,
      }));

      updateParticipants(nextParticipants);
      setAiReason(data.data.reason || "AI generated split suggestion.");
    } catch (error) {
      setAiError(error.message || "AI suggestion failed. Your current values were kept.");
    } finally {
      setAiLoading(false);
    }
  };

  const participantSum = formData.participants.reduce(
    (acc, p) => acc + (parseFloat(p.value) || 0), 0,
  );
  const totalAmount = parseFloat(formData.totalAmount) || 0;

  const isSumValid =
    formData.splitType === "equal" ||
    (formData.splitType === "manual" && Math.abs(participantSum - totalAmount) < 0.01) ||
    (formData.splitType === "percentage" && Math.abs(participantSum - 100) < 0.01);

  const inputClass = (name) => {
    const hasError = Boolean(fieldErrors[name]);
    return [
      "w-full rounded-xl border px-4 py-3 text-sm text-[#dbe7ff] outline-none transition placeholder:text-[#5f79a9] focus:ring-2",
      hasError
        ? "border-[#FF2D65]/55 bg-[#08153a] focus:border-[#FF2D65] focus:ring-[#FF2D65]/10"
        : "border-[#1b3c6c] bg-[#071a42] focus:border-[#00CDFF]/60 focus:ring-[#00CDFF]/15",
    ].join(" ");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    setSubmitError("");

    if (!isSumValid) {
      setFieldErrors({
        split:
          formData.splitType === "manual"
            ? `Amounts must add up to ₹${totalAmount.toFixed(2)}`
            : "Percentages must add up to 100%",
      });
      return;
    }

    if (formData.splitType !== "equal") {
      const invalid = formData.participants.some(
        (p) => p.value === "" || Number.isNaN(p.value),
      );
      if (invalid) {
        setFieldErrors({ split: "Enter amount for every selected participant" });
        return;
      }
    }

    let participantsPayload = formData.participants;
    if (formData.splitType === "equal" && formData.participants.length > 0) {
      const equalShare = parseFloat((totalAmount / formData.participants.length).toFixed(2));
      participantsPayload = formData.participants.map((p) => ({ ...p, value: equalShare }));
    }

    const payload = { ...formData, participants: participantsPayload };

    try {
      setSubmitting(true);
      const data = await apiFetch(`/group/${groupId}/expense/add`, {
        method: "POST",
        body: payload,
      });
      if (data.expense.isAnomalous) {
        const score = data.expense.anomalyScore?.toFixed(2) ?? "N/A";
        const reason = data.expense.anomalyReason || "Flagged by spending pattern analysis.";
        toastInfo(`Anomaly Score: ${score} — ${reason}`);
      }
      router.push(`/dashboard/groups/${groupId}/expense`);
    } catch (error) {
      if (error.validation && Array.isArray(error.validation)) {
        const mapped = {};
        error.validation.forEach((ve) => {
          const key = ve.path?.startsWith("participants") ? "split" : ve.path;
          if (!mapped[key]) mapped[key] = ve.msg;
        });
        setFieldErrors(mapped);
        return;
      }

      if (error.statusCode === 403) {
        setSubmitError("You are not authorized to add expenses in this group.");
        return;
      }
      if (error.statusCode === 404) {
        setSubmitError("Group not found. It may have been deleted.");
        return;
      }
      if (!navigator.onLine) {
        setSubmitError("You're offline. Check your connection and try again.");
        return;
      }
      if (error.statusCode === 503 || error.statusCode === 429) {
        setSubmitError("Service temporarily unavailable. Please try again in a moment.");
        return;
      }

      setSubmitError(error.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <GroupSocketListener groupId={groupId} />
      <div className="mx-auto w-full max-w-345 space-y-5">
        <section className="rounded-2xl border border-[#17345f] bg-[#06173f]/80 p-4 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#6f88b7]">
                Expense Ledger
              </p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#d8e6ff] sm:text-4xl">
                Add Expense
              </h1>
              <p className="mt-2 text-sm text-[#8fa6d2]">
                Split a new expense across your group members.
              </p>
            </div>

            <button
              type="button"
              onClick={() => router.push(`/dashboard/groups/${groupId}/expense`)}
              className="inline-flex items-center gap-2 rounded-lg border border-[#21477a] bg-[#081a43] px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#c8d7f0] transition hover:border-[#00CDFF]/40 hover:text-[#00CDFF]"
            >
              <ArrowLeft size={14} />
              Back to Expenses
            </button>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-[#163465] bg-[#06173f]/85">
          <div className="border-b border-[#14315e] p-4 sm:p-6">
            {submitError && (
              <div className="flex items-start gap-3 rounded-xl border border-[#FF2D65]/35 bg-[#FF2D65]/10 px-4 py-3">
                <AlertCircle size={16} className="mt-0.5 shrink-0 text-[#ff9bb7]" />
                <p className="text-sm text-[#ffc2d4]">{submitError}</p>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-6 p-4 sm:p-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#6f88b7]">
                    <span className="inline-flex items-center gap-2 normal-case tracking-normal text-sm font-medium text-[#dbe7ff]">
                      <FileText size={16} />
                      Title
                    </span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="What was this expense for?"
                    className={inputClass("title")}
                    required
                  />
                  <FieldError msg={fieldErrors.title} />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#6f88b7]">
                    <span className="inline-flex items-center gap-2 normal-case tracking-normal text-sm font-medium text-[#dbe7ff]">
                      <DollarSign size={16} />
                      Total Amount
                    </span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7f97c3]">
                      ₹
                    </span>
                    <input
                      type="number"
                      name="totalAmount"
                      value={formData.totalAmount}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className={`${inputClass("totalAmount")} pl-8`}
                      required
                    />
                  </div>
                  <FieldError msg={fieldErrors.totalAmount} />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#6f88b7]">
                    <span className="inline-flex items-center gap-2 normal-case tracking-normal text-sm font-medium text-[#dbe7ff]">
                      <Tag size={16} />
                      Category
                    </span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={`${inputClass("category")} cursor-pointer appearance-none`}
                    required
                  >
                    <option value="" className="bg-[#071a42]">
                      Select category
                    </option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat} className="bg-[#071a42]">
                        {cat}
                      </option>
                    ))}
                  </select>
                  <FieldError msg={fieldErrors.category} />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#6f88b7]">
                    <span className="inline-flex items-center gap-2 normal-case tracking-normal text-sm font-medium text-[#dbe7ff]">
                      <Users size={16} />
                      Paid By
                    </span>
                  </label>
                  <select
                    name="paidBy"
                    value={formData.paidBy}
                    onChange={handleInputChange}
                    className={`${inputClass("paidBy")} cursor-pointer appearance-none`}
                    required
                  >
                    <option value="" className="bg-[#071a42]">
                      Select member
                    </option>
                    {members.map((member) => (
                      <option key={member._id} value={member._id} className="bg-[#071a42]">
                        {member.name}
                      </option>
                    ))}
                  </select>
                  <FieldError msg={fieldErrors.paidBy} />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#6f88b7]">
                  <span className="inline-flex items-center gap-2 normal-case tracking-normal text-sm font-medium text-[#dbe7ff]">
                    <FileText size={16} />
                    Notes
                  </span>
                </label>
                <input
                  type="text"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Add a description (optional)"
                  className={inputClass("notes")}
                />
                <FieldError msg={fieldErrors.notes} />
              </div>

              <div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <label className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6f88b7]">
                    Split Type
                  </label>
                  <div className="inline-flex rounded-xl border border-[#1b3c6c] bg-[#071a42] p-1">
                    {[
                      { value: "equal", label: "Equal" },
                      { value: "manual", label: "Manual" },
                      { value: "percentage", label: "Percentage" },
                    ].map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => handleSplitTypeChange(type.value)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] transition ${
                          formData.splitType === type.value
                            ? "bg-[#00CDFF] text-[#03203f]"
                            : "text-[#8ea5d1] hover:text-[#dbe7ff]"
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>
                <FieldError msg={fieldErrors.splitType} />
              </div>

              {formData.splitType === "percentage" && (
                <div className="rounded-xl border border-[#17345f] bg-[#071a42] p-4">
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#6f88b7]">
                      <span className="inline-flex items-center gap-2 normal-case tracking-normal text-sm font-medium text-[#dbe7ff]">
                        <FileText size={16} />
                        Split Context
                      </span>
                    </label>
                    <textarea
                      value={contextDescription}
                      onChange={handleContextDescriptionChange}
                      placeholder="Optional context for the AI suggestion"
                      rows={3}
                      className={`${inputClass("contextDescription")} resize-none`}
                    />
                    <p className="mt-2 text-xs text-[#8ea5d1]">
                      Examples: "Rahul had more drinks", "Sneha used the cab alone", "I joined only for dessert".
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleSuggestSplit}
                      disabled={aiLoading || membersLoading || formData.participants.length < 2 || !formData.totalAmount}
                      className="inline-flex items-center gap-2 rounded-lg border border-[#00CDFF]/35 bg-[#00CDFF]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#8ff0ff] transition hover:border-[#00CDFF]/60 hover:bg-[#00CDFF]/15 disabled:cursor-not-allowed disabled:border-[#21477a] disabled:text-[#6f88b7]"
                    >
                      {aiLoading ? (
                        <span className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                      ) : (
                        "✨"
                      )}
                      {aiLoading ? "Suggesting..." : "Suggest Split"}
                    </button>

                    <p className="text-xs text-[#8ea5d1]">
                      AI will prefill percentage values for the selected people.
                    </p>
                  </div>

                  <p
                    className={`mt-2 text-xs ${
                      formData.participants.length < 2 ? "text-[#ff9bb7]" : "text-[#8ea5d1]"
                    }`}
                  >
                    Select at least 2 people to add the expense split and enable AI suggestions.
                  </p>

                  {aiError ? (
                    <p className="mt-3 text-sm text-[#ff9bb7]">{aiError}</p>
                  ) : aiReason ? (
                    <p className="mt-3 text-sm text-[#8ff0ff]">Reason: {aiReason}</p>
                  ) : null}
                </div>
              )}

              <div>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <label className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6f88b7]">
                    Split Between
                  </label>
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={selectAllParticipants}
                      className="font-semibold uppercase tracking-[0.08em] text-[#00CDFF] transition hover:text-[#35dcff]"
                    >
                      Select All
                    </button>
                    <span className="text-[#51698f]">•</span>
                    <button
                      type="button"
                      onClick={clearAllParticipants}
                      className="font-semibold uppercase tracking-[0.08em] text-[#8ea5d1] transition hover:text-[#dbe7ff]"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                {formData.splitType === "equal" &&
                  formData.participants.length > 0 &&
                  totalAmount > 0 && (
                    <div className="mb-3 rounded-xl border border-[#1b3c6c] bg-[#071a42] px-3 py-2">
                      <p className="text-xs text-[#8ff0ff]">
                        Each person pays{" "}
                        <span className="font-semibold">
                          ₹
                          {(totalAmount / formData.participants.length).toFixed(2)}
                        </span>{" "}
                        ({formData.participants.length} selected)
                      </p>
                    </div>
                  )}

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {membersLoading
                    ? Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-20 animate-pulse rounded-xl border border-[#17345f] bg-[#071a42]" />
                      ))
                    : members.map((member) => {
                        const participant = formData.participants.find((p) => p.userId === member._id);
                        const isSelected = Boolean(participant);

                        return (
                          <div key={member._id} className="flex flex-col gap-1.5">
                            <button
                              type="button"
                              onClick={() => toggleParticipant(member._id)}
                              className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                                isSelected
                                  ? "border-[#00CDFF]/45 bg-[#081f4d]"
                                  : "border-[#17345f] bg-[#071a42] hover:border-[#21477a]"
                              }`}
                            >
                              {renderMemberAvatar(member, isSelected)}
                              <div className="min-w-0 flex-1">
                                <div className={`truncate text-sm font-semibold ${isSelected ? "text-[#dbe7ff]" : "text-[#c8d7f0]"}`}>
                                  {member.name}
                                </div>
                                <div className="truncate text-xs text-[#7f97c3]">
                                  {member.email}
                                </div>
                                {isSelected && formData.splitType === "equal" && totalAmount > 0 && (
                                  <div className="mt-1 text-xs text-[#8ff0ff]">
                                    ₹{(totalAmount / formData.participants.length).toFixed(2)}
                                  </div>
                                )}
                              </div>
                              {isSelected && <Check size={18} className="text-[#00CDFF]" />}
                            </button>

                            {isSelected && formData.splitType !== "equal" && (
                              <div className="relative">
                                {formData.splitType === "manual" && (
                                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7f97c3] text-sm">₹</span>
                                )}
                                <input
                                  type="number"
                                  value={participant.value}
                                  onChange={(e) => handleParticipantValue(member._id, e.target.value)}
                                  placeholder={formData.splitType === "manual" ? "0.00" : "0"}
                                  min="0"
                                  max={formData.splitType === "percentage" ? 100 : undefined}
                                  step={formData.splitType === "manual" ? "0.01" : "1"}
                                  style={formData.splitType === "percentage" && splits[member._id] !== undefined ? { transition: "all 180ms ease" } : undefined}
                                  className={`${inputClass("split")} ${formData.splitType === "manual" ? "pl-8" : "pr-8"}`}
                                />
                                {formData.splitType === "percentage" && (
                                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7f97c3] text-sm">%</span>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                </div>

                {formData.participants.length > 0 && (
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs text-[#8ea5d1]">
                      {formData.participants.length} {formData.participants.length === 1 ? "person" : "people"} selected
                    </p>
                    {formData.splitType !== "equal" && (
                      <p className={`text-xs font-semibold transition-colors ${isSumValid ? "text-[#8ff0ff]" : "text-[#ff9bb7]"}`}>
                        {formData.splitType === "manual"
                          ? `₹${participantSum.toFixed(2)} / ₹${totalAmount.toFixed(2)}`
                          : `${participantSum.toFixed(0)}% / 100%`}
                      </p>
                    )}
                  </div>
                )}

                <FieldError msg={fieldErrors.split} />
                <FieldError msg={fieldErrors.participants} />
              </div>
            </div>

            <div className="border-t border-[#14315e] bg-[#071a42] px-4 py-4 sm:px-6">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => router.push(`/dashboard/groups/${groupId}/expense`)}
                  className="flex-1 rounded-xl border border-[#21477a] bg-[#081a43] px-4 py-3 text-sm font-semibold text-[#c8d7f0] transition hover:border-[#00CDFF]/40 hover:text-[#00CDFF]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || (formData.participants.length > 0 && formData.splitType !== "equal" && !isSumValid)}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#00CDFF] px-4 py-3 text-sm font-bold text-[#03203f] transition hover:bg-[#35dcff] disabled:cursor-not-allowed disabled:bg-[#21477a] disabled:text-[#9eb2d7]"
                >
                  {submitting ? (
                    <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  ) : (
                    <Plus size={18} />
                  )}
                  {submitting ? "Adding..." : "Add Expense"}
                </button>
              </div>
            </div>
          </form>
        </section>
      </div>
    </>
  );
}
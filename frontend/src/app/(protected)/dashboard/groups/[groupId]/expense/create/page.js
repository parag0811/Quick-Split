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
      <AlertCircle size={11} className="flex-shrink-0" />
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
          ? "bg-gradient-to-br from-[#00CDFF] to-[#1d7eff]"
          : "bg-gradient-to-br from-[#314a7a] to-[#1d355f]"
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

  const handleSplitTypeChange = (type) => {
    setFormData((prev) => ({
      ...prev,
      splitType: type,
      participants: prev.participants.map(({ userId }) => ({ userId, value: "" })),
    }));
  };

  const toggleParticipant = (userId) => {
    setFormData((prev) => {
      const exists = prev.participants.some((p) => p.userId === userId);
      return {
        ...prev,
        participants: exists
          ? prev.participants.filter((p) => p.userId !== userId)
          : [...prev.participants, { userId, value: "" }],
      };
    });
  };

  const handleParticipantValue = (userId, value) => {
    clearFieldError("split");
    setFormData((prev) => ({
      ...prev,
      participants: prev.participants.map((p) =>
        p.userId === userId ? { ...p, value: value === "" ? "" : Number(value) } : p,
      ),
    }));
  };

  const selectAllParticipants = () =>
    setFormData((prev) => ({
      ...prev,
      participants: members.map((m) => ({ userId: m._id, value: "" })),
    }));

  const clearAllParticipants = () =>
    setFormData((prev) => ({ ...prev, participants: [] }));

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
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0 text-[#ff9bb7]" />
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
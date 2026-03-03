"use client";
import { useEffect, useState } from "react";
import {
  X, DollarSign, FileText, Tag, Plus, Check, Users, AlertCircle,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { toastInfo } from "@/lib/toast";
import GroupSocketListener from "@/components/socket/GroupSocketListener";
import { useSelector } from "react-redux";

function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <p className="flex items-center gap-1 text-xs text-red-400 mt-1.5">
      <AlertCircle size={11} className="flex-shrink-0" />
      {msg}
    </p>
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
      setMembers(res.members);
    } catch (error) {
      throw error;
    } finally {
      setMembersLoading(false);
    }
  };

  useEffect(() => { fetchMembers(); }, [groupId, refreshKey]);

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
        p.userId === userId ? { ...p, value } : p,
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div>
            <h2 className="text-2xl font-bold text-white">Add Expense</h2>
            <p className="text-sm text-gray-400 mt-1">Split an expense with your group</p>
          </div>
          <button
            onClick={() => router.push(`/dashboard/groups/${groupId}/expense`)}
            className="p-2 hover:bg-[#252525] rounded-lg transition-all text-gray-400 hover:text-white cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">

            {/* ── Transient submit error banner ── */}
            {submitError && (
              <div className="flex items-start gap-3 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <AlertCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-300">{submitError}</p>
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <div className="flex items-center gap-2"><FileText size={16} />Title</div>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="What was this expense for?"
                className={`w-full px-4 py-2.5 bg-[#0f0f0f] border rounded-lg text-white placeholder-gray-500 focus:outline-none transition-all focus:ring-1 ${
                  fieldErrors.title
                    ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/20"
                    : "border-gray-800 focus:border-cyan-600 focus:ring-cyan-600"
                }`}
                required
              />
              <FieldError msg={fieldErrors.title} />
            </div>

            {/* Amount & Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <div className="flex items-center gap-2"><DollarSign size={16} />Total Amount</div>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                  <input
                    type="number"
                    name="totalAmount"
                    value={formData.totalAmount}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className={`w-full pl-8 pr-4 py-2.5 bg-[#0f0f0f] border rounded-lg text-white placeholder-gray-500 focus:outline-none transition-all focus:ring-1 ${
                      fieldErrors.totalAmount
                        ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/20"
                        : "border-gray-800 focus:border-cyan-600 focus:ring-cyan-600"
                    }`}
                    required
                  />
                </div>
                <FieldError msg={fieldErrors.totalAmount} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <div className="flex items-center gap-2"><Tag size={16} />Category</div>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 bg-[#0f0f0f] border rounded-lg text-white focus:outline-none transition-all appearance-none cursor-pointer focus:ring-1 ${
                    fieldErrors.category
                      ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/20"
                      : "border-gray-800 focus:border-cyan-600 focus:ring-cyan-600"
                  }`}
                  required
                >
                  <option value="" className="bg-[#1a1a1a]">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat} className="bg-[#1a1a1a]">{cat}</option>
                  ))}
                </select>
                <FieldError msg={fieldErrors.category} />
              </div>
            </div>

            {/* Paid By & Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <div className="flex items-center gap-2"><Users size={16} />Paid By</div>
                </label>
                <select
                  name="paidBy"
                  value={formData.paidBy}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 bg-[#0f0f0f] border rounded-lg text-white focus:outline-none transition-all appearance-none cursor-pointer focus:ring-1 ${
                    fieldErrors.paidBy
                      ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/20"
                      : "border-gray-800 focus:border-cyan-600 focus:ring-cyan-600"
                  }`}
                  required
                >
                  <option value="" className="bg-[#1a1a1a]">Select member</option>
                  {members.map((member) => (
                    <option key={member._id} value={member._id} className="bg-[#1a1a1a]">{member.name}</option>
                  ))}
                </select>
                <FieldError msg={fieldErrors.paidBy} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <div className="flex items-center gap-2"><FileText size={16} />Notes</div>
                </label>
                <input
                  type="text"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Add a description (optional)"
                  className={`w-full px-4 py-2.5 bg-[#0f0f0f] border rounded-lg text-white placeholder-gray-500 focus:outline-none transition-all focus:ring-1 ${
                    fieldErrors.notes
                      ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/20"
                      : "border-gray-800 focus:border-cyan-600 focus:ring-cyan-600"
                  }`}
                />
                <FieldError msg={fieldErrors.notes} />
              </div>
            </div>

            {/* Split Type */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Split Type</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: "equal", label: "Equal" },
                  { value: "manual", label: "Manual" },
                  { value: "percentage", label: "Percentage" },
                ].map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleSplitTypeChange(type.value)}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                      formData.splitType === type.value
                        ? "bg-cyan-600 text-white"
                        : "bg-[#0f0f0f] text-gray-400 border border-gray-800 hover:border-gray-700"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
              <FieldError msg={fieldErrors.splitType} />
            </div>

            {/* Participants */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-300">Split Between</label>
                <div className="flex gap-2">
                  <button type="button" onClick={selectAllParticipants} className="text-xs text-cyan-400 hover:text-cyan-300 transition-all cursor-pointer">
                    Select All
                  </button>
                  <span className="text-gray-600">•</span>
                  <button type="button" onClick={clearAllParticipants} className="text-xs text-gray-400 hover:text-gray-300 transition-all cursor-pointer">
                    Clear All
                  </button>
                </div>
              </div>

              {/* Equal split live preview */}
              {formData.splitType === "equal" && formData.participants.length > 0 && totalAmount > 0 && (
                <div className="mb-3 px-3 py-2 bg-cyan-950/20 border border-cyan-800/30 rounded-lg">
                  <p className="text-xs text-cyan-400">
                    Each person pays{" "}
                    <span className="font-semibold">
                      ₹{(totalAmount / formData.participants.length).toFixed(2)}
                    </span>{" "}
                    ({formData.participants.length} selected)
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {membersLoading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="h-16 bg-[#0f0f0f] border border-gray-800 rounded-lg animate-pulse" />
                    ))
                  : members.map((member) => {
                      const participant = formData.participants.find((p) => p.userId === member._id);
                      const isSelected = !!participant;
                      return (
                        <div key={member._id} className="flex flex-col gap-1">
                          <button
                            type="button"
                            onClick={() => toggleParticipant(member._id)}
                            className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                              isSelected
                                ? "bg-cyan-950/30 border-cyan-600/50 hover:border-cyan-600"
                                : "bg-[#0f0f0f] border-gray-800 hover:border-gray-700"
                            }`}
                          >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg flex-shrink-0 ${
                              isSelected
                                ? "bg-gradient-to-br from-cyan-600 to-blue-600"
                                : "bg-gradient-to-br from-gray-600 to-gray-700"
                            }`}>
                              {member.avatar}
                            </div>
                            <div className="flex-1 text-left">
                              <div className={`text-sm font-medium ${isSelected ? "text-white" : "text-gray-300"}`}>
                                {member.name}
                              </div>
                              {isSelected && formData.splitType === "equal" && totalAmount > 0 && (
                                <div className="text-xs text-cyan-500 mt-0.5">
                                  ₹{(totalAmount / formData.participants.length).toFixed(2)}
                                </div>
                              )}
                            </div>
                            {isSelected && <Check size={18} className="text-cyan-400 flex-shrink-0" />}
                          </button>

                          {isSelected && formData.splitType !== "equal" && (
                            <div className="relative">
                              {formData.splitType === "manual" && (
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                              )}
                              <input
                                type="number"
                                value={participant.value}
                                onChange={(e) => handleParticipantValue(member._id, Number(e.target.value))}
                                placeholder={formData.splitType === "manual" ? "0.00" : "0"}
                                min="0"
                                max={formData.splitType === "percentage" ? 100 : undefined}
                                step={formData.splitType === "manual" ? "0.01" : "1"}
                                className={`w-full py-2 bg-[#0f0f0f] border rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-1 transition-all ${
                                  formData.splitType === "manual" ? "pl-7 pr-4" : "pl-4 pr-7"
                                } ${fieldErrors.split ? "border-red-500/60" : "border-gray-800 focus:border-cyan-600 focus:ring-cyan-600"}`}
                              />
                              {formData.splitType === "percentage" && (
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
              </div>

              {/* Summary row */}
              {formData.participants.length > 0 && (
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-xs text-gray-400">
                    {formData.participants.length}{" "}
                    {formData.participants.length === 1 ? "person" : "people"} selected
                  </p>
                  {formData.splitType !== "equal" && (
                    <p className={`text-xs font-medium transition-colors ${isSumValid ? "text-cyan-400" : "text-red-400"}`}>
                      {formData.splitType === "manual"
                        ? `₹${participantSum.toFixed(2)} / ₹${totalAmount.toFixed(2)}`
                        : `${participantSum.toFixed(0)}% / 100%`}
                    </p>
                  )}
                </div>
              )}

              {/* Split / participants backend errors */}
              <FieldError msg={fieldErrors.split} />
              <FieldError msg={fieldErrors.participants} />
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-800 bg-[#1a1a1a]">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => router.push(`/dashboard/groups/${groupId}/expense`)}
                className="flex-1 px-4 py-2.5 bg-[#0f0f0f] border border-gray-800 hover:bg-[#252525] text-gray-300 hover:text-white rounded-lg text-sm font-medium transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  submitting ||
                  (formData.participants.length > 0 &&
                  formData.splitType !== "equal" &&
                  !isSumValid)
                }
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-cyan-900 disabled:to-blue-900 disabled:text-gray-500 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-cyan-900/30 hover:shadow-cyan-900/50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {submitting ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Plus size={18} />
                )}
                {submitting ? "Adding..." : "Add Expense"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
    </>
  );
}
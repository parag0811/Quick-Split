"use client";
import { useEffect, useState } from "react";
import { X, DollarSign, FileText, Tag, Plus, Check, Users } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

export default function CreateExpenseForm() {
  const [members, setMembers] = useState([]);
  const { groupId } = useParams();

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await apiFetch(`/groups/${groupId}/summary`);
        setMembers(res.members);
      } catch (error) {
        console.log("Failed to fetch members: ", error);
      }
    };
    fetchMembers();
  }, [groupId]);

  const router = useRouter();
  const [error, setErrors] = useState({});

  const [formData, setFormData] = useState({
    title: "",
    totalAmount: "",
    paidBy: "",
    category: "",
    notes: "",
    splitType: "equal",
    participants: [], // [{ userId, value? }]
  });

  const categories = ["food", "travel", "rent", "shopping", "other"];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSplitTypeChange = (type) => {
    setFormData((prev) => ({
      ...prev,
      splitType: type,
      participants: prev.participants.map(({ userId }) => ({
        userId,
        value: "",
      })),
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
    setFormData((prev) => ({
      ...prev,
      participants: prev.participants.map((p) =>
        p.userId === userId ? { ...p, value } : p,
      ),
    }));
  };

  const selectAllParticipants = () => {
    setFormData((prev) => ({
      ...prev,
      participants: members.map((m) => ({ userId: m._id, value: "" })),
    }));
  };

  const clearAllParticipants = () => {
    setFormData((prev) => ({ ...prev, participants: [] }));
  };

  const participantSum = formData.participants.reduce(
    (acc, p) => acc + (parseFloat(p.value) || 0),
    0,
  );
  const totalAmount = parseFloat(formData.totalAmount) || 0;

  const isSumValid =
    formData.splitType === "equal" ||
    (formData.splitType === "manual" &&
      Math.abs(participantSum - totalAmount) < 0.01) ||
    (formData.splitType === "percentage" &&
      Math.abs(participantSum - 100) < 0.01);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!isSumValid) {
      setErrors({
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
        setErrors({ split: "Enter amount for every selected participant" });
        return;
      }
    }
    console.log("PAYLOAD →", JSON.stringify(formData, null, 2));

    try {
      const data = await apiFetch(`/group/${groupId}/expense/add`, {
        method: "POST",
        body: formData,
      });
      console.log(data);
      router.push(`/dashboard/groups/${groupId}/expense`);
    } catch (error) {
      if (error.validation) {
        const fieldErrors = {};
        error.validation.forEach((e) => {
          fieldErrors[e.path] = e.msg;
        });
        setErrors(fieldErrors);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div>
            <h2 className="text-2xl font-bold text-white">Add Expense</h2>
            <p className="text-sm text-gray-400 mt-1">
              Split an expense with your group
            </p>
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
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <div className="flex items-center gap-2">
                  <FileText size={16} />
                  Title
                </div>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="What was this expense for?"
                className={`w-full px-4 py-2.5 bg-[#0f0f0f] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 transition-all ${error.title ? "border-red-500" : "border-gray-800"}`}
                required
              />
              {error.title && (
                <p className="text-xs text-red-400 mt-1">{error.title}</p>
              )}
            </div>

            {/* Amount & Category Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <div className="flex items-center gap-2">
                    <DollarSign size={16} />
                    Total Amount
                  </div>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
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
                    className={`w-full pl-8 pr-4 py-2.5 bg-[#0f0f0f] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 transition-all ${error.totalAmount ? "border-red-500" : "border-gray-800"}`}
                    required
                  />
                </div>
                {error.totalAmount && (
                  <p className="text-xs text-red-400 mt-1">
                    {error.totalAmount}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <div className="flex items-center gap-2">
                    <Tag size={16} />
                    Category
                  </div>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 bg-[#0f0f0f] border rounded-lg text-white focus:outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 transition-all appearance-none cursor-pointer ${error.category ? "border-red-500" : "border-gray-800"}`}
                  required
                >
                  <option value="" className="bg-[#1a1a1a]">
                    Select category
                  </option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat} className="bg-[#1a1a1a]">
                      {cat}
                    </option>
                  ))}
                </select>
                {error.category && (
                  <p className="text-xs text-red-400 mt-1">{error.category}</p>
                )}
              </div>
            </div>

            {/* Paid By & Notes Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <div className="flex items-center gap-2">
                    <Users size={16} />
                    Paid By
                  </div>
                </label>
                <select
                  name="paidBy"
                  value={formData.paidBy}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 bg-[#0f0f0f] border rounded-lg text-white focus:outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 transition-all appearance-none cursor-pointer ${error.paidBy ? "border-red-500" : "border-gray-800"}`}
                  required
                >
                  <option value="" className="bg-[#1a1a1a]">
                    Select member
                  </option>
                  {members.map((member) => (
                    <option
                      key={member._id}
                      value={member._id}
                      className="bg-[#1a1a1a]"
                    >
                      {member.name}
                    </option>
                  ))}
                </select>
                {error.paidBy && (
                  <p className="text-xs text-red-400 mt-1">{error.paidBy}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <div className="flex items-center gap-2">
                    <FileText size={16} />
                    Notes
                  </div>
                </label>
                <input
                  type="text"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Add a description (optional)"
                  className={`w-full px-4 py-2.5 bg-[#0f0f0f] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 transition-all ${error.notes ? "border-red-500" : "border-gray-800"}`}
                />
                {error.notes && (
                  <p className="text-xs text-red-400 mt-1">{error.notes}</p>
                )}
              </div>
            </div>

            {/* Split Type */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Split Type
              </label>
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
            </div>

            {/* Participants Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-300">
                  Split Between
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={selectAllParticipants}
                    className="text-xs text-cyan-400 hover:text-cyan-300 transition-all cursor-pointer"
                  >
                    Select All
                  </button>
                  <span className="text-gray-600">•</span>
                  <button
                    type="button"
                    onClick={clearAllParticipants}
                    className="text-xs text-gray-400 hover:text-gray-300 transition-all cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {error.participants && (
                <p className="text-xs text-red-400 mt-1">
                  {error.participants}
                </p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {members.map((member) => {
                  const participant = formData.participants.find(
                    (p) => p.userId === member._id,
                  );
                  const isSelected = !!participant;

                  return (
                    <div key={member._id} className="flex flex-col gap-1">
                      {/* Member row */}
                      <button
                        type="button"
                        onClick={() => toggleParticipant(member._id)}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-cyan-950/30 border-cyan-600/50 hover:border-cyan-600"
                            : "bg-[#0f0f0f] border-gray-800 hover:border-gray-700"
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg flex-shrink-0 ${
                            isSelected
                              ? "bg-gradient-to-br from-cyan-600 to-blue-600"
                              : "bg-gradient-to-br from-gray-600 to-gray-700"
                          }`}
                        >
                          {member.avatar}
                        </div>
                        <div className="flex-1 text-left">
                          <div
                            className={`text-sm font-medium ${
                              isSelected ? "text-white" : "text-gray-300"
                            }`}
                          >
                            {member.name}
                          </div>
                        </div>
                        {isSelected && (
                          <Check
                            size={18}
                            className="text-cyan-400 flex-shrink-0"
                          />
                        )}
                      </button>

                      {/* Value input — only for manual/percentage and selected */}
                      {isSelected && formData.splitType !== "equal" && (
                        <div className="relative">
                          {formData.splitType === "manual" && (
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                              ₹
                            </span>
                          )}
                          <input
                            type="number"
                            value={participant.value}
                            onChange={(e) =>
                              handleParticipantValue(
                                member._id,
                                Number(e.target.value),
                              )
                            }
                            placeholder={
                              formData.splitType === "manual" ? "0.00" : "0"
                            }
                            min="0"
                            max={
                              formData.splitType === "percentage"
                                ? 100
                                : undefined
                            }
                            step={
                              formData.splitType === "manual" ? "0.01" : "1"
                            }
                            className={`w-full py-2 bg-[#0f0f0f] border rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 transition-all ${
                              formData.splitType === "manual"
                                ? "pl-7 pr-4"
                                : "pl-4 pr-7"
                            }`}
                          />
                          {formData.splitType === "percentage" && (
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                              %
                            </span>
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
                    {formData.participants.length === 1 ? "person" : "people"}{" "}
                    selected
                  </p>

                  {/* Live sum indicator */}
                  {formData.splitType !== "equal" && (
                    <p
                      className={`text-xs font-medium transition-colors ${
                        isSumValid ? "text-cyan-400" : "text-red-400"
                      }`}
                    >
                      {formData.splitType === "manual"
                        ? `₹${participantSum.toFixed(2)} / ₹${totalAmount.toFixed(2)}`
                        : `${participantSum.toFixed(0)}% / 100%`}
                    </p>
                  )}
                </div>
              )}

              {/* Split error */}
              {error.split && (
                <p className="text-xs text-red-400 mt-2">{error.split}</p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-800 bg-[#1a1a1a]">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() =>
                  router.push(`/dashboard/groups/${groupId}/expense`)
                }
                className="flex-1 px-4 py-2.5 bg-[#0f0f0f] border border-gray-800 hover:bg-[#252525] text-gray-300 hover:text-white rounded-lg text-sm font-medium transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  formData.participants.length > 0 &&
                  formData.splitType !== "equal" &&
                  !isSumValid
                }
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-cyan-900 disabled:to-blue-900 disabled:text-gray-500 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-cyan-900/30 hover:shadow-cyan-900/50 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus size={18} />
                Add Expense
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

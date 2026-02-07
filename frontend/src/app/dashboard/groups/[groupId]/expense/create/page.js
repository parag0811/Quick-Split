"use client";
import { useEffect, useState } from "react";
import {
  X,
  DollarSign,
  Calendar,
  Users,
  FileText,
  Tag,
  Plus,
  Trash2,
  Check,
} from "lucide-react";
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
    splitType: "equal", // equal, manual, percentage
    participants: [],
  });

  const categories = ["food", "travel", "rent", "shopping", "other"];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleParticipant = (userId) => {
    setFormData((prev) => ({
      ...prev,
      participants: prev.participants.includes(userId)
        ? prev.participants.filter((id) => id !== userId)
        : [...prev.participants, userId],
    }));
  };

  const payload = {
    ...formData,
    participants: formData.participants.map((id) => ({
      userId: id,
    })),
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      const data = await apiFetch(`/group/${groupId}/expense/add`, {
        method: "POST",
        body: payload,
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

  const selectAllParticipants = () => {
    setFormData((prev) => ({
      ...prev,
      participants: members.map((m) => m._id),
    }));
  };

  const clearAllParticipants = () => {
    setFormData((prev) => ({
      ...prev,
      participants: [],
    }));
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
                className="w-full px-4 py-2.5 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 transition-all"
                required
              />
            </div>

            {/* Amount & Category Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Amount */}
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
                    className="w-full pl-8 pr-4 py-2.5 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Category */}
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
                  className="w-full px-4 py-2.5 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white focus:outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 transition-all appearance-none cursor-pointer"
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
              </div>
            </div>

            {/* Paid By & Notes Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Paid By */}
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
                  className="w-full px-4 py-2.5 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white focus:outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 transition-all appearance-none cursor-pointer"
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
              </div>

              {/* Notes */}
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
                  className="w-full px-4 py-2.5 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 transition-all"
                />
              </div>
            </div>

            {/* Split Type */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Split Type
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() =>
                    handleInputChange({
                      target: { name: "splitType", value: "equal" },
                    })
                  }
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                    formData.splitType === "equal"
                      ? "bg-cyan-600 text-white"
                      : "bg-[#0f0f0f] text-gray-400 border border-gray-800 hover:border-gray-700"
                  }`}
                >
                  Equal
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleInputChange({
                      target: { name: "splitType", value: "manual" },
                    })
                  }
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                    formData.splitType === "unequal"
                      ? "bg-cyan-600 text-white"
                      : "bg-[#0f0f0f] text-gray-400 border border-gray-800 hover:border-gray-700"
                  }`}
                >
                  Manual
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleInputChange({
                      target: { name: "splitType", value: "percentage" },
                    })
                  }
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                    formData.splitType === "percentage"
                      ? "bg-cyan-600 text-white"
                      : "bg-[#0f0f0f] text-gray-400 border border-gray-800 hover:border-gray-700"
                  }`}
                >
                  Percentage
                </button>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {members.map((member) => {
                  const isSelected = formData.participants.includes(member._id);
                  return (
                    <button
                      key={member._id}
                      type="button"
                      onClick={() => toggleParticipant(member._id)}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-cyan-950/30 border-cyan-600/50 hover:border-cyan-600"
                          : "bg-[#0f0f0f] border-gray-800 hover:border-gray-700"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg ${
                          isSelected
                            ? "bg-gradient-to-br from-cyan-600 to-blue-600"
                            : "bg-gradient-to-br from-gray-600 to-gray-700"
                        }`}
                      >
                        {member.avatar}
                      </div>
                      <div className="flex-1 text-left">
                        <div
                          className={`text-sm font-medium ${isSelected ? "text-white" : "text-gray-300"}`}
                        >
                          {member.name}
                        </div>
                      </div>
                      {isSelected && (
                        <Check size={18} className="text-cyan-400" />
                      )}
                    </button>
                  );
                })}
              </div>

              {formData.participants.length > 0 && (
                <p className="text-xs text-gray-400 mt-2">
                  {formData.participants.length}{" "}
                  {formData.participants.length === 1 ? "person" : "people"}{" "}
                  selected
                </p>
              )}
            </div>
          </div>

          {/* Footer - Fixed at Bottom */}
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
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-cyan-900/30 hover:shadow-cyan-900/50 flex items-center justify-center gap-2 cursor-pointer"
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

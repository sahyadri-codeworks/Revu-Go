"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle, Clock, CheckCircle, XCircle, ChevronDown,
  User, Mail, Phone, Eye, EyeOff, Star, MessageSquare, Filter,
  Loader2, Search, Upload, Download,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAppState } from "@/lib/app-context";
import { generateCSV, downloadCSV, COMPLAINT_FIELDS } from "@/lib/csv";
import { ImportCSVModal } from "@/components/dashboard/ImportCSVModal";
import { toast } from "sonner";
import type { Complaint } from "@/types";

const toastStyle = { backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB", color: "#111" };

const STATUS_CONFIG = {
  open: { label: "Open", color: "text-[#F59E0B]", bg: "bg-[#FEF3C7]", icon: AlertTriangle },
  in_progress: { label: "In Progress", color: "text-[#3B82F6]", bg: "bg-[#DBEAFE]", icon: Clock },
  resolved: { label: "Resolved", color: "text-[#10B981]", bg: "bg-[#D1FAE5]", icon: CheckCircle },
  closed: { label: "Closed", color: "text-[#6B7280]", bg: "bg-[#F3F4F6]", icon: XCircle },
} as const;

export default function ComplaintsPage() {
  const { business } = useAppState();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | Complaint["status"]>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [showImport, setShowImport] = useState(false);

  useEffect(() => {
    if (!business?.id) return;
    const supabase = createClient();
    supabase
      .from("complaints")
      .select("*")
      .eq("business_id", business.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setComplaints(data as Complaint[]);
        setLoading(false);
      });
  }, [business?.id]);

  const updateStatus = async (id: string, newStatus: Complaint["status"]) => {
    setUpdatingId(id);
    const res = await fetch("/api/complaints", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ complaintId: id, status: newStatus }),
    });

    if (res.ok) {
      setComplaints((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: newStatus, updated_at: new Date().toISOString() } : c))
      );
    }
    setUpdatingId(null);
  };

  const saveNotes = async (id: string, notes: string) => {
    const res = await fetch("/api/complaints", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ complaintId: id, business_notes: notes }),
    });

    if (res.ok) {
      setComplaints((prev) =>
        prev.map((c) => (c.id === id ? { ...c, business_notes: notes } : c))
      );
    }
  };

  const handleExport = () => {
    const dataToExport = filter === "all" ? complaints : complaints.filter((c) => c.status === filter);
    const headers = ["complaint_text", "star_rating", "status", "contact_name", "contact_email", "contact_phone", "is_anonymous", "business_notes", "created_at"];
    const rows = dataToExport.map((c) => [
      c.complaint_text, String(c.star_rating), c.status,
      c.contact_name || "", c.contact_email || "", c.contact_phone || "",
      String(c.is_anonymous), c.business_notes || "", c.created_at,
    ]);
    const csv = generateCSV(headers, rows);
    downloadCSV(csv, "customer-concerns.csv");
    toast.success(`Exported ${rows.length} concerns`, { style: toastStyle });
  };

  const handleImport = async (records: Record<string, string>[]) => {
    const res = await fetch("/api/csv/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ module: "complaints", records }),
    });
    const data = await res.json();
    if (data.success > 0) {
      const supabase = createClient();
      const { data: refreshed } = await supabase
        .from("complaints")
        .select("*")
        .eq("business_id", business!.id)
        .order("created_at", { ascending: false });
      if (refreshed) setComplaints(refreshed as Complaint[]);
    }
    return { success: data.success || 0, failed: data.failed || 0 };
  };

  const filtered = complaints.filter((c) => {
    if (filter !== "all" && c.status !== filter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        c.complaint_text.toLowerCase().includes(q) ||
        c.contact_name?.toLowerCase().includes(q) ||
        c.contact_email?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const counts = {
    all: complaints.length,
    open: complaints.filter((c) => c.status === "open").length,
    in_progress: complaints.filter((c) => c.status === "in_progress").length,
    resolved: complaints.filter((c) => c.status === "resolved").length,
    closed: complaints.filter((c) => c.status === "closed").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#7C3AED] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold text-[#111] mb-1">Customer Concerns</h1>
          <p className="text-[13px] text-[#6B7280]">
            Track and resolve customer complaints to improve your service
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowImport(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#E5E7EB] text-[11px] text-[#6B7280] font-semibold hover:text-[#111] hover:border-[#D1D5DB] transition-colors">
            <Upload className="w-3.5 h-3.5" /> Import CSV
          </button>
          <button onClick={handleExport} disabled={complaints.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#E5E7EB] text-[11px] text-[#6B7280] font-semibold hover:text-[#111] hover:border-[#D1D5DB] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {(["open", "in_progress", "resolved", "closed"] as const).map((s) => {
          const cfg = STATUS_CONFIG[s];
          const Icon = cfg.icon;
          return (
            <button key={s} onClick={() => setFilter(filter === s ? "all" : s)}
              className={`rounded-xl border p-3 text-left transition-all ${
                filter === s ? "border-[#7C3AED] bg-[#7C3AED]/5" : "border-[#E5E7EB] bg-white hover:border-[#D1D5DB]"
              }`}>
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-6 h-6 rounded-lg ${cfg.bg} flex items-center justify-center`}>
                  <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                </div>
                <span className="text-[18px] font-bold text-[#111]">{counts[s]}</span>
              </div>
              <p className="text-[11px] text-[#6B7280] font-medium">{cfg.label}</p>
            </button>
          );
        })}
      </div>

      {/* Search & filter bar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
          <input
            type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search concerns..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#E5E7EB] text-[13px] text-[#111] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#7C3AED]/40 bg-white"
          />
        </div>
        {filter !== "all" && (
          <button onClick={() => setFilter("all")}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-[#E5E7EB] text-[12px] text-[#6B7280] hover:bg-[#F3F4F6] transition-colors">
            <Filter className="w-3.5 h-3.5" /> Clear
          </button>
        )}
      </div>

      {/* Complaints list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-[#F3F4F6] flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-7 h-7 text-[#9CA3AF]" />
          </div>
          <h3 className="text-[15px] font-semibold text-[#111] mb-1">
            {complaints.length === 0 ? "No concerns yet" : "No matching concerns"}
          </h3>
          <p className="text-[12px] text-[#9CA3AF]">
            {complaints.length === 0
              ? "Customer concerns will appear here when submitted"
              : "Try adjusting your search or filter"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((complaint) => (
              <ComplaintCard
                key={complaint.id}
                complaint={complaint}
                isExpanded={expandedId === complaint.id}
                onToggle={() => setExpandedId(expandedId === complaint.id ? null : complaint.id)}
                onStatusChange={updateStatus}
                onSaveNotes={saveNotes}
                isUpdating={updatingId === complaint.id}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      <ImportCSVModal
        open={showImport}
        onClose={() => setShowImport(false)}
        module="complaints"
        fields={COMPLAINT_FIELDS}
        onImport={handleImport}
      />
    </div>
  );
}

function ComplaintCard({
  complaint, isExpanded, onToggle, onStatusChange, onSaveNotes, isUpdating,
}: {
  complaint: Complaint;
  isExpanded: boolean;
  onToggle: () => void;
  onStatusChange: (id: string, status: Complaint["status"]) => Promise<void>;
  onSaveNotes: (id: string, notes: string) => Promise<void>;
  isUpdating: boolean;
}) {
  const cfg = STATUS_CONFIG[complaint.status];
  const Icon = cfg.icon;
  const [notes, setNotes] = useState(complaint.business_notes || "");
  const [notesSaved, setNotesSaved] = useState(false);
  const timeAgo = getTimeAgo(complaint.created_at);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden hover:border-[#D1D5DB] transition-colors"
    >
      {/* Header */}
      <button onClick={onToggle} className="w-full px-4 py-3.5 flex items-start gap-3 text-left">
        <div className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
          <Icon className={`w-4 h-4 ${cfg.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] text-[#111] font-medium line-clamp-2 mb-1">
            {complaint.complaint_text}
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${cfg.bg} ${cfg.color}`}>
              {cfg.label}
            </span>
            <span className="flex items-center gap-1 text-[10px] text-[#9CA3AF]">
              <Star className="w-3 h-3 fill-[#F59E0B] text-[#F59E0B]" /> {complaint.star_rating}/5
            </span>
            <span className="text-[10px] text-[#9CA3AF]">{timeAgo}</span>
            {complaint.is_anonymous ? (
              <span className="flex items-center gap-1 text-[10px] text-[#9CA3AF]">
                <EyeOff className="w-3 h-3" /> Anonymous
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] text-[#6B7280]">
                <Eye className="w-3 h-3" /> {complaint.contact_name || "Named"}
              </span>
            )}
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-[#9CA3AF] flex-shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
      </button>

      {/* Expanded details */}
      {isExpanded && (
        <motion.div initial={{ height: 0 }} animate={{ height: "auto" }}
          className="border-t border-[#F3F4F6] px-4 py-4 space-y-4">
          {/* Full complaint text */}
          <div>
            <h4 className="text-[11px] text-[#9CA3AF] font-semibold uppercase tracking-wider mb-2">Complaint Details</h4>
            <p className="text-[13px] text-[#374151] leading-relaxed bg-[#F9FAFB] rounded-xl p-3 border border-[#F3F4F6]">
              {complaint.complaint_text}
            </p>
          </div>

          {/* Contact info */}
          {!complaint.is_anonymous && (
            <div>
              <h4 className="text-[11px] text-[#9CA3AF] font-semibold uppercase tracking-wider mb-2">Contact Information</h4>
              <div className="bg-[#F9FAFB] rounded-xl p-3 border border-[#F3F4F6] space-y-2">
                {complaint.contact_name && (
                  <div className="flex items-center gap-2 text-[13px] text-[#374151]">
                    <User className="w-4 h-4 text-[#9CA3AF]" /> {complaint.contact_name}
                  </div>
                )}
                {complaint.contact_email && (
                  <div className="flex items-center gap-2 text-[13px] text-[#374151]">
                    <Mail className="w-4 h-4 text-[#9CA3AF]" />
                    <a href={`mailto:${complaint.contact_email}`} className="text-[#7C3AED] hover:underline">
                      {complaint.contact_email}
                    </a>
                  </div>
                )}
                {complaint.contact_phone && (
                  <div className="flex items-center gap-2 text-[13px] text-[#374151]">
                    <Phone className="w-4 h-4 text-[#9CA3AF]" />
                    <a href={`tel:${complaint.contact_phone}`} className="text-[#7C3AED] hover:underline">
                      {complaint.contact_phone}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Status update */}
          <div>
            <h4 className="text-[11px] text-[#9CA3AF] font-semibold uppercase tracking-wider mb-2">Update Status</h4>
            <div className="flex flex-wrap gap-2">
              {(["open", "in_progress", "resolved", "closed"] as const).map((s) => {
                const sc = STATUS_CONFIG[s];
                return (
                  <button key={s} onClick={() => onStatusChange(complaint.id, s)}
                    disabled={complaint.status === s || isUpdating}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-semibold border transition-all ${
                      complaint.status === s
                        ? `${sc.bg} ${sc.color} border-transparent`
                        : "border-[#E5E7EB] text-[#6B7280] hover:border-[#D1D5DB] hover:bg-[#F9FAFB]"
                    } disabled:opacity-50`}
                  >
                    {isUpdating && complaint.status !== s ? null : <sc.icon className="w-3.5 h-3.5" />}
                    {sc.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Business notes */}
          <div>
            <h4 className="text-[11px] text-[#9CA3AF] font-semibold uppercase tracking-wider mb-2">Internal Notes</h4>
            <textarea
              value={notes} onChange={(e) => { setNotes(e.target.value); setNotesSaved(false); }}
              placeholder="Add private notes about this complaint..."
              className="w-full px-3 py-2.5 rounded-xl border border-[#E5E7EB] text-[13px] text-[#111] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#7C3AED]/40 resize-none min-h-[80px]"
            />
            <div className="flex items-center justify-end gap-2 mt-2">
              {notesSaved && <span className="text-[11px] text-[#10B981] font-medium">Saved!</span>}
              <button
                onClick={async () => { await onSaveNotes(complaint.id, notes); setNotesSaved(true); setTimeout(() => setNotesSaved(false), 2000); }}
                className="px-4 py-2 rounded-lg bg-[#7C3AED] text-white text-[12px] font-semibold hover:bg-[#6D28D9] transition-colors"
              >
                Save Notes
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

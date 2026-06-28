"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Send,
  ChevronDown,
  ChevronRight,
  Clock,
  AlertCircle,
  CheckCircle2,
  Loader2,
  X,
  MessageSquare,
} from "lucide-react";

type Priority = "low" | "medium" | "high" | "urgent";
type Status = "open" | "in_progress" | "resolved" | "closed";

interface TicketMessage {
  id: string;
  sender_type: "business" | "admin";
  sender_email: string;
  message: string;
  is_internal_note: boolean;
  created_at: string;
}

interface Ticket {
  id: string;
  subject: string;
  priority: Priority;
  status: Status;
  created_at: string;
  updated_at: string;
  messages: TicketMessage[];
}

const STATUS_CONFIG: Record<Status, { label: string; color: string; bg: string; icon: typeof Clock }> = {
  open: { label: "Open", color: "#3B82F6", bg: "rgba(59,130,246,0.08)", icon: AlertCircle },
  in_progress: { label: "In Progress", color: "#F59E0B", bg: "rgba(245,158,11,0.08)", icon: Clock },
  resolved: { label: "Resolved", color: "#10B981", bg: "rgba(16,185,129,0.08)", icon: CheckCircle2 },
  closed: { label: "Closed", color: "#6B7280", bg: "rgba(107,114,128,0.08)", icon: CheckCircle2 },
};

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bg: string }> = {
  low: { label: "Low", color: "#6B7280", bg: "rgba(107,114,128,0.08)" },
  medium: { label: "Medium", color: "#3B82F6", bg: "rgba(59,130,246,0.08)" },
  high: { label: "High", color: "#F59E0B", bg: "rgba(245,158,11,0.08)" },
  urgent: { label: "Urgent", color: "#EF4444", bg: "rgba(239,68,68,0.08)" },
};

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) +
    " at " + d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function HelpPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);

  // New ticket form state
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [creating, setCreating] = useState(false);

  const fetchTickets = useCallback(async () => {
    try {
      const res = await fetch("/api/support-tickets?action=my-tickets");
      const data = await res.json();
      setTickets(data.tickets || []);
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const handleCreate = async () => {
    if (!subject.trim() || !message.trim()) return;
    setCreating(true);
    try {
      await fetch("/api/support-tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", subject, message, priority }),
      });
      setSubject("");
      setMessage("");
      setPriority("medium");
      setShowNewForm(false);
      await fetchTickets();
    } catch {} finally {
      setCreating(false);
    }
  };

  const handleReply = async (ticketId: string) => {
    if (!replyText.trim()) return;
    setSending(true);
    try {
      await fetch("/api/support-tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reply", ticketId, message: replyText }),
      });
      setReplyText("");
      await fetchTickets();
    } catch {} finally {
      setSending(false);
    }
  };

  const openCount = tickets.filter((t) => t.status === "open" || t.status === "in_progress").length;

  const inputClass =
    "w-full px-4 py-3 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] text-[#111] text-sm placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#7C3AED]/30 focus:ring-1 focus:ring-[#7C3AED]/15 transition-all";
  const labelClass = "block text-[10px] text-[#6B7280] uppercase tracking-[0.12em] font-medium mb-2";

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h2 className="text-lg font-bold text-[#111] tracking-[-0.01em]">Help & Support</h2>
          <p className="text-[13px] text-[#6B7280] mt-1">
            Raise issues related to the platform. Our team will respond shortly.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {openCount > 0 && (
            <span className="px-3 py-1.5 rounded-full bg-[#3B82F6]/8 text-[#3B82F6] text-[11px] font-semibold">
              {openCount} Active
            </span>
          )}
          <button
            onClick={() => setShowNewForm(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] text-white rounded-xl text-[12px] uppercase tracking-wider font-bold hover:shadow-[0_0_24px_rgba(124,58,237,0.25)] transition-all"
          >
            <Plus className="w-4 h-4" />
            New Ticket
          </button>
        </div>
      </div>

      {/* New Ticket Modal */}
      <AnimatePresence>
        {showNewForm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm" onClick={() => setShowNewForm(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-full max-w-lg bg-white border border-[#E5E7EB] rounded-2xl shadow-xl">
                <div className="px-6 pt-6 pb-4 flex items-start justify-between">
                  <div>
                    <h2 className="text-[15px] font-bold text-[#111]">Raise a Support Ticket</h2>
                    <p className="text-[11px] text-[#6B7280] mt-0.5">Describe your issue and we&apos;ll get back to you</p>
                  </div>
                  <button onClick={() => setShowNewForm(false)} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#6B7280] hover:text-[#111] hover:bg-[#F3F4F6] transition-all">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="h-px bg-[#F3F4F6]" />

                <div className="px-6 py-5 space-y-4">
                  <div>
                    <label className={labelClass}>Subject</label>
                    <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)}
                      placeholder="Brief description of the issue" className={inputClass} />
                  </div>

                  <div>
                    <label className={labelClass}>Priority</label>
                    <div className="flex gap-2">
                      {(Object.entries(PRIORITY_CONFIG) as [Priority, typeof PRIORITY_CONFIG.low][]).map(([key, cfg]) => (
                        <button
                          key={key}
                          onClick={() => setPriority(key)}
                          className={`flex-1 py-2.5 rounded-xl text-[11px] font-semibold uppercase tracking-wider border transition-all ${
                            priority === key
                              ? "border-[#7C3AED] bg-[#7C3AED]/5 text-[#7C3AED]"
                              : "border-[#E5E7EB] text-[#6B7280] hover:border-[#D1D5DB]"
                          }`}
                        >
                          {cfg.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Describe Your Issue</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Please provide details about the issue you're experiencing..."
                      rows={4}
                      className={`${inputClass} resize-none`}
                    />
                  </div>
                </div>

                <div className="h-px bg-[#F3F4F6]" />

                <div className="px-6 py-4 flex items-center gap-3">
                  <button onClick={() => setShowNewForm(false)}
                    className="flex-1 py-3 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[11px] text-[#6B7280] uppercase tracking-[0.12em] font-medium hover:text-[#111] hover:bg-[#E5E7EB] transition-all">
                    Cancel
                  </button>
                  <button onClick={handleCreate} disabled={!subject.trim() || !message.trim() || creating}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] text-white text-[11px] uppercase tracking-[0.12em] font-bold hover:shadow-[0_0_20px_rgba(124,58,237,0.2)] transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    Submit Ticket
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-[#7C3AED] animate-spin" />
        </div>
      ) : tickets.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#F3F4F6] border border-[#E5E7EB] flex items-center justify-center mx-auto mb-5">
            <MessageSquare className="w-7 h-7 text-[#6B7280]" />
          </div>
          <h3 className="text-[#374151] text-base font-bold mb-2">No support tickets</h3>
          <p className="text-[#6B7280] text-sm mb-6 max-w-sm mx-auto">
            Having issues with the platform? Raise a ticket and our team will help you out.
          </p>
          <button onClick={() => setShowNewForm(true)}
            className="px-6 py-3 bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] text-white rounded-xl text-[12px] uppercase tracking-wider font-bold hover:shadow-[0_0_24px_rgba(124,58,237,0.25)] transition-all">
            Raise Your First Ticket
          </button>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket, i) => {
            const statusCfg = STATUS_CONFIG[ticket.status];
            const priorityCfg = PRIORITY_CONFIG[ticket.priority];
            const StatusIcon = statusCfg.icon;
            const isExpanded = expandedId === ticket.id;
            const lastMsg = ticket.messages[ticket.messages.length - 1];
            const hasAdminReply = ticket.messages.some((m) => m.sender_type === "admin");

            return (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
                className="glass-card rounded-2xl overflow-hidden"
              >
                {/* Ticket header */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : ticket.id)}
                  className="w-full px-5 py-4 flex items-center gap-4 text-left hover:bg-[#F9FAFB] transition-colors"
                >
                  <div className="flex-shrink-0">
                    {isExpanded ? <ChevronDown className="w-4 h-4 text-[#9CA3AF]" /> : <ChevronRight className="w-4 h-4 text-[#9CA3AF]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-1">
                      <h3 className="text-[14px] font-semibold text-[#111] truncate">{ticket.subject}</h3>
                      {hasAdminReply && !isExpanded && (
                        <span className="flex-shrink-0 w-2 h-2 rounded-full bg-[#7C3AED]" title="Admin replied" />
                      )}
                    </div>
                    <p className="text-[11px] text-[#9CA3AF]">
                      Opened {formatDateTime(ticket.created_at)} &middot; Last update {timeAgo(ticket.updated_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider"
                      style={{ color: priorityCfg.color, backgroundColor: priorityCfg.bg }}>
                      {priorityCfg.label}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider"
                      style={{ color: statusCfg.color, backgroundColor: statusCfg.bg }}>
                      <StatusIcon className="w-3 h-3" />
                      {statusCfg.label}
                    </span>
                  </div>
                </button>

                {/* Expanded conversation */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-[#F3F4F6] px-5 py-4">
                        {/* Messages */}
                        <div className="space-y-3 mb-4 max-h-[400px] overflow-y-auto">
                          {ticket.messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.sender_type === "business" ? "justify-end" : "justify-start"}`}>
                              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                                msg.sender_type === "business"
                                  ? "bg-[#7C3AED]/8 border border-[#7C3AED]/10"
                                  : "bg-[#F3F4F6] border border-[#E5E7EB]"
                              }`}>
                                <div className="flex items-center gap-2 mb-1.5">
                                  <span className={`text-[10px] font-semibold uppercase tracking-wider ${
                                    msg.sender_type === "business" ? "text-[#7C3AED]" : "text-[#166534]"
                                  }`}>
                                    {msg.sender_type === "business" ? "You" : "Support Team"}
                                  </span>
                                  <span className="text-[9px] text-[#9CA3AF]">{formatDateTime(msg.created_at)}</span>
                                </div>
                                <p className="text-[13px] text-[#374151] leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Reply box (if not closed/resolved) */}
                        {(ticket.status === "open" || ticket.status === "in_progress") && (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={expandedId === ticket.id ? replyText : ""}
                              onChange={(e) => setReplyText(e.target.value)}
                              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleReply(ticket.id)}
                              placeholder="Type your reply..."
                              className="flex-1 px-4 py-2.5 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] text-[13px] text-[#111] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#7C3AED]/30 transition-all"
                            />
                            <button
                              onClick={() => handleReply(ticket.id)}
                              disabled={!replyText.trim() || sending}
                              className="px-4 py-2.5 rounded-xl bg-[#7C3AED] text-white hover:bg-[#6D28D9] transition-all disabled:opacity-30"
                            >
                              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            </button>
                          </div>
                        )}

                        {(ticket.status === "resolved" || ticket.status === "closed") && (
                          <div className="text-center py-2">
                            <span className="text-[11px] text-[#9CA3AF] font-medium">
                              This ticket has been {ticket.status}
                            </span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

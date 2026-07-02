"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Bell, X, AlertTriangle, MessageSquare, CheckCircle, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAppState } from "@/lib/app-context";
import { AnimatePresence, motion } from "framer-motion";

interface Notification {
  id: string;
  recipient_id: string;
  recipient_type: string;
  type: string;
  title: string;
  message: string;
  reference_id: string | null;
  reference_type: string | null;
  is_read: boolean;
  created_at: string;
}

const NOTIF_SOUND_BASE64 =
  "data:audio/wav;base64,UklGRl4FAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YToFAABkAIgAqADEANwA8AD/AAoBEAESARABCgEAAO4A1AC2AJQAbABAABIA4v+w/37/Tv8g//L+yP6g/n7+YP5I/jb+KP4g/h7+IP4o/jb+SP5g/n7+oP7I/vL+IP9O/37/sP/i/xIAQABsAJQAtgDUAO4AAAEKARABEgEQAQoBAADwANwAxACmAIgAZABAABwA+v/Y/7j/mP96/17/RP8s/xj/CP/6/vD+6P7k/uT+6P7w/vr+CP8Y/yz/RP9e/3r/mP+4/9j/+v8cAEAAZACIAKYAxADcAPAABgEWASIBLAEyATIBLgEmARoBCgH2AN4AwgCiAH4AWABOAEQAOAA=";

export function NotificationBell() {
  const { business } = useAppState();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const panelRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  useEffect(() => {
    try {
      audioRef.current = new Audio(NOTIF_SOUND_BASE64);
      audioRef.current.volume = 0.4;
    } catch {}
  }, []);

  useEffect(() => {
    if (!business?.id) return;
    const supabase = createClient();

    supabase
      .from("notification_preferences")
      .select("sound_enabled")
      .eq("user_id", business.owner_id)
      .single()
      .then(({ data }) => {
        if (data) setSoundEnabled(data.sound_enabled);
      });

    supabase
      .from("notifications")
      .select("*")
      .eq("recipient_id", business.id)
      .eq("recipient_type", "business")
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data }) => {
        if (data) setNotifications(data as Notification[]);
      });

    const channel = supabase
      .channel(`notif-biz-${business.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `recipient_id=eq.${business.id}`,
        },
        (payload) => {
          const notif = payload.new as Notification;
          if (notif.recipient_type === "business") {
            setNotifications((prev) => [notif, ...prev]);
            if (soundEnabled && audioRef.current) {
              audioRef.current.currentTime = 0;
              audioRef.current.play().catch(() => {});
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [business?.id, business?.owner_id, soundEnabled]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const markAsRead = useCallback(
    async (id: string) => {
      const supabase = createClient();
      await supabase.from("notifications").update({ is_read: true }).eq("id", id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    },
    []
  );

  const markAllRead = useCallback(async () => {
    if (!business?.id) return;
    const supabase = createClient();
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("recipient_id", business.id)
      .eq("recipient_type", "business")
      .eq("is_read", false);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  }, [business?.id]);

  const getIcon = (type: string) => {
    switch (type) {
      case "complaint":
        return <AlertTriangle className="w-4 h-4 text-[#F59E0B]" />;
      case "ticket_reply":
        return <MessageSquare className="w-4 h-4 text-[#3B82F6]" />;
      case "status_update":
        return <CheckCircle className="w-4 h-4 text-[#10B981]" />;
      default:
        return <Bell className="w-4 h-4 text-[#6B7280]" />;
    }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative w-9 h-9 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#9CA3AF] hover:text-[#7C3AED] hover:border-[#7C3AED]/30 hover:bg-[#7C3AED]/5 transition-all"
        title="Notifications"
      >
        <Bell className="w-[18px] h-[18px]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-[#EF4444] text-white text-[10px] font-bold flex items-center justify-center px-1 animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 w-[360px] max-h-[480px] bg-white rounded-2xl border border-[#E5E7EB] shadow-xl overflow-hidden z-50"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#F3F4F6]">
              <h3 className="text-[14px] font-semibold text-[#111]">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[11px] text-[#7C3AED] font-medium hover:underline"
                  >
                    Mark all read
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="text-[#9CA3AF] hover:text-[#6B7280]">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[420px]">
              {notifications.length === 0 ? (
                <div className="py-12 text-center">
                  <Bell className="w-8 h-8 text-[#D1D5DB] mx-auto mb-2" />
                  <p className="text-[13px] text-[#9CA3AF]">No notifications yet</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <button
                    key={notif.id}
                    onClick={() => markAsRead(notif.id)}
                    className={`w-full px-4 py-3 flex items-start gap-3 text-left border-b border-[#F9FAFB] hover:bg-[#F9FAFB] transition-colors ${
                      !notif.is_read ? "bg-[#7C3AED]/[0.03]" : ""
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#F9FAFB] flex items-center justify-center flex-shrink-0 mt-0.5">
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className={`text-[13px] font-medium truncate ${!notif.is_read ? "text-[#111]" : "text-[#6B7280]"}`}>
                          {notif.title}
                        </p>
                        {!notif.is_read && (
                          <span className="w-2 h-2 rounded-full bg-[#7C3AED] flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-[12px] text-[#9CA3AF] line-clamp-2">{notif.message}</p>
                      <p className="text-[10px] text-[#D1D5DB] mt-1">{timeAgo(notif.created_at)}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

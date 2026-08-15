"use client";

import { useState, useEffect, useCallback, useRef, use } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Star,
  MessageSquare,
  QrCode,
  Download,
  Printer,
  Copy,
  Check,
  ExternalLink,
  Settings2,
  Loader2,
  RefreshCw,
  Power,
  Trash2,
  Save,
  TrendingUp,
  FileText,
  Share2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
import { useAppState } from "@/lib/app-context";
import { getPlatformMeta, getIntegrationLabel } from "@/lib/platforms";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, subDays } from "date-fns";
import { toast } from "sonner";
import jsPDF from "jspdf";
import type { BusinessPlatform } from "@/types";

const toastStyle = { backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB", color: "#111" };

export default function PlatformDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { business, sessions } = useAppState();
  const [platform, setPlatform] = useState<BusinessPlatform | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editUrl, setEditUrl] = useState("");
  const [editRating, setEditRating] = useState("");
  const [editReviews, setEditReviews] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [scanData, setScanData] = useState<{ scan_date: string; scan_count: number }[]>([]);
  const [origin, setOrigin] = useState("");
  const [deleting, setDeleting] = useState(false);
  const qrCanvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setOrigin(window.location.origin); }, []);

  const loadPlatform = useCallback(async () => {
    try {
      const res = await fetch("/api/platforms");
      const data = await res.json();
      if (res.ok) {
        const found = (data.platforms || []).find((p: BusinessPlatform) => p.id === id);
        if (found) {
          setPlatform(found);
          setEditUrl(found.review_url || "");
          setEditRating(found.avg_rating != null ? String(found.avg_rating) : "");
          setEditReviews(String(found.total_reviews || 0));
        }
      }
    } catch {} finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadPlatform(); }, [loadPlatform]);

  // Generate scan chart data (last 30 days)
  useEffect(() => {
    if (!platform) return;

    if (platform.platform_key === "revugo") {
      const data: { scan_date: string; scan_count: number }[] = [];
      for (let i = 29; i >= 0; i--) {
        const d = subDays(new Date(), i);
        const dateStr = d.toISOString().split("T")[0];
        const count = sessions.filter(
          (s) => s.created_at.split("T")[0] === dateStr
        ).length;
        data.push({ scan_date: dateStr, scan_count: count });
      }
      setScanData(data);
    } else {
      const data: { scan_date: string; scan_count: number }[] = [];
      for (let i = 29; i >= 0; i--) {
        const d = subDays(new Date(), i);
        data.push({ scan_date: d.toISOString().split("T")[0], scan_count: 0 });
      }
      setScanData(data);
    }
  }, [platform, sessions]);

  const meta = platform ? getPlatformMeta(platform.platform_key) : null;
  const isRevugo = platform?.platform_key === "revugo";
  const qrUrl = platform ? `${origin}/go/${platform.qr_code_id}` : "";
  const revugoUrl = business ? `${origin}/r/${business.slug}` : "";

  const displayRating = isRevugo
    ? (sessions.length > 0 ? (sessions.reduce((s, r) => s + r.star_rating, 0) / sessions.length) : 0)
    : (platform?.avg_rating ?? 0);
  const displayReviews = isRevugo ? sessions.length : (platform?.total_reviews || 0);

  const ratingDistribution = isRevugo
    ? [5, 4, 3, 2, 1].map((star) => ({
        star,
        count: sessions.filter((s) => s.star_rating === star).length,
        pct: sessions.length > 0
          ? Math.round((sessions.filter((s) => s.star_rating === star).length / sessions.length) * 100)
          : 0,
      }))
    : [];

  const handleSave = async () => {
    if (!platform) return;
    setSaving(true);
    try {
      const body: Record<string, unknown> = {};
      if (editUrl !== platform.review_url) body.review_url = editUrl;
      if (!isRevugo) {
        const r = parseFloat(editRating);
        if (!isNaN(r)) body.avg_rating = r;
        const n = parseInt(editReviews);
        if (!isNaN(n)) body.total_reviews = n;
      }
      if (Object.keys(body).length === 0) { setSaving(false); return; }

      const res = await fetch(`/api/platforms/${platform.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        setPlatform(data.platform);
        toast.success("Platform updated", { style: toastStyle });
      } else {
        toast.error(data.error || "Update failed", { style: toastStyle });
      }
    } catch {
      toast.error("Network error", { style: toastStyle });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleConnection = async () => {
    if (!platform) return;
    const res = await fetch(`/api/platforms/${platform.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_connected: !platform.is_connected }),
    });
    const data = await res.json();
    if (res.ok) setPlatform(data.platform);
  };

  const handleToggleQR = async () => {
    if (!platform) return;
    const res = await fetch(`/api/platforms/${platform.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ qr_enabled: !platform.qr_enabled }),
    });
    const data = await res.json();
    if (res.ok) setPlatform(data.platform);
  };

  const handleRegenerateQR = async () => {
    if (!platform) return;
    const res = await fetch(`/api/platforms/${platform.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ regenerate_qr: true }),
    });
    const data = await res.json();
    if (res.ok) {
      setPlatform(data.platform);
      toast.success("QR code regenerated", { style: toastStyle });
    }
  };

  const handleDelete = async () => {
    if (!platform) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/platforms/${platform.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Platform removed", { style: toastStyle });
        router.push("/dashboard/platforms");
      } else {
        toast.error("Failed to remove", { style: toastStyle });
      }
    } catch {
      toast.error("Network error", { style: toastStyle });
    } finally {
      setDeleting(false);
    }
  };

  const handleCopyUrl = () => {
    const url = isRevugo ? revugoUrl : qrUrl;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => toast.info(url, { style: toastStyle }));
  };

  const getQrCanvas = (): HTMLCanvasElement | null =>
    qrCanvasRef.current?.querySelector("canvas") || null;

  const handleDownloadPNG = () => {
    const canvas = getQrCanvas();
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `${meta?.shortName || "platform"}-qr.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    toast.success("QR downloaded", { style: toastStyle });
  };

  const handleDownloadPDF = () => {
    const canvas = getQrCanvas();
    if (!canvas) return;
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: [100, 100] });
    pdf.addImage(imgData, "PNG", 10, 10, 80, 80);
    pdf.save(`${meta?.shortName || "platform"}-qr.pdf`);
    toast.success("PDF downloaded", { style: toastStyle });
  };

  const handlePrint = () => {
    const canvas = getQrCanvas();
    if (!canvas) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html><head><title>QR Code - ${meta?.shortName || "Platform"}</title>
      <style>body{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;margin:0;font-family:sans-serif}
      h2{margin-bottom:8px}p{color:#666;font-size:14px;margin-bottom:24px}</style></head>
      <body><h2>${meta?.name || platform?.display_name}</h2>
      <p>${business?.name || ""}</p>
      <img src="${canvas.toDataURL("image/png")}" width="300" height="300" />
      <script>setTimeout(()=>{window.print();window.close()},300)</script></body></html>
    `);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-[#7C3AED]" />
      </div>
    );
  }

  if (!platform || !business) {
    return (
      <div className="text-center py-20">
        <p className="text-[#6B7280]">Platform not found</p>
        <Link href="/dashboard/platforms" className="text-[#7C3AED] text-sm mt-2 inline-block">
          Back to platforms
        </Link>
      </div>
    );
  }

  const displayQrUrl = isRevugo ? revugoUrl : qrUrl;

  return (
    <div>
      {/* Hidden QR canvas for export */}
      <div ref={qrCanvasRef} className="absolute -left-[9999px] -top-[9999px]">
        <QRCodeCanvas value={displayQrUrl} size={600} level="H" bgColor="#FFFFFF" fgColor="#111827" />
      </div>

      {/* Back + Header */}
      <div className="mb-6">
        <Link
          href="/dashboard/platforms"
          className="inline-flex items-center gap-1.5 text-[12px] text-[#6B7280] hover:text-[#7C3AED] transition-colors mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> All Platforms
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-base"
              style={{ backgroundColor: meta?.color || "#6B7280" }}
            >
              {meta?.icon || platform.display_name.charAt(0)}
            </div>
            <div>
              <h1 className="text-[20px] font-bold text-[#111]">{meta?.name || platform.display_name}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                  style={{
                    backgroundColor: meta?.integrationLevel === "full" ? "#ECFDF5" : "#F3F4F6",
                    color: meta?.integrationLevel === "full" ? "#059669" : "#6B7280",
                  }}
                >
                  {getIntegrationLabel(meta?.integrationLevel || "qr_only")}
                </span>
                <span className={`inline-flex items-center gap-1 text-[10px] font-medium ${platform.is_connected ? "text-[#10B981]" : "text-[#EF4444]"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${platform.is_connected ? "bg-[#10B981]" : "bg-[#EF4444]"}`} />
                  {platform.is_connected ? "Connected" : "Disconnected"}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[#E5E7EB] text-[12px] text-[#6B7280] font-medium hover:bg-[#F3F4F6] transition-colors"
          >
            <Settings2 className="w-4 h-4" /> Settings
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          {
            label: `${meta?.shortName || "Platform"} Rating`,
            value: displayRating > 0 ? displayRating.toFixed(1) : "—",
            icon: Star,
            iconColor: "#F59E0B",
            sub: isRevugo ? `Based on ${sessions.length} sessions` : "Manually updated",
          },
          {
            label: "Total Reviews",
            value: displayReviews.toLocaleString(),
            icon: MessageSquare,
            iconColor: "#10B981",
            sub: isRevugo ? `${sessions.filter((s) => s.star_rating >= 4).length} positive` : "Across all time",
          },
          {
            label: "QR Scans",
            value: (platform.total_qr_scans || 0).toLocaleString(),
            icon: QrCode,
            iconColor: "#2563EB",
            sub: platform.qr_enabled ? "QR active" : "QR disabled",
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card rounded-2xl p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <p className="text-[10px] text-[#6B7280] uppercase tracking-[0.1em] font-medium">{stat.label}</p>
              <stat.icon className="w-4 h-4" style={{ color: stat.iconColor }} />
            </div>
            <p className="text-[28px] font-bold text-[#111] tracking-tight">{stat.value}</p>
            <p className="text-[10px] text-[#9CA3AF] mt-1">{stat.sub}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left: Chart + Rating distribution */}
        <div className="lg:col-span-3 space-y-6">
          {/* Activity chart */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass-card rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-[14px] font-semibold text-[#111]">
                  {isRevugo ? "Review Activity" : "QR Scan Activity"}
                </h2>
                <p className="text-[11px] text-[#6B7280] mt-0.5">Last 30 days</p>
              </div>
              <TrendingUp className="w-4 h-4 text-[#9CA3AF]" />
            </div>
            <div className="h-[220px]">
              {scanData.every((d) => d.scan_count === 0) ? (
                <div className="flex items-center justify-center h-full text-[13px] text-[#9CA3AF]">
                  No activity data yet
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={scanData}>
                    <defs>
                      <linearGradient id={`grad-${id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={meta?.color || "#7C3AED"} stopOpacity={0.15} />
                        <stop offset="100%" stopColor={meta?.color || "#7C3AED"} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                    <XAxis
                      dataKey="scan_date"
                      tick={{ fontSize: 10, fill: "#6B7280" }}
                      tickFormatter={(v) => format(new Date(v), "MMM d")}
                      axisLine={{ stroke: "#E5E7EB" }}
                      tickLine={false}
                      interval={6}
                    />
                    <YAxis tick={{ fontSize: 10, fill: "#6B7280" }} axisLine={false} tickLine={false} width={30} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#FFF",
                        border: "1px solid #E5E7EB",
                        borderRadius: "12px",
                        fontSize: "12px",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                      }}
                      labelFormatter={(v) => format(new Date(v as string), "MMM d, yyyy")}
                    />
                    <Area
                      type="monotone"
                      dataKey="scan_count"
                      stroke={meta?.color || "#7C3AED"}
                      strokeWidth={2}
                      fill={`url(#grad-${id})`}
                      dot={false}
                      activeDot={{ r: 5, fill: meta?.color || "#7C3AED", stroke: "#FFF", strokeWidth: 3 }}
                      name={isRevugo ? "Reviews" : "Scans"}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>

          {/* Rating distribution (RevuGo only) */}
          {isRevugo && sessions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card rounded-2xl p-6"
            >
              <h2 className="text-[14px] font-semibold text-[#111] mb-4">Rating Distribution</h2>
              <div className="space-y-3">
                {ratingDistribution.map((r) => (
                  <div key={r.star} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-12">
                      <span className="text-[12px] font-medium text-[#374151]">{r.star}</span>
                      <Star className="w-3 h-3 text-[#F59E0B] fill-[#F59E0B]" />
                    </div>
                    <div className="flex-1 h-2.5 rounded-full bg-[#F3F4F6] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${r.pct}%`,
                          backgroundColor: r.star >= 4 ? "#10B981" : r.star === 3 ? "#F59E0B" : "#EF4444",
                        }}
                      />
                    </div>
                    <span className="text-[11px] text-[#9CA3AF] w-10 text-right">{r.count}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Right: QR code */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass-card rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[14px] font-semibold text-[#111]">QR Code</h2>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                platform.qr_enabled ? "bg-[#ECFDF5] text-[#059669]" : "bg-[#FEF2F2] text-[#DC2626]"
              }`}>
                {platform.qr_enabled ? "Active" : "Disabled"}
              </span>
            </div>

            {/* QR Preview */}
            <div className="flex justify-center mb-4">
              <div
                className="rounded-2xl p-1"
                style={{ background: `linear-gradient(135deg, ${meta?.color || "#7C3AED"}, ${meta?.color || "#7C3AED"}88)` }}
              >
                <div className="bg-white rounded-[14px] p-4">
                  <QRCodeSVG
                    value={displayQrUrl}
                    size={180}
                    level="H"
                    bgColor="#FFFFFF"
                    fgColor="#111827"
                  />
                </div>
              </div>
            </div>

            {/* URL display */}
            <div className="mb-4">
              <label className="block text-[9px] text-[#9CA3AF] uppercase tracking-[0.15em] font-semibold mb-1.5">
                {isRevugo ? "Review Page URL" : "QR Redirect URL"}
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 px-3 py-2 rounded-lg bg-[#F9FAFB] border border-[#E5E7EB] text-[11px] text-[#374151] font-mono truncate">
                  {displayQrUrl}
                </div>
                <button
                  onClick={handleCopyUrl}
                  className="p-2 rounded-lg border border-[#E5E7EB] hover:bg-[#F3F4F6] transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5 text-[#6B7280]" />}
                </button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                onClick={handleDownloadPNG}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#7C3AED] text-white text-[12px] font-bold hover:bg-[#6D28D9] transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> PNG
              </button>
              <button
                onClick={handleDownloadPDF}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#2563EB] text-white text-[12px] font-bold hover:bg-[#1D4ED8] transition-colors"
              >
                <FileText className="w-3.5 h-3.5" /> PDF
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-[#E5E7EB] text-[#374151] text-[12px] font-bold hover:bg-[#F3F4F6] transition-colors"
              >
                <Printer className="w-3.5 h-3.5" /> Print
              </button>
              <button
                onClick={handleCopyUrl}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-[#E5E7EB] text-[#374151] text-[12px] font-bold hover:bg-[#F3F4F6] transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" /> Share
              </button>
            </div>

            {/* QR controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleQR}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-medium transition-colors ${
                  platform.qr_enabled
                    ? "bg-[#FEF2F2] text-[#DC2626] hover:bg-[#FEE2E2]"
                    : "bg-[#ECFDF5] text-[#059669] hover:bg-[#D1FAE5]"
                }`}
              >
                <Power className="w-3.5 h-3.5" />
                {platform.qr_enabled ? "Disable QR" : "Enable QR"}
              </button>
              <button
                onClick={handleRegenerateQR}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-[#E5E7EB] text-[11px] text-[#6B7280] font-medium hover:bg-[#F3F4F6] transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Regenerate
              </button>
            </div>
          </motion.div>

          {/* External URL (non-RevuGo) */}
          {!isRevugo && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card rounded-2xl p-6"
            >
              <h2 className="text-[14px] font-semibold text-[#111] mb-1">Platform Review URL</h2>
              <p className="text-[11px] text-[#9CA3AF] mb-4">Where the QR code redirects customers</p>
              <div className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-[#9CA3AF] flex-shrink-0" />
                <a
                  href={platform.review_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[12px] text-[#7C3AED] hover:underline truncate"
                >
                  {platform.review_url || "No URL set"}
                </a>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-6 mt-6"
        >
          <h2 className="text-[14px] font-semibold text-[#111] mb-4">Platform Settings</h2>

          <div className="space-y-4 max-w-lg">
            {!isRevugo && (
              <>
                <div>
                  <label className="block text-[11px] text-[#6B7280] uppercase tracking-[0.15em] font-semibold mb-1.5">
                    Review URL
                  </label>
                  <input
                    type="url"
                    value={editUrl}
                    onChange={(e) => setEditUrl(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-white text-sm text-[#111] focus:outline-none focus:border-[#7C3AED]/30"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] text-[#6B7280] uppercase tracking-[0.15em] font-semibold mb-1.5">
                      Average Rating
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      value={editRating}
                      onChange={(e) => setEditRating(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-white text-sm text-[#111] focus:outline-none focus:border-[#7C3AED]/30"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#6B7280] uppercase tracking-[0.15em] font-semibold mb-1.5">
                      Total Reviews
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={editReviews}
                      onChange={(e) => setEditReviews(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-white text-sm text-[#111] focus:outline-none focus:border-[#7C3AED]/30"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#7C3AED] text-white text-[13px] font-bold hover:bg-[#6D28D9] disabled:opacity-50 transition-colors"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
              <button
                onClick={handleToggleConnection}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[13px] font-medium transition-colors ${
                  platform.is_connected
                    ? "border-[#FECACA] text-[#DC2626] hover:bg-[#FEF2F2]"
                    : "border-[#A7F3D0] text-[#059669] hover:bg-[#ECFDF5]"
                }`}
              >
                <Power className="w-4 h-4" />
                {platform.is_connected ? "Disconnect" : "Reconnect"}
              </button>
              {!isRevugo && (
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#FECACA] text-[#DC2626] text-[13px] font-medium hover:bg-[#FEF2F2] disabled:opacity-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  {deleting ? "Removing..." : "Remove"}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

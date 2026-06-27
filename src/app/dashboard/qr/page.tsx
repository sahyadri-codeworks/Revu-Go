"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Download, Printer, Copy, Check, ChevronDown, FileText } from "lucide-react";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
import { useAppState } from "@/lib/app-context";
import { toast } from "sonner";
import jsPDF from "jspdf";

const toastStyle = { backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB", color: "#111" };

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function buildFlyerCanvas(
  qrCanvas: HTMLCanvasElement,
  businessName: string,
  logoUrl: string,
): Promise<HTMLCanvasElement> {
  const W = 1200;
  const H = 1900;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // Light gray background
  ctx.fillStyle = "#EDEEF0";
  ctx.fillRect(0, 0, W, H);

  // White card with shadow
  ctx.shadowColor = "rgba(0,0,0,0.12)";
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 8;
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.roundRect(60, 40, W - 120, H - 80, 28);
  ctx.fill();
  ctx.shadowColor = "transparent";

  let y = 120;
  const cx = W / 2;

  // === Business Logo Circle with dashed border ===
  const logoR = 65;
  ctx.save();
  ctx.strokeStyle = "#C8C8CC";
  ctx.lineWidth = 2.5;
  ctx.setLineDash([6, 5]);
  ctx.beginPath();
  ctx.arc(cx, y + logoR, logoR + 8, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  if (logoUrl && logoUrl.startsWith("http")) {
    try {
      const logoImg = await loadImage(logoUrl);
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, y + logoR, logoR, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(logoImg, cx - logoR, y, logoR * 2, logoR * 2);
      ctx.restore();
    } catch {
      drawInitial(ctx, cx, y + logoR, logoR, businessName);
    }
  } else {
    drawInitial(ctx, cx, y + logoR, logoR, businessName);
  }

  y += logoR * 2 + 50;

  // === Business Name ===
  ctx.fillStyle = "#1A1A2E";
  ctx.font = "bold 48px 'Inter', Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(businessName, cx, y);
  y += 48;

  // === "Thank you for choosing us!" with decorative lines ===
  ctx.fillStyle = "#9CA3AF";
  ctx.font = "24px 'Inter', Arial, sans-serif";
  const tyText = "Thank you for choosing us!";
  const tyW = ctx.measureText(tyText).width;
  const lineGap = 20;
  const lineLen = 80;
  ctx.fillText(tyText, cx, y);
  // Left line
  ctx.strokeStyle = "#D1D5DB";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx - tyW / 2 - lineGap - lineLen, y - 8);
  ctx.lineTo(cx - tyW / 2 - lineGap, y - 8);
  ctx.stroke();
  // Right line
  ctx.beginPath();
  ctx.moveTo(cx + tyW / 2 + lineGap, y - 8);
  ctx.lineTo(cx + tyW / 2 + lineGap + lineLen, y - 8);
  ctx.stroke();
  y += 60;

  // === RevuGo Logo ===
  try {
    const revuLogo = await loadImage("/logo-name.png");
    const rlH = 110;
    const rlW = (revuLogo.width / revuLogo.height) * rlH;
    ctx.drawImage(revuLogo, (W - rlW) / 2, y, rlW, rlH);
    y += rlH + 24;
  } catch {
    ctx.fillStyle = "#7C3AED";
    ctx.font = "bold 44px 'Inter', Arial, sans-serif";
    ctx.fillText("RevuGo", cx, y + 40);
    y += 80;
  }

  // === "Review us" gradient text ===
  const revGrad = ctx.createLinearGradient(cx - 200, y, cx + 200, y + 70);
  revGrad.addColorStop(0, "#7C3AED");
  revGrad.addColorStop(1, "#2563EB");
  ctx.fillStyle = revGrad;
  ctx.font = "bold 80px 'Inter', Arial, sans-serif";
  ctx.fillText("Review us", cx, y + 10);
  y += 60;

  // === "Your feedback helps us grow ❤️" ===
  ctx.fillStyle = "#6B7280";
  ctx.font = "26px 'Inter', Arial, sans-serif";
  ctx.fillText("Your feedback helps us grow  ❤️", cx, y);
  y += 60;

  // === QR Code Box with gradient border ===
  const qrSize = 480;
  const qrPad = 28;
  const boxSize = qrSize + qrPad * 2;
  const boxX = (W - boxSize) / 2;
  const boxY = y;

  // Gradient border
  const borderW = 5;
  const bGrad = ctx.createLinearGradient(boxX, boxY, boxX + boxSize, boxY + boxSize);
  bGrad.addColorStop(0, "#7C3AED");
  bGrad.addColorStop(0.5, "#6366F1");
  bGrad.addColorStop(1, "#2563EB");
  ctx.strokeStyle = bGrad;
  ctx.lineWidth = borderW;
  ctx.beginPath();
  ctx.roundRect(boxX, boxY, boxSize, boxSize, 22);
  ctx.stroke();

  // White interior
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.roundRect(boxX + borderW, boxY + borderW, boxSize - borderW * 2, boxSize - borderW * 2, 18);
  ctx.fill();

  // QR image
  ctx.drawImage(qrCanvas, boxX + qrPad, boxY + qrPad, qrSize, qrSize);

  // RevuGo icon in center
  try {
    const icon = await loadImage("/logo.png");
    const iSize = 80;
    const icx = cx;
    const icy = boxY + boxSize / 2;
    ctx.beginPath();
    ctx.arc(icx, icy, iSize / 2 + 10, 0, Math.PI * 2);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();
    ctx.drawImage(icon, icx - iSize / 2, icy - iSize / 2, iSize, iSize);
  } catch {}

  y = boxY + boxSize + 45;

  // === "It's simple & quick" with purple side lines ===
  ctx.fillStyle = "#7C3AED";
  ctx.font = "bold 24px 'Inter', Arial, sans-serif";
  const sqText = "It's simple & quick";
  const sqW = ctx.measureText(sqText).width;
  ctx.fillText(sqText, cx, y);
  ctx.strokeStyle = "#C4B5FD";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx - sqW / 2 - 20 - 100, y - 8);
  ctx.lineTo(cx - sqW / 2 - 20, y - 8);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + sqW / 2 + 20, y - 8);
  ctx.lineTo(cx + sqW / 2 + 20 + 100, y - 8);
  ctx.stroke();
  y += 55;

  // === 3 Steps ===
  const stepData = [
    { icon: "📱", title: "1. Scan QR", l1: "Scan this QR code", l2: "with your phone" },
    { icon: "📋", title: "2. Answer", l1: "Answer a few simple", l2: "questions" },
    { icon: "✨", title: "3. Generate", l1: "Generate your review", l2: "in 2 clicks" },
  ];
  const stepW = 300;
  const stepStartX = (W - stepW * 3) / 2;

  for (let i = 0; i < 3; i++) {
    const scx = stepStartX + stepW * i + stepW / 2;

    // Circle bg
    ctx.beginPath();
    ctx.arc(scx, y + 6, 40, 0, Math.PI * 2);
    ctx.fillStyle = "#F0ECFF";
    ctx.fill();
    ctx.strokeStyle = "#E0DAFF";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Icon
    ctx.font = "28px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(stepData[i].icon, scx, y + 8);
    ctx.textBaseline = "alphabetic";

    // Arrow
    if (i < 2) {
      ctx.fillStyle = "#C4B5FD";
      ctx.font = "30px Arial";
      ctx.fillText("→", scx + stepW / 2, y + 10);
    }

    // Title
    ctx.fillStyle = "#1A1A2E";
    ctx.font = "bold 24px 'Inter', Arial, sans-serif";
    ctx.fillText(stepData[i].title, scx, y + 76);

    // Description
    ctx.fillStyle = "#9CA3AF";
    ctx.font = "20px 'Inter', Arial, sans-serif";
    ctx.fillText(stepData[i].l1, scx, y + 106);
    ctx.fillText(stepData[i].l2, scx, y + 130);
  }

  y += 170;

  // === Bottom blue diagonal wave + bar ===
  const barH = 160;
  const barY = H - 80 - barH;

  // Blue wave shape (diagonal top edge)
  ctx.fillStyle = "#2563EB";
  ctx.beginPath();
  ctx.moveTo(60, barY + 60);
  ctx.lineTo(W - 60, barY);
  ctx.lineTo(W - 60, H - 80);
  ctx.quadraticCurveTo(W - 60, H - 52, W - 88, H - 52);
  ctx.lineTo(88, H - 52);
  ctx.quadraticCurveTo(60, H - 52, 60, H - 80);
  ctx.closePath();
  ctx.fill();

  // Gift icon circle
  const giftCx = 170;
  const giftCy = barY + barH / 2 + 20;
  ctx.beginPath();
  ctx.arc(giftCx, giftCy, 44, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.15)";
  ctx.fill();
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "38px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("🎁", giftCx, giftCy);
  ctx.textBaseline = "alphabetic";

  // "Thank you!" text
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 32px 'Inter', Arial, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("Thank you!", 240, giftCy - 16);
  ctx.font = "22px 'Inter', Arial, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.fillText("You may receive a special reward", 240, giftCy + 16);
  ctx.fillText("for your feedback.", 240, giftCy + 44);

  // Decorative stars (right side)
  ctx.fillStyle = "rgba(255,255,255,0.25)";
  ctx.textAlign = "center";
  ctx.font = "36px Arial";
  ctx.fillText("✦", W - 160, barY + 50);
  ctx.font = "24px Arial";
  ctx.fillText("✦", W - 110, barY + 100);
  ctx.font = "18px Arial";
  ctx.fillText("✦", W - 170, barY + 110);

  return canvas;
}

function drawInitial(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, name: string) {
  const grad = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
  grad.addColorStop(0, "#7C3AED");
  grad.addColorStop(1, "#2563EB");
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.fillStyle = "#FFFFFF";
  ctx.font = `bold ${r * 0.9}px 'Inter', Arial, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(name.charAt(0).toUpperCase(), cx, cy);
  ctx.textBaseline = "alphabetic";
}

export default function QRPage() {
  const { business, campaigns } = useAppState();
  const [selectedCampaignId, setSelectedCampaignId] = useState(campaigns[0]?.id || "");
  const [copied, setCopied] = useState(false);

  if (!business) return null;
  const [downloading, setDownloading] = useState(false);
  const flyerRef = useRef<HTMLDivElement>(null);
  const qrCanvasRef = useRef<HTMLDivElement>(null);

  const [origin, setOrigin] = useState("");
  useEffect(() => { setOrigin(window.location.origin); }, []);

  const selectedCampaign = campaigns.find((c) => c.id === selectedCampaignId) || campaigns[0];
  const pwaUrl = `${origin}/r/${business.slug}`;

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(pwaUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => { toast.info(pwaUrl, { style: toastStyle }); });
  }, [pwaUrl]);

  const getQrCanvas = (): HTMLCanvasElement | null => qrCanvasRef.current?.querySelector("canvas") || null;

  const handleDownloadPDF = async () => {
    const qrCanvas = getQrCanvas();
    if (!qrCanvas) { toast.error("QR code not ready", { style: toastStyle }); return; }
    setDownloading(true);
    try {
      const flyerCanvas = await buildFlyerCanvas(qrCanvas, business.name, business.logo_url || "");
      const imgData = flyerCanvas.toDataURL("image/png");
      const pdfW = 210;
      const pdfH = (flyerCanvas.height / flyerCanvas.width) * pdfW;
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: [pdfW, pdfH] });
      pdf.addImage(imgData, "PNG", 0, 0, pdfW, pdfH);
      pdf.save(`${business.slug}-qr-flyer.pdf`);
      toast.success("PDF downloaded!", { style: toastStyle });
    } catch (err) { console.error(err); toast.error("Failed to generate PDF", { style: toastStyle }); }
    finally { setDownloading(false); }
  };

  const handleDownloadPNG = async () => {
    const qrCanvas = getQrCanvas();
    if (!qrCanvas) { toast.error("QR code not ready", { style: toastStyle }); return; }
    setDownloading(true);
    try {
      const flyerCanvas = await buildFlyerCanvas(qrCanvas, business.name, business.logo_url || "");
      const link = document.createElement("a");
      link.download = `${business.slug}-qr-flyer.png`;
      link.href = flyerCanvas.toDataURL("image/png");
      link.click();
      toast.success("PNG downloaded!", { style: toastStyle });
    } catch (err) { console.error(err); toast.error("Failed to generate PNG", { style: toastStyle }); }
    finally { setDownloading(false); }
  };

  if (campaigns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-12 text-center max-w-md">
          <p className="text-[#6B7280] text-sm">No campaigns available — create a campaign first to generate QR flyers</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Hidden QR canvas for export */}
      <div ref={qrCanvasRef} className="absolute -left-[9999px] -top-[9999px]">
        <QRCodeCanvas value={pwaUrl} size={480} level="H" bgColor="#FFFFFF" fgColor="#111827" />
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <span className="inline-flex px-4 py-1.5 rounded-full bg-[#7C3AED]/10 border border-[#7C3AED]/20 text-[11px] text-[#7C3AED] uppercase tracking-[0.15em] font-bold mb-4">
          Print Ready Design
        </span>
        <h2 className="text-2xl font-bold text-[#111] mb-2">QR Code Flyer</h2>
        <p className="text-[13px] text-[#6B7280] leading-relaxed">
          Branded flyer with your business info, QR code, and RevuGo branding.
        </p>
      </div>

      {/* Campaign selector */}
      {campaigns.length > 1 && (
        <div className="mb-6">
          <label className="block text-[9px] text-[#6B7280] uppercase tracking-[0.2em] font-semibold mb-2">Select Campaign</label>
          <div className="relative">
            <select value={selectedCampaignId} onChange={(e) => setSelectedCampaignId(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-[#F9FAFB] border border-[#E5E7EB] text-[#111] text-sm focus:outline-none focus:border-[#7C3AED]/30 appearance-none cursor-pointer">
              {campaigns.map((c) => (
                <option key={c.id} value={c.id} style={{ background: "#fff", color: "#111" }}>
                  {c.title} {!c.is_active ? "(Inactive)" : ""}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
          </div>
        </div>
      )}

      {/* ====== FLYER PREVIEW — exact match to reference ====== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#EDEEF0] rounded-2xl p-5 sm:p-8 mb-6"
      >
        <div ref={flyerRef} className="mx-auto max-w-[420px] bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* White content area */}
          <div className="px-8 pt-8 pb-5 flex flex-col items-center">
            {/* Business Logo */}
            <div className="w-[88px] h-[88px] rounded-full border-[2.5px] border-dashed border-[#C8C8CC] flex items-center justify-center mb-5 overflow-hidden">
              {business.logo_url && business.logo_url.startsWith("http") ? (
                <img src={business.logo_url} alt={business.name} className="w-full h-full object-cover rounded-full" />
              ) : (
                <div className="w-full h-full rounded-full bg-gradient-to-br from-[#7C3AED] to-[#2563EB] flex items-center justify-center">
                  <span className="text-white font-bold text-3xl">{business.name.charAt(0)}</span>
                </div>
              )}
            </div>

            {/* Business Name */}
            <h3 className="text-[22px] font-bold text-[#1A1A2E] mb-1 text-center">{business.name}</h3>

            {/* Thank you line with side decorations */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-px bg-[#D1D5DB]" />
              <p className="text-[12px] text-[#9CA3AF] whitespace-nowrap">Thank you for choosing us!</p>
              <div className="w-12 h-px bg-[#D1D5DB]" />
            </div>

            {/* RevuGo logo */}
            <img src="/logo-name.png" alt="RevuGo" className="h-14 object-contain mix-blend-multiply mb-3" />

            {/* "Review us" */}
            <h4 className="text-[36px] font-extrabold bg-gradient-to-r from-[#7C3AED] to-[#2563EB] bg-clip-text text-transparent leading-tight mb-1">
              Review us
            </h4>

            {/* Subtitle */}
            <p className="text-[13px] text-[#6B7280] mb-5">Your feedback helps us grow <span className="text-[#7C3AED]">❤️</span></p>

            {/* QR Code with gradient border */}
            <div className="relative mb-5 rounded-2xl" style={{ background: "linear-gradient(135deg, #7C3AED, #6366F1, #2563EB)", padding: "5px" }}>
              <div className="bg-white rounded-[14px] p-4">
                <QRCodeSVG value={pwaUrl} size={220} level="H" bgColor="#FFFFFF" fgColor="#111827" className="qr-code-svg" />
              </div>
              {/* Center RevuGo icon */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-14 h-14 rounded-lg bg-white shadow-md flex items-center justify-center">
                  <img src="/logo.png" alt="R" className="w-11 h-11 object-contain" />
                </div>
              </div>
            </div>

            {/* "It's simple & quick" with purple side lines */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-16 h-px bg-[#C4B5FD]" />
              <p className="text-[12px] text-[#7C3AED] font-bold whitespace-nowrap">It&apos;s simple &amp; quick</p>
              <div className="w-16 h-px bg-[#C4B5FD]" />
            </div>

            {/* 3 Steps */}
            <div className="flex items-start w-full mb-5">
              {/* Step 1 */}
              <div className="flex-1 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-[#F0ECFF] border-[1.5px] border-[#E0DAFF] flex items-center justify-center mb-2">
                  <svg className="w-5 h-5 text-[#7C3AED]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="6" height="6" rx="1" /><rect x="16" y="2" width="6" height="6" rx="1" /><rect x="2" y="16" width="6" height="6" rx="1" /><rect x="16" y="16" width="4" height="4" rx="0.5" /><path d="M12 2v4m0 4v4m0 4v4M2 12h4m4 0h4m4 0h4" />
                  </svg>
                </div>
                <p className="text-[11px] font-bold text-[#1A1A2E] mb-0.5">1. Scan QR</p>
                <p className="text-[9px] text-[#9CA3AF] leading-tight">Scan this QR code<br/>with your phone</p>
              </div>

              {/* Arrow */}
              <div className="flex items-center pt-4">
                <svg className="w-5 h-5 text-[#C4B5FD]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M5 12h14m-4-4l4 4-4 4"/></svg>
              </div>

              {/* Step 2 */}
              <div className="flex-1 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-[#F0ECFF] border-[1.5px] border-[#E0DAFF] flex items-center justify-center mb-2">
                  <svg className="w-5 h-5 text-[#7C3AED]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="5" y="2" width="14" height="20" rx="2" /><path d="M9 12l2 2 4-4" /><path d="M9 2v2m6-2v2" />
                  </svg>
                </div>
                <p className="text-[11px] font-bold text-[#1A1A2E] mb-0.5">2. Answer</p>
                <p className="text-[9px] text-[#9CA3AF] leading-tight">Answer a few simple<br/>questions</p>
              </div>

              {/* Arrow */}
              <div className="flex items-center pt-4">
                <svg className="w-5 h-5 text-[#C4B5FD]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M5 12h14m-4-4l4 4-4 4"/></svg>
              </div>

              {/* Step 3 */}
              <div className="flex-1 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-[#F0ECFF] border-[1.5px] border-[#E0DAFF] flex items-center justify-center mb-2">
                  <svg className="w-5 h-5 text-[#7C3AED]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5z" /><path d="M18 14l1 3 3 1-3 1-1 3-1-3-3-1 3-1z" />
                  </svg>
                </div>
                <p className="text-[11px] font-bold text-[#1A1A2E] mb-0.5">3. Generate</p>
                <p className="text-[9px] text-[#9CA3AF] leading-tight">Generate your review<br/>in 2 clicks</p>
              </div>
            </div>
          </div>

          {/* Bottom blue diagonal bar */}
          <div className="relative" style={{ marginTop: "-1px" }}>
            <svg viewBox="0 0 420 130" className="w-full block" preserveAspectRatio="none">
              <path d="M0,45 L420,0 L420,130 Q420,130 420,130 L0,130 Z" fill="#2563EB" />
            </svg>
            <div className="absolute inset-0 flex items-center px-6 pt-5">
              {/* Gift icon */}
              <div className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0 mr-4">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path d="M20 12v10H4V12M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 110-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 100-5C13 2 12 7 12 7z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] text-white font-bold leading-tight">Thank you!</p>
                <p className="text-[10px] text-white/80 leading-snug mt-0.5">You may receive a special reward<br/>for your feedback.</p>
              </div>
              {/* Decorative 4-pointed stars */}
              <div className="flex flex-col items-end flex-shrink-0 mr-1">
                <svg className="w-6 h-6 text-white/25" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2 8 8 2-8 2-2 8-2-8-8-2 8-2z"/></svg>
                <svg className="w-4 h-4 text-white/20 -mt-0.5 mr-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2 8 8 2-8 2-2 8-2-8-8-2 8-2z"/></svg>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* PWA Target URL */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-white border border-[#E5E7EB] rounded-xl p-5 mb-6">
        <label className="block text-[9px] text-[#7C3AED] uppercase tracking-[0.2em] font-bold mb-3">Review Page URL</label>
        <div className="flex items-center gap-3">
          <div className="flex-1 px-4 py-3 rounded-lg bg-[#F9FAFB] border border-[#E5E7EB] text-[#374151] text-sm font-mono truncate">{pwaUrl}</div>
          <button onClick={handleCopy}
            className="flex items-center gap-2 px-5 py-3 rounded-lg border border-[#E5E7EB] text-[12px] text-[#6B7280] font-semibold hover:text-[#111] hover:border-[#D1D5DB] transition-colors">
            {copied ? <><Check className="w-4 h-4 text-[#10B981]" /><span className="text-[#10B981]">Copied</span></> : <><Copy className="w-4 h-4" />Copy</>}
          </button>
        </div>
      </motion.div>

      {/* Action buttons */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="grid grid-cols-3 gap-3">
        <button onClick={handleDownloadPDF} disabled={downloading}
          className="flex items-center justify-center gap-2 px-4 py-4 rounded-xl bg-[#7C3AED] text-white text-[13px] font-bold hover:bg-[#6D28D9] disabled:opacity-50 transition-colors">
          <FileText className="w-5 h-5" />{downloading ? "..." : "PDF"}
        </button>
        <button onClick={handleDownloadPNG} disabled={downloading}
          className="flex items-center justify-center gap-2 px-4 py-4 rounded-xl bg-[#2563EB] text-white text-[13px] font-bold hover:bg-[#1D4ED8] disabled:opacity-50 transition-colors">
          <Download className="w-5 h-5" />PNG
        </button>
        <button onClick={() => window.print()}
          className="flex items-center justify-center gap-2 px-4 py-4 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-[#374151] text-[13px] font-bold hover:bg-[#E5E7EB] transition-colors">
          <Printer className="w-5 h-5" />Print
        </button>
      </motion.div>
    </div>
  );
}

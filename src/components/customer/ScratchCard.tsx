"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Sparkles, Trophy } from "lucide-react";

interface ScratchCardProps {
  couponCode: string;
  rewardText: string;
  businessName: string;
  logoUrl: string;
  sessionToken: string;
  onRevealed: () => void;
}

export function ScratchCard({ couponCode, rewardText, businessName, logoUrl, onRevealed }: ScratchCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isScratching, setIsScratching] = useState(false);
  const [scratchPercent, setScratchPercent] = useState(0);

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);

    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;

    // Rich golden gradient base
    const gradient = ctx.createLinearGradient(0, 0, w, h);
    gradient.addColorStop(0, "#C9952C");
    gradient.addColorStop(0.3, "#D4AF37");
    gradient.addColorStop(0.5, "#E8C84A");
    gradient.addColorStop(0.7, "#D4AF37");
    gradient.addColorStop(1, "#B8942B");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // Metallic shimmer streaks
    ctx.globalAlpha = 0.08;
    for (let i = 0; i < 12; i++) {
      const sx = Math.random() * w;
      const sy = Math.random() * h;
      const streak = ctx.createLinearGradient(sx, sy, sx + 80, sy + 60);
      streak.addColorStop(0, "transparent");
      streak.addColorStop(0.5, "#FFFFFF");
      streak.addColorStop(1, "transparent");
      ctx.fillStyle = streak;
      ctx.fillRect(sx - 40, sy - 2, 80, 4);
    }
    ctx.globalAlpha = 1;

    // Decorative circles (bokeh effect)
    ctx.globalAlpha = 0.06;
    ctx.fillStyle = "#FFFFFF";
    const circles = [
      { x: w * 0.15, y: h * 0.2, r: 35 },
      { x: w * 0.8, y: h * 0.15, r: 25 },
      { x: w * 0.7, y: h * 0.7, r: 40 },
      { x: w * 0.25, y: h * 0.75, r: 20 },
      { x: w * 0.5, y: h * 0.4, r: 30 },
    ];
    circles.forEach(({ x, y, r }) => {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Star/sparkle pattern
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = "#FFF8DC";
    const drawStar = (cx: number, cy: number, size: number) => {
      ctx.beginPath();
      for (let j = 0; j < 4; j++) {
        const angle = (j * Math.PI) / 2;
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(angle) * size, cy + Math.sin(angle) * size);
      }
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "#FFF8DC";
      ctx.stroke();
    };
    drawStar(w * 0.2, h * 0.3, 8);
    drawStar(w * 0.75, h * 0.25, 6);
    drawStar(w * 0.85, h * 0.65, 10);
    drawStar(w * 0.15, h * 0.7, 7);
    drawStar(w * 0.55, h * 0.15, 5);
    ctx.globalAlpha = 1;

    // Center gift icon
    ctx.font = "48px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(0,0,0,0.2)";
    ctx.shadowBlur = 8;
    ctx.fillText("🎁", w / 2, h / 2 - 10);
    ctx.shadowBlur = 0;

    // "Scratch here!" text with glow
    ctx.font = "bold 12px Inter, system-ui, sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.shadowColor = "rgba(0,0,0,0.3)";
    ctx.shadowBlur = 4;
    ctx.fillText("Scratch here!", w / 2, h / 2 + 28);
    ctx.shadowBlur = 0;

    // Subtle border inner glow
    ctx.globalAlpha = 0.12;
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(4, 4, w - 8, h - 8, 12);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }, []);

  useEffect(() => {
    initCanvas();
  }, [initCanvas]);

  const scratch = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas || isRevealed) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.globalCompositeOperation = "destination-out";

    // Main scratch circle
    ctx.beginPath();
    ctx.arc(x * 2, y * 2, 52, 0, Math.PI * 2);
    ctx.fill();

    // Smaller scatter circles for rough scratch edge
    for (let i = 0; i < 5; i++) {
      const ox = (Math.random() - 0.5) * 40;
      const oy = (Math.random() - 0.5) * 40;
      ctx.beginPath();
      ctx.arc(x * 2 + ox, y * 2 + oy, 12 + Math.random() * 10, 0, Math.PI * 2);
      ctx.fill();
    }

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let transparent = 0;
    const step = 16;
    let total = 0;
    for (let i = 3; i < imageData.data.length; i += 4 * step) {
      if (imageData.data[i] === 0) transparent++;
      total++;
    }
    const percent = transparent / total;
    setScratchPercent(Math.round(percent * 100));

    if (percent > 0.4 && !isRevealed) {
      setIsRevealed(true);
      onRevealed();
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isScratching) return;
    scratch(e.clientX, e.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    scratch(touch.clientX, touch.clientY);
  };

  const businessInitials = businessName.substring(0, 2).toUpperCase();

  return (
    <div className="flex flex-col items-center px-6 pt-6 pb-5 flex-1">
      {/* Confetti burst */}
      <AnimatePresence>
        {isRevealed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 pointer-events-none overflow-hidden z-20"
          >
            {[...Array(40)].map((_, i) => {
              const colors = ["#D4AF37", "#FBBF24", "#22C55E", "#4ADE80", "#FDE68A", "#15803D", "#F59E0B", "#A3E635", "#FCD34D", "#34D399"];
              const size = 4 + Math.random() * 8;
              const isCircle = Math.random() > 0.5;
              return (
                <motion.div
                  key={i}
                  initial={{ y: -30, x: Math.random() * 400, opacity: 1, rotate: 0, scale: 1 }}
                  animate={{
                    y: 800,
                    opacity: 0,
                    rotate: 720 * (Math.random() > 0.5 ? 1 : -1),
                    scale: 0.2,
                  }}
                  transition={{ duration: 2 + Math.random() * 2, delay: i * 0.025, ease: "easeOut" }}
                  className="absolute"
                  style={{ left: `${(i * 2.5) % 100}%` }}
                >
                  <div
                    style={{
                      width: `${size}px`,
                      height: `${size}px`,
                      backgroundColor: colors[i % colors.length],
                      borderRadius: isCircle ? "50%" : "2px",
                    }}
                  />
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header icon */}
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
        className="relative mb-4"
      >
        {isRevealed ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 250, damping: 12 }}
            className="w-[68px] h-[68px] rounded-2xl bg-gradient-to-br from-[#166534] to-[#15803D] flex items-center justify-center shadow-lg shadow-[#166534]/25"
          >
            <Trophy className="w-8 h-8 text-white" />
          </motion.div>
        ) : (
          <div className="w-[68px] h-[68px] rounded-2xl bg-gradient-to-br from-[#D4AF37]/15 to-[#C5A044]/10 flex items-center justify-center border border-[#D4AF37]/10">
            <Gift className="w-8 h-8 text-[#D4AF37]" />
          </div>
        )}
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute -top-1.5 -right-1.5"
        >
          <Sparkles className="w-5 h-5 text-[#D4AF37]" />
        </motion.div>
      </motion.div>

      <h2 className="text-[22px] font-extrabold text-[#1A1A2E] mb-1">
        {isRevealed ? "Congratulations! 🎉" : "Scratch & Win"}
      </h2>
      <p className="text-[13px] text-[#8B9A7E] text-center mb-6">
        {isRevealed
          ? "You've unlocked a reward"
          : "Swipe over the card to reveal your reward"}
      </p>

      {/* Ticket-shaped card */}
      <motion.div
        className="w-full max-w-[300px] mx-auto relative"
        animate={isRevealed ? { scale: [1, 1.03, 1] } : {}}
        transition={{ duration: 0.5 }}
      >
        {/* Notch cutouts on sides */}
        <div className="absolute left-[-10px] top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gradient-to-b from-[#F7F3EB] to-[#FDFAF4] z-20" />
        <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gradient-to-b from-[#F7F3EB] to-[#FDFAF4] z-20" />

        <div
          className="relative w-full rounded-2xl overflow-hidden transition-shadow duration-500"
          style={{
            boxShadow: isRevealed
              ? "0 16px 48px rgba(212, 175, 55, 0.3), 0 0 0 2px rgba(212,175,55,0.15), 0 4px 12px rgba(0,0,0,0.08)"
              : "0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          {/* Top half — scratch area */}
          <div className="relative" style={{ aspectRatio: "1.5/1" }}>
            {/* Revealed reward content */}
            <div className={`absolute inset-0 flex flex-col items-center justify-center p-5 transition-all duration-500 ${
              isRevealed
                ? "bg-gradient-to-br from-[#FDFCF7] via-white to-[#F0FDF4]"
                : "bg-gradient-to-br from-[#FEF9EF] via-[#FFF8E7] to-[#FFFDF5]"
            }`}>
              {isRevealed ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="flex flex-col items-center"
                >
                  {logoUrl && logoUrl.startsWith("http") ? (
                    <motion.img
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.1 }}
                      src={logoUrl} alt={businessName}
                      className="w-14 h-14 rounded-full object-cover border-2 border-[#D4AF37]/30 shadow-md mb-3"
                    />
                  ) : (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.1 }}
                      className="w-14 h-14 rounded-full bg-gradient-to-br from-[#166534] to-[#15803D] flex items-center justify-center mb-3 shadow-md"
                    >
                      <span className="text-[13px] font-extrabold text-white uppercase tracking-wider">
                        {businessInitials}
                      </span>
                    </motion.div>
                  )}
                  <motion.p
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-[14px] font-bold text-[#8B9A7E] text-center mb-1"
                  >
                    You won
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-[18px] font-extrabold text-[#166534] text-center leading-snug"
                  >
                    {rewardText}
                  </motion.p>
                </motion.div>
              ) : (
                <>
                  {/* Decorative patterns visible while scratching */}
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-3 left-4 text-[28px] opacity-[0.07]">🎊</div>
                    <div className="absolute top-5 right-5 text-[22px] opacity-[0.07]">⭐</div>
                    <div className="absolute bottom-4 left-6 text-[20px] opacity-[0.07]">✨</div>
                    <div className="absolute bottom-3 right-4 text-[26px] opacity-[0.07]">🎁</div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <div className="w-24 h-24 rounded-full border-[3px] border-dashed border-[#D4AF37]/10" />
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <div className="w-16 h-16 rounded-full border-2 border-dotted border-[#166534]/8" />
                    </div>
                  </div>
                  <div className="relative z-[1] flex flex-col items-center">
                    <div className="text-[36px] mb-1 opacity-20">🎉</div>
                    <p className="text-[13px] font-bold text-[#D4AF37]/30 uppercase tracking-[0.2em]">Mystery Reward</p>
                  </div>
                </>
              )}
            </div>

            {/* Canvas scratch overlay */}
            {!isRevealed && (
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full cursor-pointer touch-none z-10"
                onMouseDown={() => setIsScratching(true)}
                onMouseUp={() => setIsScratching(false)}
                onMouseLeave={() => setIsScratching(false)}
                onMouseMove={handleMouseMove}
                onTouchStart={() => setIsScratching(true)}
                onTouchEnd={() => setIsScratching(false)}
                onTouchMove={handleTouchMove}
              />
            )}
          </div>

          {/* Dashed separator line */}
          <div className="relative bg-white px-5">
            <div className="border-t-2 border-dashed border-[#E8E2D6]" />
          </div>

          {/* Bottom half */}
          <div className="bg-white px-5 py-4">
            {isRevealed ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-dashed border-[#22C55E]/30 bg-[#F0FDF4]">
                    <span className="text-[15px] font-mono font-bold text-[#166534] tracking-wide">{couponCode}</span>
                  </div>
                </div>
                <button
                  onClick={() => navigator.clipboard.writeText(couponCode)}
                  className="w-9 h-9 rounded-lg bg-[#F3F4F6] hover:bg-[#E5E7EB] flex items-center justify-center transition-colors active:scale-95"
                >
                  <svg className="w-4 h-4 text-[#6B7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                </button>
              </motion.div>
            ) : (
              <div className="flex items-center gap-3">
                {logoUrl && logoUrl.startsWith("http") ? (
                  <img src={logoUrl} alt={businessName} className="w-10 h-10 rounded-full object-cover border border-[#E8E2D6] flex-shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#166534] to-[#15803D] flex items-center justify-center flex-shrink-0">
                    <span className="text-[11px] font-bold text-white uppercase tracking-wider">
                      {businessInitials}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-bold text-[#1A1A2E] truncate">{businessName}</p>
                  <p className="text-[11px] text-[#C4BBA8] font-medium">Scratch to reveal your reward</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Scratch progress hint */}
      <div className="mt-5">
        {!isRevealed ? (
          <div className="flex flex-col items-center gap-2">
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="flex items-center gap-2"
            >
              <span className="text-[22px]">👆</span>
              <span className="text-[13px] text-[#8B9A7E] font-medium">
                {scratchPercent > 10 ? `${scratchPercent}% scratched — keep going!` : "Use your finger to scratch"}
              </span>
            </motion.div>
            {scratchPercent > 0 && (
              <div className="w-40 h-1.5 bg-[#E8E2D6] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#D4AF37] to-[#22C55E] rounded-full"
                  style={{ width: `${Math.min(scratchPercent * 2.5, 100)}%` }}
                  transition={{ duration: 0.2 }}
                />
              </div>
            )}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-5 h-5 rounded-full bg-[#166534] flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-[13px] text-[#166534] font-semibold">
              Your coupon has been saved
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

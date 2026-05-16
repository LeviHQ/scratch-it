import { useEffect, useRef, useState, useCallback } from "react";

type Props = {
  width: number;
  height: number;
  scratchColor: string;
  scratchLabel?: string;
  onRevealed?: () => void;
  onProgress?: (progress: number) => void;
  threshold?: number; // 0..1 fraction needed before auto-clear
  children: React.ReactNode; // the hidden content
};

export function ScratchCard({
  width,
  height,
  scratchColor,
  scratchLabel = "Scratch here ✨",
  onRevealed,
  onProgress,
  threshold = 0.55,
  children,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);
  const lastRef = useRef<{ x: number; y: number } | null>(null);
  const [revealed, setRevealed] = useState(false);

  const drawScratchLayer = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);

    // Glossy gradient scratch coating
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, scratchColor);
    grad.addColorStop(0.5, shade(scratchColor, 14));
    grad.addColorStop(1, shade(scratchColor, -8));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Subtle noise texture
    ctx.globalAlpha = 0.08;
    for (let i = 0; i < 200; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? "#ffffff" : "#000000";
      ctx.fillRect(Math.random() * width, Math.random() * height, 2, 2);
    }
    ctx.globalAlpha = 1;

    // Label
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.font = "600 17px 'DM Sans', system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(scratchLabel, width / 2, height / 2);
    ctx.font = "500 13px 'DM Sans', system-ui, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.fillText("(use your finger or mouse)", width / 2, height / 2 + 24);
  }, [width, height, scratchColor, scratchLabel]);

  useEffect(() => {
    drawScratchLayer();
  }, [drawScratchLayer]);

  const getPos = (e: PointerEvent | React.PointerEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * width,
      y: ((e.clientY - rect.top) / rect.height) * height,
    };
  };

  const scratchAt = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineWidth = 38;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    const last = lastRef.current ?? { x, y };
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(x, y);
    ctx.stroke();
    // soft blob
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();
    lastRef.current = { x, y };
  };

  const measure = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return 0;
    const ctx = canvas.getContext("2d")!;
    const sample = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let cleared = 0;
    // sample every 24th pixel for perf
    for (let i = 3; i < sample.length; i += 24 * 4) {
      if (sample[i] === 0) cleared++;
    }
    const total = sample.length / (24 * 4);
    return cleared / total;
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (revealed) return;
    drawingRef.current = true;
    lastRef.current = getPos(e);
    (e.target as Element).setPointerCapture(e.pointerId);
    scratchAt(lastRef.current.x, lastRef.current.y);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!drawingRef.current || revealed) return;
    const p = getPos(e);
    scratchAt(p.x, p.y);
  };

  const handlePointerUp = () => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    lastRef.current = null;
    const p = measure();
    onProgress?.(p);
    if (p >= threshold && !revealed) {
      setRevealed(true);
      // animate the rest away
      const canvas = canvasRef.current!;
      canvas.style.transition = "opacity 600ms ease";
      canvas.style.opacity = "0";
      setTimeout(() => onRevealed?.(), 600);
    }
  };

  return (
    <div
      className="relative overflow-hidden rounded-3xl shadow-card bg-card"
      style={{ width, height, touchAction: "none" }}
    >
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>

      {/* Scratch progress indicator */}
      {!revealed && progress > 0 && (
        <div className="pointer-events-none absolute bottom-4 left-0 right-0 flex justify-center">
          <div className="flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-white transition-all duration-200"
                style={{ width: `${Math.min(progress * 100, 100)}%` }}
              />
            </div>
            <span>{Math.round(Math.min(progress * 100, 100))}%</span>
          </div>
        </div>
      )}

      {!revealed && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full cursor-grab active:cursor-grabbing select-none"
          style={{ touchAction: "none" }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onPointerCancel={handlePointerUp}
        />
      )}
    </div>
  );
}

// quick shade helper for hex colors
function shade(hex: string, percent: number) {
  const m = hex.replace("#", "");
  const num = parseInt(
    m.length === 3
      ? m
          .split("")
          .map((c) => c + c)
          .join("")
      : m,
    16,
  );
  let r = (num >> 16) + percent;
  let g = ((num >> 8) & 0xff) + percent;
  let b = (num & 0xff) + percent;
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

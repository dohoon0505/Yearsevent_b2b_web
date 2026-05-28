import { useEffect, useRef } from "react";

/**
 * PetalCanvas — Canvas 2D 꽃잎 파티클 시스템
 *
 * HeroSection 배경 위에 깔려 자연스럽게 떨어지는 꽃잎을 렌더링.
 * marine 사이트의 물결 파티클을 꽃 테마로 치환.
 *
 * 특징:
 *   - 꽃잎 SVG path를 Path2D로 그림 (단순 ellipse 대비 자연스러움)
 *   - sin wave swing + rotation + drift (바람 효과)
 *   - 마우스 부근 120px 내 꽃잎 반발 (interactive feel)
 *   - prefers-reduced-motion 존중 → 렌더 비활성
 *   - DPR 최대 2로 클램프 (성능)
 *
 * Props:
 *   count — 꽃잎 개수 (기본 60)
 *   palette — 색상 배열 (기본 peach·연분홍·흰색·라임)
 */

const DEFAULT_PALETTE = [
  "#ef695d", // peach
  "#ffd0cc", // 연분홍
  "#ffe4b5", // 살구
  "#ffffff", // 흰
  "#e2ef5d", // 라임 (액센트)
];

// 꽃잎 모양 — 위쪽 뾰족, 아래쪽 둥근 잎
const PETAL_PATH = new Path2D(
  "M 0,-1 C 0.6,-0.85 0.55,-0.25 0.35,0.05 C 0.2,0.3 0.05,0.4 0,0.42 C -0.05,0.4 -0.2,0.3 -0.35,0.05 C -0.55,-0.25 -0.6,-0.85 0,-1 Z",
);

export default function PetalCanvas({
  count = 60,
  palette = DEFAULT_PALETTE,
}) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const petalsRef = useRef([]);
  const mouseRef = useRef({ x: -9999, y: -9999, active: false });
  const sizeRef = useRef({ w: 0, h: 0, dpr: 1 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // reduced-motion 사용자는 비활성
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) return;

    const ctx = canvas.getContext("2d", { alpha: true });

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.parentElement
        ? canvas.parentElement.clientWidth
        : window.innerWidth;
      const h = canvas.parentElement
        ? canvas.parentElement.clientHeight
        : window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      sizeRef.current = { w, h, dpr };
    }

    function makePetal(initial = false) {
      const { w, h } = sizeRef.current;
      return {
        x: Math.random() * w,
        // initial=true이면 화면 전체에 분포, false이면 화면 위에서 새로 등장
        y: initial ? Math.random() * h : -20 - Math.random() * h * 0.5,
        size: 10 + Math.random() * 18, // 꽃잎 반지름 (10~28px)
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.025,
        vy: 0.35 + Math.random() * 0.9, // 낙하 속도
        swayAmp: 0.4 + Math.random() * 0.9, // 가로 흔들림 폭
        swaySpeed: 0.0008 + Math.random() * 0.0014,
        swayOffset: Math.random() * Math.PI * 2,
        color: palette[Math.floor(Math.random() * palette.length)],
        opacity: 0.35 + Math.random() * 0.45,
      };
    }

    resize();
    petalsRef.current = Array.from({ length: count }, () => makePetal(true));

    function tick(t) {
      const { w, h } = sizeRef.current;
      ctx.clearRect(0, 0, w, h);

      const m = mouseRef.current;
      const petals = petalsRef.current;

      for (let i = 0; i < petals.length; i++) {
        const p = petals[i];

        // sway (sin 기반 좌우 흔들림)
        p.x += Math.sin(t * p.swaySpeed + p.swayOffset) * p.swayAmp;
        p.y += p.vy;
        p.rot += p.rotSpeed;

        // 마우스 반발
        if (m.active) {
          const dx = p.x - m.x;
          const dy = p.y - m.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const radius = 130;
          if (dist < radius && dist > 0.5) {
            const force = (1 - dist / radius) * 5;
            p.x += (dx / dist) * force;
            p.y += (dy / dist) * force;
          }
        }

        // 화면 밖으로 나가면 위에서 재등장
        if (p.y > h + 30) {
          Object.assign(p, makePetal(false));
        }
        if (p.x < -30) p.x = w + 30;
        else if (p.x > w + 30) p.x = -30;

        // 꽃잎 그리기 (Path2D scale + rotate)
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.scale(p.size, p.size);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fill(PETAL_PATH);
        ctx.restore();
      }

      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);

    const onResize = () => resize();
    const onMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      };
    };
    const onMouseLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("mouseleave", onMouseLeave, { passive: true });

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [count, palette]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="absolute inset-0 w-full h-full pointer-events-none select-none"
      style={{ zIndex: 5 }}
    />
  );
}

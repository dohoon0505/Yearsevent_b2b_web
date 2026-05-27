import { useEffect, useState } from "react";
import cityBg from "../assets/hero-city-bg.png";

export default function HeroIntro({ progress = 0 }) {
  const lines = ["기업 성장의", "필수 파트너"];

  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 2000);
    return () => clearTimeout(t);
  }, []);

  const scale = 1 + Math.pow(progress, 1.5) * 11;

  return (
    <div
      className="relative h-screen w-full bg-white flex items-center justify-center overflow-hidden"
      aria-label="진입 인트로"
    >
      <div
        className="relative hero-zoom"
        style={{ transform: `translate3d(0,0,0) scale(${scale.toFixed(3)})` }}
      >
        {/* Layer 1: background-clip:text — 하나의 연속 이미지 */}
        <div
          className="hero-text-clip"
          style={{ backgroundImage: `url(${cityBg})` }}
        >
          {lines.map((line, i) => (
            <p key={i} className="typo-hero select-none">{line}</p>
          ))}
        </div>

        {/* Layer 2: 흰색 텍스트 마스크 — 글자별 fade-out으로 Layer 1 노출 */}
        <div className="absolute inset-0" aria-hidden>
          {lines.map((line, lineIdx) => (
            <p key={lineIdx} className="typo-hero select-none">
              {Array.from(line).map((char, charIdx) => {
                const isSpace = char === " ";
                const delaySec = lineIdx * 0.45 + charIdx * 0.08;
                return (
                  <span
                    key={charIdx}
                    className="hero-char-mask"
                    style={{
                      opacity: revealed ? 0 : 1,
                      transitionDelay: revealed ? `${delaySec.toFixed(2)}s` : "0s",
                    }}
                  >
                    {isSpace ? " " : char}
                  </span>
                );
              })}
            </p>
          ))}
        </div>
      </div>

      <div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[var(--color-neutral-60)]"
        style={{
          opacity:
            revealed && progress < 0.05
              ? 1
              : Math.max(0, 1 - progress * 5).toFixed(3),
          transition: revealed ? "opacity 0.6s ease-out" : "opacity 0s",
        }}
      >
        <span className="typo-caption">Scroll</span>
        <span
          aria-hidden
          className="block h-10 w-px bg-[var(--color-neutral-50)] origin-top animate-[scroll-line_2.4s_ease-in-out_infinite]"
        />
      </div>
    </div>
  );
}

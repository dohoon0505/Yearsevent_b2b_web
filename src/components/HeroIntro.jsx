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
      className="relative h-screen w-full overflow-hidden"
      aria-label="진입 인트로"
    >
      <img
        src={cityBg}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover select-none"
        draggable="false"
      />
      <div className="absolute inset-0 bg-black/40" aria-hidden />

      <div className="relative z-10 flex h-full items-center justify-center">
        <div
          className="flex flex-col items-center justify-center"
          style={{
            transform: `translate3d(0,0,0) scale(${scale.toFixed(3)})`,
            transformOrigin: "54% 76%",
            willChange: "transform",
            backfaceVisibility: "hidden",
          }}
        >
          {lines.map((line, lineIdx) => (
            <p
              key={lineIdx}
              className="text-center font-black text-white select-none"
              style={{
                fontSize: "clamp(48px, 9.5vw, 130px)",
                letterSpacing: "-0.001em",
                lineHeight: 1.4,
              }}
            >
              {Array.from(line).map((char, charIdx) => {
                const isSpace = char === " ";
                const delaySec = lineIdx * 0.45 + charIdx * 0.08;

                return (
                  <span
                    key={charIdx}
                    className="inline-block will-change-[opacity,transform]"
                    style={{
                      opacity: revealed ? 1 : 0,
                      transform: revealed
                        ? "translateY(0)"
                        : "translateY(40%)",
                      transition:
                        "opacity 0.7s var(--ease-out-quart), transform 0.7s var(--ease-out-quart)",
                      transitionDelay: revealed
                        ? `${delaySec.toFixed(2)}s`
                        : "0s",
                    }}
                  >
                    {isSpace ? " " : char}
                  </span>
                );
              })}
            </p>
          ))}
        </div>
      </div>

      <div
        className="absolute bottom-10 left-1/2 z-10 -translate-x-1/2 flex flex-col items-center gap-2 text-white/60"
        style={{
          opacity:
            revealed && progress < 0.05
              ? 1
              : Math.max(0, 1 - progress * 5).toFixed(3),
          transition: revealed ? "opacity 0.6s ease-out" : "opacity 0s",
        }}
      >
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">
          Scroll
        </span>
        <span
          aria-hidden
          className="block h-10 w-px bg-white/50 origin-top animate-[scroll-line_2.4s_ease-in-out_infinite]"
        />
      </div>
    </div>
  );
}

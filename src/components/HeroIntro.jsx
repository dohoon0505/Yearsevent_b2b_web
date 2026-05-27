import { useEffect, useState } from "react";

/**
 * HeroIntro — Figma node 66:61
 *
 * 새 인터랙션 명세:
 *  1) 페이지 진입 후 2초 대기 → 글자 1자씩 stagger 등장 (스크롤 무관, 자동)
 *  2) 스크롤 시 텍스트가 "파" 글자 쪽으로 확대 (transform: scale)
 *     - 블러 없음. 텍스트는 사라지지 않음. scale만 진행.
 *     - background-attachment: fixed 로 도시 사진이 viewport에 깔린 효과 → 글자 안의
 *       사진이 점점 화면을 채움
 *  3) scale이 완료된 후에 Hero_Section 등장 (HomePage에서 처리)
 *
 * "파" 위치: "필수 파트너"의 4번째 글자 (필수=2자 + 공백 + 파=1자 → 두 번째 줄 4번째)
 *   → transform-origin을 좌측 50% / 수직 75% 부근으로 설정
 */
export default function HeroIntro({ progress = 0 }) {
  const lines = ["기업 성장의", "필수 파트너"];

  // 진입 후 2초 대기 → 글자 stagger
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 2000);
    return () => clearTimeout(t);
  }, []);

  // progress 0 → 1 에 매핑되는 scale (1 → ~12)
  // ease-in 형태로 진행 — 초반은 천천히, 후반에 가속.
  // scale 12 시점에 "파" 글자가 viewport 폭과 비슷 — 그 안의 도시 사진이 viewport를 채움.
  const scale = 1 + Math.pow(progress, 1.5) * 11;

  return (
    <div
      className="relative h-screen w-full bg-white flex items-center justify-center overflow-hidden"
      aria-label="진입 인트로"
    >
      {/* 텍스트 컨테이너 — scale + transform-origin 적용
          ⚠ scroll-driven 변환은 transition 없음 (1:1 매핑되어야 부드러움).
          transition 있으면 매 scroll 이벤트마다 보간이 시작되며 jank/깜빡임 유발.
          will-change + translate3d로 GPU 가속. */}
      <div
        className="relative flex flex-col items-center justify-center"
        style={{
          transform: `translate3d(0,0,0) scale(${scale.toFixed(3)})`,
          // "파" 글자 위치 — "필수 파트너" 두 번째 줄의 4번째 글자.
          transformOrigin: "54% 76%",
          willChange: "transform",
          backfaceVisibility: "hidden",
        }}
      >
        {lines.map((line, lineIdx) => (
          <p
            key={lineIdx}
            className="hero-intro-clip text-center font-black select-none"
            style={{
              fontSize: "clamp(48px, 9.5vw, 130px)",
              letterSpacing: "-0.001em",
              lineHeight: 1.4,
            }}
          >
            {Array.from(line).map((char, charIdx) => {
              const isSpace = char === " ";
              const delaySec =
                lineIdx * 0.45 + charIdx * 0.08; // stagger 0.08s

              return (
                <span
                  key={charIdx}
                  className="hero-intro-char inline-block will-change-[opacity,transform]"
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

      {/* 하단 스크롤 힌트 — 글자 등장 후, zoom 시작 전까지 노출 */}
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
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">
          Scroll
        </span>
        <span
          aria-hidden
          className="block h-10 w-px bg-[var(--color-neutral-50)] origin-top animate-[scroll-line_2.4s_ease-in-out_infinite]"
        />
      </div>
    </div>
  );
}

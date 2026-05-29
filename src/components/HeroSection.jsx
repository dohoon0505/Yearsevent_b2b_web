import { useEffect, useState } from "react";
import EventHeader from "./EventHeader.jsx";
import HeaderHero from "./HeaderHero.jsx";
import PetalCanvas from "./PetalCanvas.jsx";
import cityBg from "../assets/hero-city-bg.webp";

/**
 * HeroSection — Background 우선 로드 + 텍스트 순차 로드 + 헤더 로드
 * 참고: https://progress-template.framer.website/
 *
 * 시퀀스:
 *   1) 배경 이미지 fade-in + 미세 zoom-out (1.2s)
 *   2) 250ms 후: 텍스트 글자 폭포 (시간 기반 stagger, translateY(-115%) → 0)
 *   3) 1.3s 후: 헤더 슬라이드 다운
 *   4) 텍스트 마지막에 본문 paragraph fade-up
 */
export default function HeroSection({ onMenuClick }) {
  const [bgLoaded, setBgLoaded] = useState(false);
  const [textReady, setTextReady] = useState(false);
  const [headerReady, setHeaderReady] = useState(false);

  // 1) Background 우선 로드 — preload Image 객체로 캐시 확인
  useEffect(() => {
    const img = new Image();
    img.src = cityBg;
    const handleReady = () => setBgLoaded(true);
    if (img.complete && img.naturalWidth > 0) {
      handleReady();
    } else {
      img.addEventListener("load", handleReady);
      img.addEventListener("error", handleReady);
    }
    return () => {
      img.removeEventListener("load", handleReady);
      img.removeEventListener("error", handleReady);
    };
  }, []);

  // 2) bg 로드 완료 → 텍스트 → 본문 → 헤더 순차
  useEffect(() => {
    if (!bgLoaded) return;
    const t1 = setTimeout(() => setTextReady(true), 250);
    const t3 = setTimeout(() => setHeaderReady(true), 1300);
    return () => {
      clearTimeout(t1);
      clearTimeout(t3);
    };
  }, [bgLoaded]);

  return (
    <section
      className="snap-section relative h-screen w-full bg-black"
      aria-label="Hero"
    >
      {/* Background — fade-in + 미세 zoom-out */}
      <img
        src={cityBg}
        alt=""
        aria-hidden
        draggable="false"
        className="absolute inset-0 h-full w-full object-cover select-none hero-bg-rise"
        style={{
          opacity: bgLoaded ? 1 : 0,
          transform: bgLoaded ? "scale(1)" : "scale(1.08)",
        }}
      />
      <div
        className="absolute inset-0 bg-[var(--color-overlay-dark-40)]"
        aria-hidden
      />

      {/* 꽃잎 파티클 — Canvas 2D (overlay 위, 본문 텍스트 아래) */}
      <PetalCanvas count={60} />

      {/* EventHeader — top bar */}
      <div
        className="absolute top-0 left-0 right-0 z-20 hero-header-drop"
        style={{
          transform: headerReady ? "translateY(0)" : "translateY(-100%)",
          opacity: headerReady ? 1 : 0,
        }}
      >
        <EventHeader />
      </div>

      {/* HeaderHero — main nav (relative z-40: 본문 콘텐츠 z-10 위로 올려 hover/dropdown 보장) */}
      <div
        className="relative z-40 hero-header-drop"
        style={{
          transform: headerReady ? "translateY(0)" : "translateY(-110%)",
          opacity: headerReady ? 1 : 0,
          transitionDelay: "0.12s",
        }}
      >
        <HeaderHero onMenuClick={onMenuClick} />
      </div>

      {/* 본문 — 글자 폭포 + fade-up (좌우 padding 0 / margin 260px @ lg+) */}
      <div className="relative z-10 flex h-full flex-col justify-end pb-[120px] px-0 mx-6 md:mx-12 lg:mx-[260px] text-white">
        <div className="max-w-[820px]">
          {/* 뱃지 6개 — 가장 위 (textReady 시점 stagger 등장) */}
          <ul className="flex flex-wrap gap-2.5 max-w-[640px]">
            {[
              "법무법인",
              "세무법인",
              "제조업",
              "도소매업",
              "유통업",
              "모임/단체",
            ].map((label, i) => (
              <li
                key={label}
                className="bg-[var(--color-overlay-light-10)] backdrop-blur-[3px] rounded-full px-4 py-2 text-white text-[13px] md:text-[14px] font-medium border border-white/15 hero-fade-up"
                style={{
                  opacity: textReady ? 1 : 0,
                  transform: textReady
                    ? "translateY(0)"
                    : "translateY(20px)",
                  transitionDelay: `${i * 0.08}s`,
                }}
              >
                {label}
              </li>
            ))}
          </ul>

          {/* 메인 헤딩 — 중간 (뱃지 등장 후 cascade) */}
          <h1 className="typo-display mt-6">
            <CascadeLine
              text="번번히 발생하는 경조사,"
              ready={textReady}
              baseDelay={520}
              stagger={36}
            />
            <CascadeLine
              text="체계적인 전담관리 솔루션"
              ready={textReady}
              baseDelay={1060}
              stagger={36}
              className="text-[var(--color-brand-peach)]"
            />
          </h1>

          {/* 11년차 슬로건 — 가장 아래 (헤딩 등장 후 cascade) */}
          <CascadeLine
            as="p"
            text="기업, 대표, 담당자 모두를 고려한 기업 프로세스"
            ready={textReady}
            baseDelay={1600}
            stagger={28}
            className="mt-8 text-[16px] md:text-[18px] font-medium text-white/85 tracking-[-0.003em]"
          />
        </div>
      </div>

      {/* 스크롤 유도 인디케이터 — 우측 하단 (본문 pb-[120px]와 동일 라인) */}
      <div
        className="absolute bottom-[120px] right-6 md:right-12 lg:right-[260px] z-10 hidden md:flex flex-col items-center gap-3 select-none pointer-events-none hero-fade-up"
        style={{
          opacity: headerReady ? 1 : 0,
          transform: headerReady ? "translateY(0)" : "translateY(12px)",
          transitionDelay: "0.35s",
        }}
        aria-hidden
      >
        <div className="w-[26px] h-[44px] border-[1.5px] border-white/70 rounded-full flex justify-center pt-2">
          <span className="w-[3px] h-[8px] bg-white/90 rounded-full anim-scroll-mouse-dot" />
        </div>
        <span className="text-[10px] tracking-[0.3em] text-white/65 font-semibold uppercase anim-scroll-label">
          Scroll
        </span>
      </div>
    </section>
  );
}

/**
 * CascadeLine — 글자 폭포 (시간 기반)
 *   parent: overflow:hidden
 *   each char: translateY(-115%) → 0, transitionDelay = baseDelay + i * stagger
 */
function CascadeLine({
  as: Tag = "span",
  text,
  ready,
  baseDelay = 0,
  stagger = 30,
  className = "",
}) {
  return (
    <Tag className={`cascade-line ${className}`}>
      {Array.from(text).map((ch, i) => (
        <span
          key={i}
          className="cascade-char"
          style={{
            transform: ready ? "translateY(0)" : "translateY(-115%)",
            transitionDelay: `${baseDelay + i * stagger}ms`,
          }}
        >
          {ch === " " ? " " : ch}
        </span>
      ))}
    </Tag>
  );
}

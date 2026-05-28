import { useEffect, useState } from "react";
import EventHeader from "./EventHeader.jsx";
import HeaderHero from "./HeaderHero.jsx";
import cityBg from "../assets/hero-city-bg.png";

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
  const [bodyReady, setBodyReady] = useState(false);
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
    const t2 = setTimeout(() => setBodyReady(true), 1750);
    const t3 = setTimeout(() => setHeaderReady(true), 1300);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [bgLoaded]);

  return (
    <section
      className="snap-section relative h-screen w-full overflow-hidden bg-black"
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

      {/* HeaderHero — main nav */}
      <div
        className="hero-header-drop"
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
          <CascadeLine
            as="p"
            text="11년차 꽃배달 기업의 경조사 전담 솔루션"
            ready={textReady}
            baseDelay={0}
            stagger={28}
            className="text-[16px] md:text-[18px] font-medium text-white/85 tracking-[-0.003em]"
          />

          <h1 className="typo-display mt-4">
            <CascadeLine
              text="경조사 소식이 많이 들려온다면,"
              ready={textReady}
              baseDelay={320}
              stagger={36}
            />
            <CascadeLine
              text="전담관리 서비스는 꼭 필요합니다."
              ready={textReady}
              baseDelay={860}
              stagger={36}
              className="text-[var(--color-brand-peach)]"
            />
          </h1>

          <p
            className="typo-body-hero mt-6 max-w-[640px] text-white/80 hero-fade-up"
            style={{
              opacity: bodyReady ? 1 : 0,
              transform: bodyReady ? "translateY(0)" : "translateY(24px)",
            }}
          >
            법인·단체의 경조사 화환을 8년간 직접 운영한 메이플라워의 전담관리
            서비스. 35% 단가 절감 · 전국 무료배송 · 월정산 · 50만원 책임배상.
          </p>
        </div>
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

import EventHeader from "./EventHeader.jsx";
import HeaderHero from "./HeaderHero.jsx";
import cityBg from "../assets/hero-city-bg.png";

/**
 * HeroSection — Figma node 66:23
 *
 * 1920×950 풀스크린 영역.
 * - 배경: 도시 사진 + rgba(0,0,0,0.4) 오버레이
 * - 상단: Event_Header (60px 검정) + Header (80px 반투명)
 */
export default function HeroSection({ onMenuClick }) {
  return (
    <section
      className="snap-section relative h-screen w-full overflow-hidden bg-black"
      aria-label="Hero"
    >
      {/* 배경 사진 */}
      <img
        src={cityBg}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover select-none"
        draggable="false"
      />
      <div className="absolute inset-0 bg-[var(--color-overlay-dark-40)]" aria-hidden />

      {/* 상단 EventHeader (60px) — 페이지 로드 1초 후 슬라이드 다운 */}
      <div
        className="absolute top-0 left-0 right-0 z-20 will-change-transform"
        style={{
          animation:
            "header-slide-in 0.8s var(--ease-out-quart) 1s both",
        }}
      >
        <EventHeader />
      </div>

      {/* Header (80px) — 페이지 로드 1초 후 슬라이드 다운 (Hero 위 고정) */}
      <HeaderHero onMenuClick={onMenuClick} />

      {/* Hero 카피 영역 — Figma에서는 빈 영역 (텍스트는 Hero_intro에서 처리)
          시각 흐름 보강을 위해 약간의 헤드라인을 배치 */}
      <div className="relative z-10 mx-auto flex h-full max-w-[1320px] flex-col justify-end pb-[120px] px-6 md:px-12 lg:px-[120px] xl:px-[100px] text-white">
        <div className="max-w-[820px]">
          <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-white/75">
            For Business · Since 2016
          </p>
          <h1 className="mt-4 text-[clamp(34px,4.6vw,56px)] font-bold leading-[1.18] tracking-[-0.022em]">
            경조사 소식이 많이 들려온다면,
            <br />
            <span className="text-[var(--color-brand-peach)]">
              전담관리 서비스는 꼭 필요합니다.
            </span>
          </h1>
          <p className="mt-6 max-w-[640px] text-[15px] md:text-[17px] leading-[1.7] text-white/80">
            법인·단체의 경조사 화환을 8년간 직접 운영한 메이플라워의 전담관리
            서비스. 35% 단가 절감 · 전국 무료배송 · 월정산 · 50만원 책임배상.
          </p>
        </div>
      </div>
    </section>
  );
}

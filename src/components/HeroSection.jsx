import EventHeader from "./EventHeader.jsx";
import HeaderHero from "./HeaderHero.jsx";
import cityBg from "../assets/hero-city-bg.png";

export default function HeroSection({ onMenuClick }) {
  return (
    <section
      className="snap-section relative h-screen w-full overflow-hidden bg-black"
      aria-label="Hero"
    >
      <img
        src={cityBg}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover select-none"
        draggable="false"
      />
      <div className="absolute inset-0 bg-[var(--color-overlay-dark-40)]" aria-hidden />

      <div className="absolute top-0 left-0 right-0 z-20 anim-header-slide-in">
        <EventHeader />
      </div>

      <HeaderHero onMenuClick={onMenuClick} />

      <div className="relative z-10 mx-auto flex h-full max-w-[1320px] flex-col justify-end pb-[120px] px-6 md:px-12 lg:px-[120px] xl:px-[100px] text-white">
        <div className="max-w-[820px]">
          <p className="typo-eyebrow text-white/75">
            For Business · Since 2016
          </p>
          <h1 className="typo-display mt-4">
            경조사 소식이 많이 들려온다면,
            <br />
            <span className="text-[var(--color-brand-peach)]">
              전담관리 서비스는 꼭 필요합니다.
            </span>
          </h1>
          <p className="typo-body-hero mt-6 max-w-[640px] text-white/80">
            법인·단체의 경조사 화환을 8년간 직접 운영한 메이플라워의 전담관리
            서비스. 35% 단가 절감 · 전국 무료배송 · 월정산 · 50만원 책임배상.
          </p>
        </div>
      </div>
    </section>
  );
}

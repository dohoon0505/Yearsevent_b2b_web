import Logo from "./Logo.jsx";
import NavMenu from "./NavMenu.jsx";
import MenuToggle from "./MenuToggle.jsx";

/**
 * HeaderHero — Figma node 66:28
 *
 * Hero_Section 상단 80px 반투명 헤더.
 * - background: rgba(255,255,255,0.1)
 * - padding: 0 300px (1920 기준), 모바일은 축소
 * - 로고 180×35 (좌) · 4 GNB (우측 정렬, SemiBold 18px) · 햄버거(우측 끝)
 */
export default function HeaderHero({ onMenuClick }) {
  return (
    <header
      className="absolute top-[60px] left-0 right-0 h-[64px] z-30 flex items-center bg-[var(--color-overlay-light-10)] backdrop-blur-[2px] px-6 md:px-10 lg:px-[100px] xl:px-[260px] will-change-transform"
      style={{
        // 페이지 로드 1초 후 위에서 슬라이드 다운 (EventHeader와 함께 등장)
        animation: "header-slide-in 0.8s var(--ease-out-quart) 1s both",
      }}
    >
      <div className="flex flex-1 items-center justify-between gap-8">
        <Logo />
        <div className="hidden lg:flex items-center gap-[30px]">
          <NavMenu size={16} />
        </div>
      </div>
      <div className="ml-6">
        <MenuToggle onClick={onMenuClick} accent="red" />
      </div>
    </header>
  );
}

import Logo from "./Logo.jsx";
import NavMenu from "./NavMenu.jsx";
import MenuToggle from "./MenuToggle.jsx";

/**
 * HeaderScrollActive — Figma node 66:166 (정확 반영)
 *
 * Figma 측정값 (frame 1400×90):
 *   - 외곽 폭: max 1400px (이전 1700에서 축소)
 *   - 높이 90px (lg 기준), 좌우 패딩 40px, gap 30px
 *   - 로고 150×28.846px
 *   - 4 GNB SemiBold 18px 화이트
 *   - 햄버거 30×30 (윗줄 빨간 액센트)
 *   - rounded-[16px]
 *   - bg rgba(34,34,34,0.4) — 단순 다크 반투명
 *   - Figma effect 미명시 → backdrop-blur 미세 / shadow 없음
 *
 * 외부 wrapper: 소형 side gap (12 / 16 / 20px), max-w 1400px + mx-auto.
 * 글래스모피즘: Figma 미명시 → backdrop-blur 없음, bg rgba(34,34,34,0.4)만.
 */
export default function HeaderScrollActive({ visible, onMenuClick }) {
  return (
    <div
      className={`fixed inset-x-0 top-3 lg:top-5 z-50 mx-auto max-w-[1400px] px-3 md:px-4 lg:px-5 pointer-events-none ${
        visible ? "translate-y-0 opacity-100" : "-translate-y-[120%] opacity-0"
      } transition-[transform,opacity] duration-[550ms] ease-[cubic-bezier(0.25,1,0.5,1)]`}
      aria-hidden={!visible}
    >
      <header className="rounded-[16px] bg-[rgba(34,34,34,0.4)] flex items-center gap-[30px] px-5 md:px-[40px] h-[72px] pointer-events-auto">
        <div className="flex flex-1 items-center justify-between gap-6 min-w-0">
          <Logo />
          <div className="hidden lg:flex items-center gap-[30px]">
            <NavMenu size={17} fontClass="font-medium" />
          </div>
        </div>
        <MenuToggle onClick={onMenuClick} accent="red" size={30} />
      </header>
    </div>
  );
}

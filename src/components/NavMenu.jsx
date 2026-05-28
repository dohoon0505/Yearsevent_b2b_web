import { useRef, useState } from "react";

/**
 * NavMenu — Footer SITEMAP 기반 dropdown navigation
 *
 * 참고: nav-bar-dropdown icon-list (Linear 스타일)
 * 각 메뉴 hover 시 sub-items 드롭다운 (아이콘 + 제목 + 설명)
 *
 * 톤:
 *   - 메뉴 텍스트: 흰색 (HeroHeader / HeaderScrollActive 모두 어두운 배경 위)
 *   - dropdown: 밝은 흰색 패널 + 어두운 텍스트 (Linear 시그니처)
 *
 * 아이콘:
 *   - 36x36 rounded-8, 메뉴 카테고리별 단일 accent 컬러
 */

const MENU = [
  {
    label: "회사소개",
    href: "/about",
    accent: "var(--color-brand-red)",
    items: [
      { title: "회사소개", desc: "올해의경조사는 어떤 기업인가요" },
      { title: "회사연혁", desc: "2016년부터 시작된 여정" },
      { title: "구조도", desc: "조직 구조와 운영 체계" },
      { title: "핵심지표", desc: "신뢰를 뒷받침하는 숫자" },
    ],
  },
  {
    label: "도입사례",
    href: "/cases",
    accent: "var(--color-brand-mocha)",
    items: [
      { title: "제조 · 유통", desc: "현장 곁의 전담 관리" },
      { title: "도소매업", desc: "체계적인 거래처 경조사 관리" },
      { title: "법무법인", desc: "격식 있는 자리에 정확하게" },
      { title: "세무법인", desc: "촘촘한 경조사 관계 관리" },
      { title: "모임 · 단체", desc: "소속감을 꽃으로 전합니다" },
    ],
  },
  {
    label: "서비스안내",
    href: "/services",
    accent: "var(--color-brand-burgundy)",
    items: [
      { title: "제휴 혜택 안내", desc: "전담 기업 전용 혜택과 단가" },
      { title: "월 정산 시스템", desc: "세금계산서 일괄 발급" },
      { title: "피해 보상 제도", desc: "건당 50만원 책임 배상" },
    ],
  },
  {
    label: "상품가이드",
    href: "/products",
    accent: "var(--color-brand-peach)",
    items: [
      { title: "경조사 화환", desc: "격식 있는 자리에 어울리는 화환" },
      { title: "식물 · 분재", desc: "장기간 함께하는 화분 선물" },
      { title: "생화 · 꽃 · 바구니", desc: "특별한 날을 위한 꽃 선물" },
    ],
  },
];

export default function NavMenu({
  size = 16,
  fontClass = "font-semibold",
  className = "",
}) {
  const [openIdx, setOpenIdx] = useState(-1);
  const closeTimerRef = useRef(null);

  const openMenu = (idx) => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setOpenIdx(idx);
  };

  const closeMenu = () => {
    closeTimerRef.current = setTimeout(() => {
      setOpenIdx(-1);
    }, 120);
  };

  return (
    <nav aria-label="글로벌 네비게이션" className={className}>
      <ul className="flex items-center gap-[30px]">
        {MENU.map((menu, i) => {
          const isOpen = openIdx === i;
          return (
            <li
              key={menu.href}
              className="relative"
              onMouseEnter={() => openMenu(i)}
              onMouseLeave={closeMenu}
              onFocus={() => openMenu(i)}
              onBlur={closeMenu}
            >
              <a
                href={menu.href}
                className={`typo-nav text-white ${fontClass} transition-colors hover:text-[var(--color-brand-peach)]`}
                style={{ fontSize: `${size}px` }}
                aria-haspopup="true"
                aria-expanded={isOpen}
              >
                {menu.label}
              </a>

              {/* Dropdown panel — icon-list pattern */}
              <div
                className="absolute left-1/2 top-full pt-3 z-50"
                style={{
                  pointerEvents: isOpen ? "auto" : "none",
                }}
              >
                <div
                  className="bg-white text-[#171717] rounded-[16px] origin-top"
                  style={{
                    boxShadow:
                      "0 18px 48px -12px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,0,0,0.04)",
                    opacity: isOpen ? 1 : 0,
                    transform: isOpen
                      ? "translate(-50%, 0)"
                      : "translate(-50%, -6px)",
                    visibility: isOpen ? "visible" : "hidden",
                    transition:
                      "opacity 200ms cubic-bezier(0.2,0,0,1), transform 200ms cubic-bezier(0.2,0,0,1), visibility 200ms",
                  }}
                  role="menu"
                >
                  <ul className="flex flex-col gap-[2px] p-[10px] min-w-[360px]">
                    {menu.items.map((item, j) => (
                      <li key={j}>
                        <a
                          href="#"
                          className="flex items-center gap-[14px] px-[14px] py-[11px] rounded-[10px] hover:bg-[#f4f4f5] transition-colors duration-150"
                          role="menuitem"
                        >
                          <span
                            className="w-9 h-9 rounded-[8px] shrink-0"
                            style={{
                              background: menu.accent,
                              boxShadow:
                                "inset 0 -2px 0 rgba(0,0,0,0.08)",
                            }}
                            aria-hidden
                          />
                          <div className="min-w-0">
                            <p className="text-[14px] font-semibold leading-[1.2] tracking-[-0.003em] text-[#171717]">
                              {item.title}
                            </p>
                            <p className="mt-[3px] text-[12.5px] text-[#71717a] leading-[1.4] tracking-[-0.003em]">
                              {item.desc}
                            </p>
                          </div>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

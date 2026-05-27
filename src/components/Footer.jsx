/**
 * Footer — Figma node 67:199
 *
 * 흰 배경, 좌우 패딩 300px, 상하 80px.
 * - 4컬럼 사이트맵 (회사소개 / 도입사례 / 서비스안내 / 상품가이드)
 *   · 카테고리 헤딩: Pretendard SemiBold 20px #222
 *   · 서브 메뉴: Pretendard Regular 18px #989898
 * - 우측 큰 카드 placeholder: 500px 폭, 둥근 모서리 18px, bg #d9d9d9
 * - 디바이더: 1px #5d5d5d
 * - 하단: 좌측 약관 링크 (#222 16px Medium), 우측 Copyright (#989898) + "무단복제..." (#7b2b1e)
 */

const SITEMAP = [
  {
    title: "회사소개",
    items: ["회사소개", "회사연혁", "구조도", "핵심지표"],
  },
  {
    title: "도입사례",
    items: ["제조 · 유통", "도소매업", "법무법인", "세무법인", "모임·단체"],
  },
  {
    title: "서비스안내",
    items: ["제휴 혜택 안내", "월 정산 시스템", "피해 보상 제도"],
  },
  {
    title: "상품가이드",
    items: ["경조사 화환", "식물 · 분재", "생화 · 꽃 · 바구니"],
  },
];

const LEGAL = ["사업자 정보 확인", "개인정보처리방침", "서비스이용약관"];

export default function Footer() {
  return (
    <footer className="snap-section bg-white text-[#222] px-6 md:px-12 lg:px-[120px] xl:px-[150px] py-[60px] md:py-[80px]">
      <div className="flex flex-col gap-[40px]">
        {/* 상단 — 사이트맵 4컬럼 + 우측 카드 */}
        <div className="flex flex-col-reverse lg:flex-row lg:items-stretch lg:justify-between gap-10">
          <div className="grid grid-cols-2 gap-x-10 gap-y-10 md:grid-cols-4 md:gap-x-[40px] py-[3px]">
            {SITEMAP.map((col) => (
              <div key={col.title} className="flex flex-col gap-[22px]">
                <p className="text-[16px] md:text-[18px] font-semibold leading-[1.4]">
                  {col.title}
                </p>
                <ul className="flex flex-col gap-[14px] md:gap-[18px]">
                  {col.items.map((item) => (
                    <li
                      key={item}
                      className="text-[14px] md:text-[16px] font-normal leading-[1.4] text-[var(--color-neutral-60)] transition-colors hover:text-[var(--color-brand-red)] cursor-pointer"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* 우측 placeholder 카드 — Figma 68:302 */}
          <div className="h-[200px] md:h-[253px] w-full max-w-[500px] rounded-[18px] bg-[#d9d9d9] flex items-center justify-center text-[var(--color-neutral-60)] text-[11px] md:text-[13px]">
            <span className="opacity-60">광고·소개 영역 (Coming Soon)</span>
          </div>
        </div>

        {/* 디바이더 */}
        <div className="h-px w-full bg-[var(--color-neutral-75)]" />

        {/* 하단 */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between text-[12px] md:text-[14px]">
          <div className="flex flex-wrap items-center gap-[15px] font-medium text-[#222] tracking-[-0.001em]">
            {LEGAL.map((item) => (
              <a
                key={item}
                href="#"
                className="transition-colors hover:text-[var(--color-brand-red)]"
              >
                {item}
              </a>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] md:text-[14px]">
            <p className="text-[var(--color-neutral-60)] font-normal">
              Copyright © 2026 thinkflow .Inc All Rights Reserved.
            </p>
            <p className="text-[var(--color-brand-burgundy)] font-normal">
              무단 복제 및 크롤링 AI 접근을 일체 제한합니다
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

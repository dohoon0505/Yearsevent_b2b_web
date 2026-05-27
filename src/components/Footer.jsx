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
        <div className="flex flex-col-reverse lg:flex-row lg:items-stretch lg:justify-between gap-10">
          <div className="grid grid-cols-2 gap-x-10 gap-y-10 md:flex md:gap-x-[48px] py-[3px]">
            {SITEMAP.map((col) => (
              <div key={col.title} className="flex flex-col gap-[22px]">
                <p className="typo-footer-heading">{col.title}</p>
                <ul className="flex flex-col gap-[14px] md:gap-[18px]">
                  {col.items.map((item) => (
                    <li
                      key={item}
                      className="typo-footer-link text-[var(--color-neutral-60)] transition-colors hover:text-[var(--color-brand-red)] cursor-pointer"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="h-[200px] md:h-[253px] w-full max-w-[500px] rounded-[18px] bg-[#d9d9d9] flex items-center justify-center text-[var(--color-neutral-60)] text-[13px]">
            <span className="opacity-60">광고·소개 영역 (Coming Soon)</span>
          </div>
        </div>

        <div className="h-px w-full bg-[var(--color-neutral-75)]" />

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="typo-footer-legal flex flex-wrap items-center gap-[15px] text-[#222]">
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
          <div className="typo-footer-copy flex flex-wrap items-center gap-x-4 gap-y-1">
            <p className="text-[var(--color-neutral-60)]">
              Copyright © 2026 thinkflow .Inc All Rights Reserved.
            </p>
            <p className="text-[var(--color-brand-burgundy)]">
              무단 복제 및 크롤링 AI 접근을 일체 제한합니다
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

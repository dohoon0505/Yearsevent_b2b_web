export default function EventHeader() {
  return (
    <div
      className="bg-white text-[#222] flex items-center justify-between gap-4 h-[50px] px-[clamp(24px,7.8vw,150px)] border-b border-[var(--color-neutral-20)]"
      role="region"
      aria-label="프로모션 안내"
    >
      <p className="typo-promo truncate">
        <span aria-hidden>🎁 </span>
        도입을 희망하는 기업에게는 최대 10만원 상당의 1회 무료이용권을 지급해드리고
        있어요.
      </p>
      <a
        href="https://pf.kakao.com/_glBxdn/chat"
        target="_blank"
        rel="noopener noreferrer"
        className="btn-slide-fill group shrink-0 inline-flex items-center justify-center gap-[3px] bg-[var(--color-brand-red)] rounded-[4px] px-2.5 py-2 text-[11px] md:text-[12px] font-semibold text-white hover:text-[var(--color-brand-red)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-red)]"
      >
        <span aria-hidden className="btn-fill bg-white" />
        <span className="btn-label">서비스 체험신청</span>
        <span aria-hidden className="btn-icon">→</span>
      </a>
    </div>
  );
}

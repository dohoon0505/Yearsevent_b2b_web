/**
 * EventHeader — Figma node 66:24
 *
 * 검정 배경, 60px 높이, 좌우 패딩 300px (1920 기준).
 * 가운데: 흰색 프로모션 안내 (Pretendard Medium 16px)
 * 우측: 흰 배경 라운드 버튼, 빨강 텍스트 "서비스 체험신청 →" (Pretendard SemiBold 14px #cb0d35)
 *
 * 모바일에서는 가로 스크롤 가능한 단일 라인.
 */
export default function EventHeader() {
  return (
    <div
      className="bg-black text-white flex items-center justify-between gap-4 h-[60px] px-6 md:px-12 lg:px-[120px] xl:px-[300px]"
      role="region"
      aria-label="프로모션 안내"
    >
      <p className="text-[13px] md:text-[16px] font-medium leading-tight truncate">
        <span aria-hidden>🎁 </span>
        도입을 희망하는 기업에게는 5만원 상당의 1회 무료이용권을 지급해드리고
        있어요.
      </p>
      <a
        href="https://pf.kakao.com/_glBxdn/chat"
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 inline-flex items-center justify-center gap-1 bg-white rounded-[5px] px-3 py-[10px] text-[13px] md:text-[14px] font-semibold text-[var(--color-brand-red)] transition-colors hover:bg-[var(--color-neutral-20)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        서비스 체험신청
        <span aria-hidden>→</span>
      </a>
    </div>
  );
}

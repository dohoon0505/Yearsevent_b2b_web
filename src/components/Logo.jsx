import logoUrl from "../assets/logo-wordmark.png";

/**
 * Logo — Figma 로고 그룹 (66:30 / 66:168)
 *
 * 원본 자산은 흰색 워드마크 ("올해의 경조사" + 빨간 마크).
 * 데스크탑: 180×35, 모바일: 비례 축소.
 */
export default function Logo({ className = "" }) {
  return (
    <a
      href="/"
      aria-label="올해의경조사 홈으로"
      className={`inline-flex items-center ${className}`}
    >
      <img
        src={logoUrl}
        alt="올해의 경조사"
        className="h-[24px] md:h-[26px] lg:h-[28.8px] w-auto select-none"
        draggable="false"
      />
    </a>
  );
}

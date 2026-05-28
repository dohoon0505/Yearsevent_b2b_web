import logoUrl from "../assets/logo-wordmark.png";

/**
 * Logo — Figma 로고 그룹 (66:30 / 66:168)
 *
 * 원본 자산은 흰색 워드마크 ("올해의 경조사" + 빨간 마크).
 * size variant:
 *   - "default": 24 / 26 / 28.8px (HeaderScrollActive)
 *   - "large":   28 / 30 / 33px  (HeaderHero, +15%)
 */
const LOGO_SIZE = {
  default: "h-[24px] md:h-[26px] lg:h-[28.8px]",
  large: "h-[28px] md:h-[30px] lg:h-[33px]",
};

export default function Logo({ className = "", size = "default" }) {
  return (
    <a
      href="/"
      aria-label="올해의경조사 홈으로"
      className={`inline-flex items-center ${className}`}
    >
      <img
        src={logoUrl}
        alt="올해의 경조사"
        className={`${LOGO_SIZE[size] ?? LOGO_SIZE.default} w-auto select-none`}
        draggable="false"
      />
    </a>
  );
}

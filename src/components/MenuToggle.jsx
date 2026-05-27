/**
 * MenuToggle — 햄버거 메뉴 버튼 (Figma 66:36 / 66:174)
 *
 * size로 사이즈 변경: HeaderHero 24×24 / HeaderScrollActive 30×30.
 * 빨간 윗줄 + 흰 두 줄 패턴 (Scroll Up Active 헤더는 빨간 윗줄).
 */
export default function MenuToggle({
  onClick,
  accent = "red",
  size = 24,
  className = "",
}) {
  const top =
    accent === "red" ? "bg-[var(--color-brand-red)]" : "bg-white";
  // 막대 사이즈는 size에 비례 (24 기준 20, 16 / 30 기준 26, 20)
  const longW = Math.round(size * (5 / 6));
  const shortW = Math.round(size * (4 / 6));
  const gap = size >= 28 ? 5 : 4;
  const thickness = size >= 28 ? 2.5 : 2;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="메뉴 열기"
      className={`inline-flex flex-col items-end justify-center ${className}`}
      style={{ height: `${size}px`, width: `${size}px`, gap: `${gap}px` }}
    >
      <span
        aria-hidden
        className={`block rounded-full ${top}`}
        style={{ height: `${thickness}px`, width: `${longW}px` }}
      />
      <span
        aria-hidden
        className="block rounded-full bg-white"
        style={{ height: `${thickness}px`, width: `${shortW}px` }}
      />
      <span
        aria-hidden
        className="block rounded-full bg-white"
        style={{ height: `${thickness}px`, width: `${longW}px` }}
      />
    </button>
  );
}

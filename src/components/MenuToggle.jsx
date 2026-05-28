import menuIcon from "../assets/Menu.svg";

/**
 * MenuToggle — Menu.svg 아이콘 버튼
 *
 * HeaderHero: size 24 (모바일/태블릿에서 노출)
 * HeaderScrollActive: size 30
 *
 * accent prop은 호환성을 위해 받지만 SVG 자체 색상을 사용하므로 효과 없음.
 */
export default function MenuToggle({
  onClick,
  // eslint-disable-next-line no-unused-vars
  accent = "red",
  size = 24,
  className = "",
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="메뉴 열기"
      className={`inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ height: `${size}px`, width: `${size}px` }}
    >
      <img
        src={menuIcon}
        alt=""
        aria-hidden
        width={size}
        height={size}
        draggable="false"
        className="block select-none"
        style={{ width: `${size}px`, height: `${size}px` }}
      />
    </button>
  );
}

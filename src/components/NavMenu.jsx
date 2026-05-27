const MENU = [
  { label: "회사소개", href: "/about" },
  { label: "도입사례", href: "/cases" },
  { label: "서비스안내", href: "/services" },
  { label: "상품가이드", href: "/products" },
];

export default function NavMenu({ size = 16, fontClass = "font-semibold", className = "" }) {
  return (
    <nav aria-label="글로벌 네비게이션" className={className}>
      <ul className="flex items-center gap-[30px]">
        {MENU.map((item) => (
          <li key={item.href}>
            <a
              href={item.href}
              className={`typo-nav text-white ${fontClass} transition-colors hover:text-[var(--color-brand-peach)]`}
              style={{ fontSize: `${size}px` }}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

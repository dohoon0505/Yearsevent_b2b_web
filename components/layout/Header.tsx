"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/shared/Container";
import { MobileNav } from "@/components/layout/MobileNav";

const navLinks = [
  { href: "/about", label: "회사소개" },
  { href: "/service", label: "서비스" },
  { href: "/inquiry", label: "도입문의" },
];

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const isHome = pathname === "/";
  const transparentMode = isHome && !scrolled;

  React.useEffect(() => {
    if (!isHome) return;
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-colors duration-300",
        transparentMode
          ? "bg-transparent"
          : "bg-white/85 backdrop-blur-md border-b border-border shadow-[0_1px_0_rgba(0,0,0,0.04)]",
      )}
    >
      <Container className="flex h-16 items-center justify-between md:h-20">
        <Link
          href="/"
          aria-label="Years 홈"
          className={cn(
            "flex items-center gap-2 text-lg font-bold tracking-tight",
            transparentMode ? "text-white" : "text-foreground",
          )}
        >
          <span
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-md text-sm font-bold",
              transparentMode
                ? "bg-white/15 text-white ring-1 ring-white/30"
                : "bg-primary text-primary-foreground",
            )}
          >
            Y
          </span>
          <span>Years</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-md transition-colors",
                  transparentMode
                    ? "text-white/85 hover:text-white hover:bg-white/10"
                    : "text-foreground/75 hover:text-foreground hover:bg-muted",
                  active &&
                    (transparentMode
                      ? "text-white"
                      : "text-foreground bg-muted"),
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:block">
          <Button asChild variant={transparentMode ? "brand" : "default"}>
            <Link href="/inquiry">도입 문의하기</Link>
          </Button>
        </div>

        <button
          type="button"
          aria-label="메뉴 열기"
          onClick={() => setMobileOpen(true)}
          className={cn(
            "md:hidden inline-flex h-10 w-10 items-center justify-center rounded-md transition-colors",
            transparentMode
              ? "text-white hover:bg-white/10"
              : "text-foreground hover:bg-muted",
          )}
        >
          <Menu className="h-5 w-5" />
        </button>
      </Container>

      <MobileNav open={mobileOpen} onOpenChange={setMobileOpen} />
    </header>
  );
}

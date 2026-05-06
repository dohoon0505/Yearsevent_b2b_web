"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/about", label: "회사소개" },
  { href: "/service", label: "서비스" },
  { href: "/inquiry", label: "도입문의" },
];

interface MobileNavProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileNav({ open, onOpenChange }: MobileNavProps) {
  const pathname = usePathname();
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[85%] sm:max-w-sm">
        <SheetHeader>
          <SheetTitle className="text-left text-base">Years</SheetTitle>
        </SheetHeader>
        <nav className="mt-8 flex flex-col gap-1">
          {navLinks.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => onOpenChange(false)}
                className={cn(
                  "rounded-md px-3 py-3 text-base font-medium transition-colors",
                  active
                    ? "bg-muted text-foreground"
                    : "text-foreground/75 hover:bg-muted hover:text-foreground",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-6">
          <Button
            asChild
            variant="default"
            size="lg"
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            <Link href="/inquiry">도입 문의하기</Link>
          </Button>
        </div>
        <p className="mt-8 text-xs leading-6 text-muted-foreground">
          10년 신뢰의 B2B 꽃배달 파트너
          <br />
          평일 09:00 – 18:00 운영
        </p>
      </SheetContent>
    </Sheet>
  );
}

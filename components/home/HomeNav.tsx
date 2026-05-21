"use client";

import * as React from "react";
import Link from "next/link";

/**
 * 홈 전용 네비게이션
 * - 프로모션 바(48px) 바로 아래 고정
 * - 스크롤 스냅 진행에 따라 흰 배경/투명 토글
 */
const links = [
  { href: "#about", label: "회사소개" },
  { href: "#warning", label: "유통구조" },
  { href: "#benefits", label: "핵심혜택" },
  { href: "#cases", label: "도입사례" },
  { href: "#stats", label: "실적" },
];

export function HomeNav() {
  return (
    <header
      className="fixed inset-x-0 top-12 z-[90] flex h-16 items-center border-b border-black/5 backdrop-blur"
      style={{ backgroundColor: "rgba(255,255,255,0.92)" }}
    >
      <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between px-6 lg:px-10">
        <Link
          href="/"
          className="flex items-center gap-2 text-[17px] font-extrabold"
          style={{ color: "#231F20", letterSpacing: "-0.01em" }}
          aria-label="올해의경조사 홈"
        >
          <span
            className="flex h-7 w-7 items-center justify-center rounded-md text-[13px] font-extrabold text-white"
            style={{ backgroundColor: "#CB0D35" }}
          >
            Y
          </span>
          올해의경조사
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-md px-4 py-2 text-[14px] font-medium transition-colors hover:bg-black/5"
              style={{ color: "#231F20", letterSpacing: "-0.01em" }}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <Link
          href="/inquiry"
          className="inline-flex h-10 items-center justify-center rounded-md px-5 text-[13px] font-semibold text-white transition-colors"
          style={{ backgroundColor: "#231F20", letterSpacing: "-0.01em" }}
        >
          도입 문의하기
        </Link>
      </div>
    </header>
  );
}

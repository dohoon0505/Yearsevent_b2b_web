"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * 최상단 프로모션 바
 * - position: fixed; top: 0; height: 48px;
 * - bg #231F20 / text #FFFFFF
 * - 화살표 hover 트랜지션
 */
export function PromoBar() {
  return (
    <div
      className="fixed inset-x-0 top-0 z-[100] flex h-12 items-center justify-center"
      style={{ backgroundColor: "#231F20", color: "#FFFFFF" }}
    >
      <Link
        href="/inquiry"
        className="group inline-flex items-center gap-2 text-[13px] font-medium"
        style={{ letterSpacing: "-0.01em" }}
      >
        <span>도입 희망 기업 5만원 무료이용권 증정</span>
        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1.5" />
      </Link>
    </div>
  );
}

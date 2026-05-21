"use client";

import { MessageCircle } from "lucide-react";

/**
 * 플로팅 CTA — fixed bottom-right
 * bg #CB0D35 + pulse 애니메이션, 클릭 시 카카오톡 채널 새 창
 */
export function FloatingCTA() {
  return (
    <a
      href="https://pf.kakao.com/"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="카카오톡 채널로 상담하기"
      className="fixed bottom-8 right-8 z-[200] inline-flex items-center gap-2 rounded-full px-5 py-4 text-[14px] font-bold text-white shadow-[0_12px_32px_rgba(203,13,53,0.35)] transition-transform hover:scale-[1.04] animate-y-pulse"
      style={{ backgroundColor: "#CB0D35", letterSpacing: "-0.01em" }}
    >
      <MessageCircle className="h-5 w-5" />
      카카오톡 상담
    </a>
  );
}

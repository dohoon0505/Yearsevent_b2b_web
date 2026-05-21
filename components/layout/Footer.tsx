"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "@/components/shared/Container";

const footerNav = [
  {
    title: "서비스",
    links: [
      { href: "/service", label: "B2B 꽃배달 서비스" },
      { href: "/service#web3", label: "WEB 3.0 인트라넷" },
      { href: "/service#process", label: "도입 절차" },
    ],
  },
  {
    title: "회사",
    links: [
      { href: "/about", label: "회사소개" },
      { href: "/about#achievements", label: "주요 실적" },
      { href: "/inquiry", label: "도입문의" },
    ],
  },
  {
    title: "고객지원",
    links: [
      { href: "/inquiry", label: "도입 상담" },
      { href: "mailto:partner@years.kr", label: "이메일 문의" },
      { href: "tel:02-0000-0000", label: "전화 02-0000-0000" },
    ],
  },
];

export function Footer() {
  const pathname = usePathname();
  // 홈은 풀페이지 스크롤 전용 — 글로벌 푸터 숨김
  if (pathname === "/") return null;

  return (
    <footer className="bg-primary text-primary-foreground">
      <Container className="py-14 md:py-20">
        <div className="grid gap-10 md:grid-cols-[1.4fr_2fr]">
          <div>
            <div className="flex items-center gap-2 text-xl font-bold">
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-white/10 ring-1 ring-white/20">
                Y
              </span>
              <span>Years</span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-7 text-white/65">
              10년 동안 온라인과 오프라인을 연결하고 화훼업계를 활성화해 온
              직접 운영 B2B 꽃배달 파트너. 중간 마진을 편취하는 대행사가
              아닙니다.
            </p>
            <div className="mt-6 grid gap-1 text-sm text-white/60">
              <p>상호 : 주식회사 이어즈 (Years)</p>
              <p>대표 : ____ · 사업자등록번호 : 000-00-00000</p>
              <p>주소 : 대구광역시 ____ · 통신판매업 신고 : 0000-0000-0000</p>
              <p>고객센터 : 02-0000-0000 (평일 09:00 – 18:00)</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-3">
            {footerNav.map((group) => (
              <div key={group.title}>
                <h4 className="text-sm font-semibold text-white">
                  {group.title}
                </h4>
                <ul className="mt-4 space-y-3 text-sm text-white/65">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="transition-colors hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-12 flex flex-col-reverse items-start gap-4 border-t border-white/10 pt-6 text-xs text-white/50 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Years. All rights reserved.</p>
          <div className="flex gap-5">
            <Link
              href="#"
              className="transition-colors hover:text-white"
              aria-disabled
            >
              이용약관
            </Link>
            <Link
              href="#"
              className="transition-colors hover:text-white"
              aria-disabled
            >
              개인정보처리방침
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}

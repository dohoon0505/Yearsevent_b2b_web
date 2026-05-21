import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://years.kr"),
  title: {
    default: "Years | 10년 신뢰의 B2B 꽃배달 파트너",
    template: "%s | Years",
  },
  description:
    "법무·세무법인, 제조·도소매·기관을 위한 직접 운영 B2B 꽃배달 서비스. 35% 단가 할인, 전국 무료배송, 월 단위 자동정산, 50만원 책임배상 — 그리고 AI 간편발주 기반의 WEB 3.0 인트라넷.",
  keywords: [
    "B2B 꽃배달",
    "기업 꽃배달",
    "법무법인 화환",
    "경조사 화환",
    "조의화환",
    "축하화환",
    "Years",
    "꽃배달 제휴",
    "나라장터 꽃배달",
  ],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    title: "Years | 10년 신뢰의 B2B 꽃배달 파트너",
    description:
      "직접 운영 10년. 중간 대행이 아닌 실무자가 책임지는 기업 경조사 꽃배달 — 35% 할인 · 전국 무료배송 · 자동 정산 · 50만원 책임배상.",
    siteName: "Years",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className={inter.variable}>
      <head>
        <link
          rel="stylesheet"
          as="style"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="antialiased font-sans">
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <Toaster
          richColors
          position="top-center"
          toastOptions={{ className: "font-sans" }}
        />
      </body>
    </html>
  );
}

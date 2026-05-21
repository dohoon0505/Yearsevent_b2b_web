import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { heroStats } from "@/lib/data/achievements";

export function Hero() {
  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-white">
      {/* Sky-blue gradient atmospheric wash — hero only */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,#cfe7ff_0%,transparent_60%)]"
      />

      <Container className="relative flex min-h-[100svh] flex-col pb-12 pt-28 md:pt-36 lg:pt-40">
        {/* Badge pill */}
        <div className="inline-flex w-fit items-center gap-2 rounded-full bg-[#f0f0f3] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.88px] text-[#171717]">
          <ShieldCheck className="h-3.5 w-3.5" />
          10년 운영 · 직접 실무자 · 나라장터 낙찰
        </div>

        {/* Display headline — display-mega token */}
        <h1 className="mt-6 max-w-4xl font-display text-[clamp(40px,7vw,64px)] font-semibold leading-[1.05] tracking-[-0.03em] text-[#171717] md:mt-10">
          중간 대행이 아닌,
          <br />
          직접 운영하는 꽃배달
        </h1>

        {/* Spacer */}
        <div className="min-h-12 flex-1" />

        {/* Bottom split: subtitle + CTAs (left) / description (right) */}
        <div className="grid gap-8 md:grid-cols-2 md:items-end md:gap-16">
          <div>
            <p className="text-[18px] font-semibold leading-[1.4] text-[#171717]">
              B2B 꽃배달 파트너 Years
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              {/* Primary CTA — black, rounded-md (8px) */}
              <Link
                href="/inquiry"
                className="inline-flex h-10 items-center gap-2 rounded-[8px] bg-black px-[18px] text-[14px] font-medium leading-none text-white transition-colors hover:bg-[#1a1a1a]"
              >
                도입 문의하기
                <ArrowRight className="h-4 w-4" />
              </Link>
              {/* Secondary CTA — white card, hairline-strong border */}
              <Link
                href="/service"
                className="inline-flex h-10 items-center rounded-[8px] border border-[#dcdee0] bg-white px-[17px] text-[14px] font-medium leading-none text-[#171717] transition-colors hover:bg-[#fafafa]"
              >
                서비스 더 알아보기
              </Link>
            </div>
          </div>

          <p className="max-w-md text-[16px] leading-[1.6] text-[#60646c] md:ml-auto">
            법무 · 세무법인, 제조 · 도소매 · 유통 기업, 그리고 단체와 기관까지.
            경조사가 잦은 조직을 위해 10년간 화훼업계를 직접 운영해 온 B2B 전문
            파트너입니다.
          </p>
        </div>

        {/* Stats — hairline divider + caption-uppercase labels */}
        <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-[#f0f0f3] pt-8 md:mt-14 md:grid-cols-4">
          {heroStats.map((stat) => (
            <div key={stat.label}>
              <dt className="text-[11px] font-semibold uppercase tracking-[0.88px] text-[#999999]">
                {stat.label}
              </dt>
              <dd className="mt-1.5 font-display text-[28px] font-semibold leading-[1.2] tracking-[-0.03em] text-[#171717] md:text-[32px]">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}

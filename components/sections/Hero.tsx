import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/shared/Container";
import { heroStats } from "@/lib/data/achievements";

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-primary text-white">
      {/* Background gradient + decorative */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_70%_0%,oklch(0.45_0.13_250/0.55)_0%,transparent_70%),radial-gradient(40%_60%_at_10%_100%,oklch(0.62_0.18_250/0.35)_0%,transparent_70%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,oklch(0.18_0.04_260/0.85)_0%,oklch(0.18_0.04_260)_100%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-20 bg-[url('https://images.unsplash.com/photo-1487530811176-3780de880c2d?auto=format&fit=crop&w=2000&q=70')] bg-cover bg-center opacity-30"
      />

      <Container className="relative pt-32 pb-24 md:pt-44 md:pb-32 lg:pt-52 lg:pb-40">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-medium tracking-wider text-white/85 backdrop-blur">
            <ShieldCheck className="h-3.5 w-3.5" />
            10년 운영 · 직접 실무자 · 나라장터 낙찰
          </div>
          <h1 className="mt-6 text-4xl font-bold leading-[1.15] tracking-tight md:text-6xl lg:text-7xl">
            중간 대행이 아닌,
            <br />
            <span className="bg-gradient-to-br from-white via-white to-white/60 bg-clip-text text-transparent">
              직접 운영하는 꽃배달
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-white/75 md:text-lg md:leading-8">
            법무 · 세무법인, 제조 · 도소매 · 유통 기업, 그리고 단체와 기관까지.
            경조사가 잦은 조직을 위해 10년간 화훼업계를 직접 운영해 온 B2B
            전문 파트너 — Years 입니다.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Button asChild size="xl" variant="brand">
              <Link href="/inquiry">
                도입 문의하기
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="xl"
              variant="outline"
              className="border-white/30 bg-white/0 text-white hover:bg-white/10 hover:text-white"
            >
              <Link href="/service">서비스 더 알아보기</Link>
            </Button>
          </div>
        </div>

        <dl className="mt-16 grid grid-cols-2 gap-y-8 gap-x-6 border-t border-white/10 pt-10 md:mt-24 md:grid-cols-4">
          {heroStats.map((stat) => (
            <div key={stat.label}>
              <dt className="text-xs font-medium uppercase tracking-[0.2em] text-white/55">
                {stat.label}
              </dt>
              <dd className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}

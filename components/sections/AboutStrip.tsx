import { Container } from "@/components/shared/Container";
import { FadeIn } from "@/components/shared/FadeIn";
import { targetIndustries } from "@/lib/data/partners";

export function AboutStrip() {
  return (
    <section className="bg-background py-20 md:py-28">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[1.1fr_1.4fr] lg:gap-20">
          <FadeIn>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
              About Years
            </p>
            <h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight md:text-4xl lg:text-5xl">
              경조사가 많은 조직에는
              <br />
              전담 꽃배달 파트너가 필요합니다.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground md:text-lg md:leading-8">
              법무법인 · 세무법인 · 제조업 · 도소매 · 유통 · 모임 · 단체에서는
              경조사가 자주 발생합니다. Years는 10년 전통의 직접 운영 기업으로
              성공적인 비즈니스를 위해 편리하고 전문성 있는 꽃배달을 제공합니다.
            </p>
          </FadeIn>

          <div className="grid gap-3 sm:grid-cols-2">
            {targetIndustries.map((industry, idx) => (
              <FadeIn key={industry.title} delay={idx * 0.05}>
                <div className="h-full rounded-xl border bg-card p-5 transition-colors hover:border-brand/40 hover:bg-brand/[0.03]">
                  <p className="text-sm font-semibold text-foreground">
                    {industry.title}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {industry.description}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

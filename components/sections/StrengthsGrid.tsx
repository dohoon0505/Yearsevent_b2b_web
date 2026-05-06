import { Container } from "@/components/shared/Container";
import { FadeIn } from "@/components/shared/FadeIn";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { strengths } from "@/lib/data/strengths";

export function StrengthsGrid() {
  return (
    <section className="relative overflow-hidden bg-muted/40 py-24 md:py-32">
      <Container>
        <SectionHeading
          eyebrow="Partner Benefits"
          title={
            <>
              제휴 기업에게 제공하는
              <br />
              <span className="text-brand">4가지 확정 혜택</span>
            </>
          }
          description="복잡한 협상이나 등급 조건 없이, 도입 즉시 적용되는 표준 혜택입니다. 매월 자동으로 정산되어 행정 부담도 줄어듭니다."
        />

        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {strengths.map((item, idx) => {
            const Icon = item.icon;
            return (
              <FadeIn key={item.highlight} delay={idx * 0.06}>
                <article className="group relative h-full overflow-hidden rounded-2xl border bg-card p-7 transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-lg">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
                    <Icon className="h-6 w-6" strokeWidth={1.6} />
                  </div>
                  <p className="mt-6 text-sm font-medium uppercase tracking-wider text-muted-foreground">
                    {item.title}
                  </p>
                  <p className="mt-1 text-2xl font-bold tracking-tight text-foreground md:text-[1.75rem]">
                    {item.highlight}
                  </p>
                  <p className="mt-4 text-sm leading-7 text-muted-foreground">
                    {item.description}
                  </p>
                  <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brand/5 blur-2xl transition-opacity group-hover:opacity-100 opacity-0" />
                </article>
              </FadeIn>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

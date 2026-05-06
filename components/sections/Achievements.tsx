import { Award, Building2 } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { FadeIn } from "@/components/shared/FadeIn";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { achievements } from "@/lib/data/achievements";

const icons = [Building2, Award];

export function Achievements({ id }: { id?: string }) {
  return (
    <section id={id} className="bg-background py-24 md:py-32">
      <Container>
        <SectionHeading
          eyebrow="Years 2026"
          title={
            <>
              공공·기관이 검증한
              <br />
              <span className="text-brand">신뢰의 실적</span>
            </>
          }
          description="단순한 마케팅 수치가 아닌, 공공기관의 입찰과 대학의 정식 협력으로 확인된 운영 신뢰성입니다."
        />

        <div className="mt-14 grid gap-5 md:grid-cols-2">
          {achievements.map((item, idx) => {
            const Icon = icons[idx % icons.length];
            return (
              <FadeIn key={item.title} delay={idx * 0.08}>
                <article className="group h-full rounded-2xl border bg-card p-8 transition-colors hover:border-brand/40 md:p-10">
                  <div className="flex items-start justify-between">
                    <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-brand/10 text-brand">
                      <Icon className="h-7 w-7" strokeWidth={1.5} />
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      {item.marker} {item.year}
                    </span>
                  </div>
                  <h3 className="mt-8 text-xl font-bold tracking-tight md:text-2xl">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground md:text-base md:leading-8">
                    {item.description}
                  </p>
                </article>
              </FadeIn>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

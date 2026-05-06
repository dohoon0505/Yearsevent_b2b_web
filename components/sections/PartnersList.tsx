import { Container } from "@/components/shared/Container";
import { FadeIn } from "@/components/shared/FadeIn";
import { partnerCompanies } from "@/lib/data/partners";

export function PartnersList() {
  return (
    <section className="bg-muted/40 py-24 md:py-32">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.6fr] lg:items-start lg:gap-16">
          <FadeIn>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
              Partners
            </p>
            <h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight md:text-4xl lg:text-5xl">
              Years와 함께하는
              <br />
              기업·기관
            </h2>
            <p className="mt-5 max-w-md text-base leading-7 text-muted-foreground">
              로고가 아닌 텍스트로 정직하게 기재합니다. 다음의 기업·기관이 실제로
              Years의 B2B 꽃배달을 이용 중입니다.
            </p>
          </FadeIn>

          <FadeIn delay={0.08}>
            <ul className="grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
              {partnerCompanies.map((name) => (
                <li
                  key={name}
                  className="flex items-center gap-3 border-b border-border/60 py-3 text-sm font-medium text-foreground/85 md:text-base"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                  {name}
                </li>
              ))}
            </ul>
          </FadeIn>
        </div>
      </Container>
    </section>
  );
}

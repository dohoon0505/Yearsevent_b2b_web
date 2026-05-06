import { Check } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { FadeIn } from "@/components/shared/FadeIn";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Badge } from "@/components/ui/badge";
import { web3Features } from "@/lib/data/web3-features";

export function Web3Showcase({ id = "web3" }: { id?: string }) {
  return (
    <section
      id={id}
      className="bg-background py-24 md:py-32"
    >
      <Container>
        <SectionHeading
          eyebrow="WEB 3.0 Intranet"
          title={
            <>
              제휴 기업 전용
              <br />
              <span className="text-brand">All-In-One 처리 시스템</span>
            </>
          }
          description="자사에서 직접 제작한 내부 인트라넷 시스템. 발주부터 알림 · 정산 · 회계까지 한 화면에서 끝냅니다."
        />

        <div className="mt-16 space-y-20 md:mt-24 md:space-y-28">
          {web3Features.map((feature, idx) => {
            const Icon = feature.icon;
            const reverse = idx % 2 === 1;
            return (
              <FadeIn key={feature.index}>
                <div
                  className={
                    "grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16"
                  }
                >
                  <div className={reverse ? "lg:order-2" : ""}>
                    <Badge variant="outline" className="border-brand/30 text-brand">
                      {feature.index}
                    </Badge>
                    <div className="mt-4 flex items-center gap-3">
                      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
                        <Icon className="h-6 w-6" strokeWidth={1.6} />
                      </span>
                      <h3 className="text-2xl font-bold tracking-tight md:text-3xl">
                        {feature.title}
                      </h3>
                    </div>
                    <p className="mt-5 text-base leading-7 text-muted-foreground md:text-lg md:leading-8">
                      {feature.description}
                    </p>
                    <ul className="mt-7 grid gap-3">
                      {feature.bullets.map((bullet) => (
                        <li
                          key={bullet}
                          className="flex items-start gap-3 text-sm leading-7 text-foreground/80 md:text-base"
                        >
                          <span className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand/15 text-brand">
                            <Check className="h-3.5 w-3.5" strokeWidth={3} />
                          </span>
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div
                    className={
                      reverse ? "lg:order-1" : ""
                    }
                  >
                    <Web3MockPreview
                      label={feature.preview}
                      index={feature.index}
                    />
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

function Web3MockPreview({
  label,
  index,
}: {
  label: string;
  index: string;
}) {
  return (
    <div className="relative">
      <div className="absolute -inset-6 -z-10 rounded-[2.25rem] bg-gradient-to-br from-brand/10 via-transparent to-primary/10 blur-2xl" />
      <div className="overflow-hidden rounded-[1.75rem] border bg-card shadow-xl">
        <div className="flex items-center gap-1.5 border-b bg-muted/40 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
          <span className="ml-3 text-xs font-medium text-muted-foreground">
            years.kr / web3 / {label}
          </span>
        </div>
        <div className="grid gap-4 bg-gradient-to-br from-muted/40 to-background p-6 md:p-8">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand">
                Step {index}
              </p>
              <p className="mt-1 text-lg font-bold text-foreground">{label}</p>
            </div>
            <span className="rounded-full bg-brand/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-brand">
              Live
            </span>
          </div>
          <div className="grid gap-2.5">
            {[1, 2, 3].map((row) => (
              <div
                key={row}
                className="flex items-center justify-between rounded-lg border bg-background px-3 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="h-8 w-8 rounded-md bg-brand/10" />
                  <div>
                    <span className="block h-2 w-24 rounded bg-foreground/15" />
                    <span className="mt-1.5 block h-2 w-36 rounded bg-foreground/10" />
                  </div>
                </div>
                <span className="h-2 w-12 rounded bg-brand/30" />
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between rounded-lg bg-primary px-4 py-3 text-primary-foreground">
            <span className="text-xs font-medium">자동 진행 중</span>
            <span className="text-xs font-bold">●●●●○</span>
          </div>
        </div>
      </div>
    </div>
  );
}

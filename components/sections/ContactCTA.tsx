import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { Button } from "@/components/ui/button";

export function ContactCTA() {
  return (
    <section className="relative overflow-hidden bg-primary text-primary-foreground">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_70%_at_80%_0%,oklch(0.62_0.18_250/0.5)_0%,transparent_70%)]"
      />
      <Container className="relative grid gap-10 py-20 md:grid-cols-[1.5fr_1fr] md:items-center md:py-28">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
            Start with Years
          </p>
          <h2 className="mt-3 text-3xl font-bold leading-[1.15] tracking-tight md:text-4xl lg:text-5xl">
            지금 도입 상담을
            <br />
            시작해 보세요.
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-7 text-white/75 md:text-lg md:leading-8">
            도입 상담 신청부터 계약서 검토, WEB 3.0 인트라넷 회원 가입까지
            보통 1~2영업일 안에 완료됩니다. 현재 체결한 계약 형태와 무관하게
            상담만으로 단가 비교가 가능합니다.
          </p>
        </div>
        <div className="flex flex-col gap-3 md:items-end">
          <Button asChild size="xl" variant="brand" className="w-full md:w-auto">
            <Link href="/inquiry">
              도입 문의하기
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            size="xl"
            variant="outline"
            className="w-full border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white md:w-auto"
          >
            <Link href="/service">서비스 자세히 보기</Link>
          </Button>
        </div>
      </Container>
    </section>
  );
}

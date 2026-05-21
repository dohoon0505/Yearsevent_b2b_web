"use client";

import * as React from "react";
import { motion, useInView } from "motion/react";

/**
 * 슬롯머신 카운트업
 * - 각 자릿수(0~9)가 세로로 빠르게 회전하며 정답에 안착
 * - useInView로 섹션 진입 시점에 트리거
 */
function Digit({
  digit,
  delay,
  trigger,
  onColor,
}: {
  digit: number;
  delay: number;
  trigger: boolean;
  onColor: string;
}) {
  return (
    <span
      className="relative inline-block overflow-hidden align-bottom"
      style={{ height: "1em", width: "0.62em", lineHeight: 1 }}
    >
      <motion.span
        className="flex flex-col"
        initial={{ y: 0 }}
        animate={trigger ? { y: `-${digit}em` } : { y: 0 }}
        transition={{ duration: 2.2, delay, ease: [0.16, 1, 0.3, 1] }}
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <span
            key={n}
            className="flex items-center justify-center"
            style={{ height: "1em", color: onColor }}
          >
            {n}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

export function SlotCounter({
  value,
  color = "#FFFFFF",
}: {
  /** 표시할 정수 문자열 (예: "1,570,000") — 콤마는 그대로 유지 */
  value: string;
  color?: string;
}) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { amount: 0.55 });
  const chars = value.split("");

  return (
    <span ref={ref} className="inline-flex" style={{ color }}>
      {chars.map((c, i) => {
        if (/\d/.test(c)) {
          return (
            <Digit
              key={i}
              digit={parseInt(c, 10)}
              delay={i * 0.07}
              trigger={inView}
              onColor={color}
            />
          );
        }
        return (
          <span key={i} className="inline-block" style={{ color }}>
            {c}
          </span>
        );
      })}
    </span>
  );
}

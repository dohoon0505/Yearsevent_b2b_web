"use client";

import * as React from "react";
import { motion, type HTMLMotionProps } from "motion/react";

interface FadeUpProps extends HTMLMotionProps<"div"> {
  delay?: number;
  y?: number;
  once?: boolean;
}

/**
 * 풀페이지 스크롤 스냅 진입 시 시차 fade-in-up 등장 애니메이션
 */
export function FadeUp({
  children,
  delay = 0,
  y = 32,
  once = false,
  ...props
}: FadeUpProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      viewport={{ once, amount: 0.4 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

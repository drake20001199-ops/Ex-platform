"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

interface Props {
  value: string;
  className?: string;
  /** Start counting on mount instead of on scroll into view */
  immediate?: boolean;
}

function parseNumeric(val: string): { prefix: string; num: number; suffix: string } {
  const match = val.match(/^([^0-9]*)([0-9,.]+)(.*)$/);
  if (!match) return { prefix: "", num: 0, suffix: val };
  return {
    prefix: match[1],
    num: parseFloat(match[2].replace(/,/g, "")),
    suffix: match[3],
  };
}

function formatWithCommas(n: number, decimals: number): string {
  return n.toLocaleString("en-AU", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function AnimatedCounter({ value, className, immediate }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const scrollInView = useInView(ref, { once: true, margin: "-40px" });
  const shouldAnimate = immediate || scrollInView;
  const [display, setDisplay] = useState(immediate ? "0" : value);
  const hasRun = useRef(false);

  useEffect(() => {
    if (!shouldAnimate || hasRun.current) return;
    hasRun.current = true;

    const { prefix, num, suffix } = parseNumeric(value);
    if (num === 0) { setDisplay(value); return; }

    const decimals = value.includes(".")
      ? (value.split(".")[1]?.replace(/[^0-9]/g, "").length ?? 0)
      : 0;
    const duration = immediate ? 800 : 600;
    const steps = 40;
    const stepTime = duration / steps;
    const startDelay = immediate ? 500 : 0;
    let step = 0;

    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        step++;
        const progress = step / steps;
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(num * eased * Math.pow(10, decimals)) / Math.pow(10, decimals);
        setDisplay(`${prefix}${formatWithCommas(current, decimals)}${suffix}`);
        if (step >= steps) {
          clearInterval(interval);
          setDisplay(value);
        }
      }, stepTime);
    }, startDelay);

    return () => clearTimeout(timeout);
  }, [shouldAnimate, value, immediate]);

  return <span ref={ref} className={className}>{display}</span>;
}

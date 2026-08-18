import type { CSSProperties } from "react";
import { getBallColor } from "@/lib/lottery";

const SIZE_CLASSES = {
  sm: "h-8 w-8 text-xs",
  md: "h-11 w-11 text-sm",
  lg: "h-14 w-14 text-base",
} as const;

interface NumberBallProps {
  number: number;
  size?: keyof typeof SIZE_CLASSES;
  /** Outline used to mark a matched/selected number without extra motion. */
  emphasized?: boolean;
  /** Stagger delay in ms for the reveal animation; omit to skip animating. */
  revealDelayMs?: number;
  className?: string;
}

export function NumberBall({
  number,
  size = "md",
  emphasized = false,
  revealDelayMs,
  className,
}: NumberBallProps) {
  const style: CSSProperties = { backgroundColor: getBallColor(number) };
  if (revealDelayMs !== undefined) style.animationDelay = `${revealDelayMs}ms`;

  return (
    <div
      className={[
        "flex items-center justify-center rounded-full font-semibold text-neutral-950",
        SIZE_CLASSES[size],
        emphasized ? "ring-2 ring-neutral-50 ring-offset-2 ring-offset-neutral-950" : "",
        revealDelayMs !== undefined ? "ball-reveal" : "",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
    >
      {number}
    </div>
  );
}

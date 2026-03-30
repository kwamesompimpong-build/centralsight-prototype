import { cn } from "@/lib/utils";
import { CSSProperties } from "react";

export function MsIcon({
  name,
  className,
  filled,
  style,
}: {
  name: string;
  className?: string;
  filled?: boolean;
  style?: CSSProperties;
}) {
  return (
    <span
      className={cn("material-symbols-outlined", className)}
      style={{
        ...(filled ? { fontVariationSettings: "'FILL' 1" } : undefined),
        ...style,
      }}
    >
      {name}
    </span>
  );
}

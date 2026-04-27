import Image from "next/image";
import { cn } from "@/lib/utils";

type Props = {
  size?: "sm" | "md" | "lg";
  className?: string;
};

const SIZES = {
  sm: { w: 80, h: 28 },
  md: { w: 120, h: 40 },
  lg: { w: 160, h: 54 },
};

export function CambridgeBadge({ size = "md", className }: Props) {
  const dims = SIZES[size];
  return (
    <Image
      src="/images/cambridge-badge.svg"
      alt="Cambridge Authorised Preparation Centre"
      width={dims.w}
      height={dims.h}
      className={cn("inline-block", className)}
    />
  );
}

import { cn } from "@/lib/utils";

type Props = {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className,
}: Props) {
  return (
    <div
      className={cn(
        "mb-10 md:mb-12",
        align === "center" && "text-center",
        className
      )}
    >
      {eyebrow && (
        <span className="inline-block text-xs font-bold uppercase tracking-widest text-[var(--yellow-deep)] mb-3">
          {eyebrow}
        </span>
      )}
      <h2 className="font-fraunces text-3xl sm:text-4xl font-semibold text-[var(--navy-deep)] leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-[var(--text-muted)] max-w-xl mx-auto leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}
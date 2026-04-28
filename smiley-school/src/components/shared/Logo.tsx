interface LogoProps {
  variant?: "light" | "dark";
  className?: string;
}

export function Logo({ variant = "light", className = "h-9 w-auto" }: LogoProps) {
  const textColor = variant === "dark" ? "#FAFAF8" : "#0F1F3D";

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 48"
      fill="none"
      className={className}
      role="img"
      aria-label="Smiley School"
    >
      {/* Icon: rounded square background */}
      <rect x="2" y="6" width="36" height="36" rx="8" fill="#F4B942" />
      {/* Book page shadow */}
      <rect x="10" y="13" width="20" height="22" rx="2" fill="#0F1F3D" opacity="0.30" />
      {/* Book main page */}
      <rect x="8" y="11" width="20" height="22" rx="2" fill="#0F1F3D" />
      {/* Smiley eyes */}
      <circle cx="13" cy="20" r="1.5" fill="#F4B942" />
      <circle cx="21" cy="20" r="1.5" fill="#F4B942" />
      {/* Smiley mouth */}
      <path
        d="M11.5 25 Q17 29 22.5 25"
        stroke="#F4B942"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Wordmark */}
      <text
        x="48"
        y="21"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="15"
        fontWeight="700"
        fill={textColor}
        letterSpacing="-0.3"
      >
        Smiley
      </text>
      <text
        x="48"
        y="38"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="15"
        fontWeight="700"
        fill={textColor}
        letterSpacing="-0.3"
      >
        School
      </text>
      {/* Yellow accent dot */}
      <circle cx="107" cy="37" r="3" fill="#F4B942" />
    </svg>
  );
}
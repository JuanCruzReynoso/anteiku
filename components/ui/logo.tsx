import Image from "next/image";
import Link from "next/link";

type LogoVariant = "color" | "mono";

interface LogoProps {
  variant?: LogoVariant;
  size?: number;
  priority?: boolean;
  href?: string;
  className?: string;
}

const logos: Record<LogoVariant, { src: string; alt: string }> = {
  color: { src: "/logo-color.png", alt: "Anteiku Coffee" },
  mono: { src: "/logo-mono.png", alt: "Anteiku Coffee" },
};

export function Logo({
  variant = "color",
  size = 40,
  priority = false,
  href = "/",
  className,
}: LogoProps) {
  const logo = logos[variant];

  return (
    <Link href={href} className={className}>
      <Image
        src={logo.src}
        alt={logo.alt}
        width={size}
        height={size}
        priority={priority}
        className="rounded-full"
      />
    </Link>
  );
}

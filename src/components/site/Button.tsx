import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold tracking-wide transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60";

const variants = {
  primary: "bg-gold text-ink hover:bg-gold-light hover:-translate-y-0.5 shadow-lg shadow-gold/20",
  outline: "border border-gold/60 text-gold-light hover:bg-gold/10 hover:-translate-y-0.5",
  ghost: "text-parchment/80 hover:text-gold-light",
};

interface LinkButtonProps {
  href: string;
  variant?: keyof typeof variants;
  className?: string;
  children: ReactNode;
  external?: boolean;
}

export function LinkButton({
  href,
  variant = "primary",
  className = "",
  children,
  external = false,
}: LinkButtonProps) {
  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`${base} ${variants[variant]} ${className}`}
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </Link>
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
}

export function Button({ variant = "primary", className = "", children, ...props }: ButtonProps) {
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

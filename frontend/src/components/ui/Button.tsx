import { Link } from "react-router-dom";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "accent" | "secondary" | "outline" | "ghost" | "light";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-primary text-white hover:bg-primary-dark shadow-sm shadow-primary/30",
  accent: "bg-accent text-white hover:bg-accent-dark shadow-sm shadow-accent/30",
  secondary: "bg-secondary text-navy hover:brightness-95",
  outline: "border-2 border-primary text-primary hover:bg-primary hover:text-white",
  ghost: "text-navy hover:bg-slate-100",
  /** For dark/colored backgrounds */
  light: "border-2 border-white/70 text-white hover:bg-white hover:text-primary",
};

const SIZES: Record<Size, string> = {
  sm: "px-3 py-2 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  fullWidth?: boolean;
  /** If given, the button is rendered as a link */
  href?: string;
  children: ReactNode;
}

/** One button component for the whole app (can also act as a link). */
export default function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  fullWidth = false,
  href,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200",
    "hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-[0.97] disabled:hover:translate-y-0 disabled:hover:shadow-none disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100",
    VARIANTS[variant],
    SIZES[size],
    fullWidth && "w-full",
    className
  );

  if (href) {
    return (
      <Link to={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} disabled={disabled || isLoading} {...props}>
      {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

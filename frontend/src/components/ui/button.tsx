import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive" | "secondary" | "accent" | "success";
  size?: "default" | "sm" | "lg" | "icon";
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", isLoading = false, disabled, children, type, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 gap-2 relative";

    const variants: Record<string, string> = {
      default:
        "bg-gradient-to-r from-primary via-primary to-primary/90 text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 dark:shadow-primary/15 dark:hover:shadow-primary/25",
      outline:
        "border-2 border-primary bg-transparent text-primary hover:bg-primary/5 dark:hover:bg-primary/10 dark:border-primary/60",
      ghost:
        "text-text-secondary hover:bg-surface-2 hover:text-text-primary dark:text-text-muted dark:hover:bg-surface dark:hover:text-text-primary",
      destructive:
        "bg-gradient-to-r from-danger to-danger/80 text-white shadow-lg shadow-danger/25 hover:shadow-xl hover:shadow-danger/40 hover:-translate-y-0.5",
      secondary:
        "bg-surface-2 text-text-primary hover:bg-border border border-border/50 dark:hover:bg-border/20",
      accent:
        "bg-gradient-to-r from-accent to-accent/90 text-white shadow-lg shadow-accent/25 hover:shadow-xl hover:shadow-accent/40 hover:-translate-y-0.5",
      success:
        "bg-gradient-to-r from-success to-success/80 text-white shadow-lg shadow-success/25 hover:shadow-xl hover:shadow-success/40 hover:-translate-y-0.5",
    };

    const sizes: Record<string, string> = {
      default: "h-10 px-5 py-2 text-sm",
      sm: "h-8 px-3 py-1 text-xs",
      lg: "h-12 px-8 py-3 text-base",
      icon: "h-10 w-10",
    };

    const btnType = type ?? 'button';

    return (
      <button
        type={btnType}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading && (
          <>
            <svg aria-hidden="true" className="animate-spin -ml-1 mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="sr-only">Loading</span>
          </>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };

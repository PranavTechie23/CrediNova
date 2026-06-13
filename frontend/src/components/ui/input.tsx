import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', error, helperText, id, ...props }, ref) => {
    const helperId = helperText && id ? `${id}-helper` : undefined;
    return (
      <div className="w-full">
        <input
          id={id}
          type={type}
          aria-describedby={helperId}
          aria-invalid={error ? true : undefined}
          className={cn(
            "flex h-11 w-full rounded-lg border-2 bg-surface px-4 py-2.5 text-sm text-text-primary shadow-sm transition-all duration-200",
            "file:border-0 file:bg-transparent file:text-sm file:font-medium",
            "placeholder:text-text-muted/50",
            "focus:outline-none focus:border-primary focus:shadow-md focus:shadow-primary/10",
            error ? "border-danger/50 focus:border-danger focus:shadow-danger/10" : "border-border hover:border-border/60",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-surface-2",
            className
          )}
          ref={ref}
          {...props}
        />
        {helperText && (
          <p id={helperId} className={cn(
            "text-xs mt-1.5 font-medium",
            error ? "text-danger" : "text-text-muted"
          )}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };

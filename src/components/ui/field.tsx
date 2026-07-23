import { forwardRef } from "react";
import type { InputHTMLAttributes, LabelHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        "block text-xs font-semibold uppercase tracking-wide text-nexo-text-secondary mb-1.5",
        className,
      )}
      {...props}
    />
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full h-11 rounded-nexo-field border border-nexo-border bg-white px-3.5 text-sm text-nexo-text",
        "placeholder:text-nexo-text-secondary/70",
        "focus:border-nexo-lime-dark focus:outline-none focus:ring-2 focus:ring-nexo-lime/40",
        "disabled:bg-nexo-panel-bg disabled:text-nexo-text-secondary",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export function FieldError({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return (
    <p role="alert" className="mt-1.5 text-xs font-medium text-nexo-error">
      {children}
    </p>
  );
}

export function FormField({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      <FieldError>{error}</FieldError>
    </div>
  );
}

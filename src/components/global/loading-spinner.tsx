import { LoaderCircle } from "lucide-react";

type LoadingSpinnerProps = {
  label?: string;
  className?: string;
};

//good enough

/** A lightweight, theme-aware status indicator for route and client-side loading. */
export function LoadingSpinner({
  label = "Loading",
  className = "",
}: LoadingSpinnerProps) {
  return (
    <div
      aria-live="polite"
      className={`inline-flex items-center justify-center text-primary ${className}`}
      role="status"
    >
      <LoaderCircle aria-hidden="true" className="size-8 animate-spin" strokeWidth={1.75} />
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function PageLoading({ label = "Loading page" }: Pick<LoadingSpinnerProps, "label">) {
  return (
    <main className="flex min-h-dvh items-center justify-center px-6 text-foreground">
      <LoadingSpinner label={label} />
    </main>
  );
}

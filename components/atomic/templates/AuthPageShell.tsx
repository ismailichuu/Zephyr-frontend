import type { ReactNode } from "react";

import { cn } from "@/lib/utils/utils";

type AuthPageShellProps = {
  children: ReactNode;
  maxWidth?: "sm" | "md";
  className?: string;
};

export function AuthPageShell({
  children,
  maxWidth = "sm",
  className,
}: AuthPageShellProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div
        className={cn(
          "space-y-6",
          maxWidth === "sm" ? "w-full max-w-sm" : "w-full max-w-md",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}

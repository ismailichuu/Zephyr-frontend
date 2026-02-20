import Image from "next/image";

import { cn } from "@/lib/utils/utils";

type AppLogoProps = {
  label?: string;
  className?: string;
};

export function AppLogo({ label = "Zephyr", className }: AppLogoProps) {
  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <Image src="/logo.png" alt="Zephyr logo" width={32} height={32} />
      <span className="text-xl font-semibold text-foreground">{label}</span>
    </div>
  );
}

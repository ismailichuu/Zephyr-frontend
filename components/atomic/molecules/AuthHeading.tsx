import { cn } from "@/lib/utils/utils";

type AuthHeadingProps = {
  title: string;
  subtitle: string;
  className?: string;
};

export function AuthHeading({ title, subtitle, className }: AuthHeadingProps) {
  return (
    <div className={cn("text-center space-y-1", className)}>
      <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
    </div>
  );
}

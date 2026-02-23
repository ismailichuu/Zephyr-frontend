import { type LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/atomic/atoms";
import { cn } from "@/lib/utils/utils";

type AdminStatCardProps = {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
  trend: "up" | "down";
};

export function AdminStatCard({
  title,
  value,
  change,
  icon: Icon,
  trend,
}: AdminStatCardProps) {
  return (
    <Card className="py-4">
      <CardContent className="space-y-2 px-4">
        <div className="flex items-start justify-between gap-3">
          <span className="bg-muted text-muted-foreground inline-flex rounded-md p-2">
            <Icon className="size-4" />
          </span>
          <span
            className={cn(
              "text-xs font-semibold",
              trend === "up" ? "text-emerald-600" : "text-red-500"
            )}
          >
            {change}
          </span>
        </div>
        <div className="space-y-0.5">
          <p className="text-muted-foreground text-sm">{title}</p>
          <p className="text-base font-semibold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

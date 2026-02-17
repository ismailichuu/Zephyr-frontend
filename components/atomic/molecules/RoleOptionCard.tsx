import type { ReactNode } from "react";

import { Card } from "@/components/atomic/atoms";
import { cn } from "@/lib/utils/utils";

type RoleOptionCardProps = {
  id: string;
  title: string;
  description: string;
  icon: ReactNode;
  selected: boolean;
  onSelect: () => void;
};

export function RoleOptionCard({
  id,
  title,
  description,
  icon,
  selected,
  onSelect,
}: RoleOptionCardProps) {
  return (
    <Card
      key={id}
      onClick={onSelect}
      className={cn(
        "cursor-pointer flex flex-col items-center gap-3 rounded-xl border-2 p-6 text-center transition-all duration-200 hover:shadow-md",
        selected
          ? "border-primary bg-card-selected"
          : "border-border hover:border-muted-foreground/30"
      )}
    >
      <div
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-full transition-colors",
          selected ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
        )}
      >
        {icon}
      </div>
      <div>
        <h3 className="font-medium text-foreground">{title}</h3>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </div>
    </Card>
  );
}

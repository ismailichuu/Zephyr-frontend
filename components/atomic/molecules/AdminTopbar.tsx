import { Bell } from "lucide-react";

import { Button } from "@/components/atomic/atoms";

type AdminTopbarProps = {
  adminName?: string;
  sectionTitle?: string;
};

export function AdminTopbar({
  adminName = "Admin",
  sectionTitle = "Users",
}: AdminTopbarProps) {
  const initials = adminName
    .split(" ")
    .filter(Boolean)
    .map((name) => name[0]?.toUpperCase())
    .join("")
    .slice(0, 2);

  return (
    <header className="bg-card flex h-16 items-center justify-between gap-3 border-b px-4 md:px-6">
      <div className="min-w-0">
        <p className="text-sm font-semibold">{sectionTitle}</p>
        <p className="text-muted-foreground text-xs lg:hidden">Admin Panel</p>
      </div>

      <div className="flex min-w-0 items-center gap-2 md:gap-3">
        <Button type="button" variant="ghost" size="icon" className="relative">
          <Bell className="size-4" />
          <span className="bg-destructive absolute top-2 right-2 size-2 rounded-full" />
        </Button>
        <span className="max-w-24 truncate text-sm font-medium md:max-w-none">
          {adminName}
        </span>
        <span className="bg-primary text-primary-foreground grid size-8 place-items-center rounded-full text-xs font-semibold">
          {initials || "AD"}
        </span>
      </div>
    </header>
  );
}

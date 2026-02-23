import {
  BriefcaseBusiness,
  LayoutDashboard,
  LogOut,
  Users,
  Wallet,
} from "lucide-react";

import { Button } from "@/components/atomic/atoms";
import { cn } from "@/lib/utils/utils";
import Image from "next/image";

type AdminSidebarProps = {
  onLogout: () => void;
};

export const ADMIN_NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, active: false },
  { label: "Jobs", icon: BriefcaseBusiness, active: false },
  { label: "Payments", icon: Wallet, active: false },
  { label: "Users", icon: Users, active: true },
];

export function AdminSidebar({ onLogout }: AdminSidebarProps) {
  return (
    <aside className="bg-card sticky top-0 hidden h-screen w-full max-w-62 shrink-0 flex-col border-r lg:flex">
      <div className="border-b px-6 py-5">
        <div className="flex flex-row gap-1">
          <Image src='/logo.png' width={15} height={10} alt={""}/>
          <p className="text-sm font-semibold">Zephyr</p>
        </div>
        <p className="text-muted-foreground text-xs">Admin Panel</p>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-5">
        {ADMIN_NAV_ITEMS.map((item) => (
          <button
            key={item.label}
            type="button"
            className={cn(
              "text-muted-foreground hover:text-foreground hover:bg-muted flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm",
              item.active && "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
          >
            <item.icon className="size-4" />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="border-t p-3">
        <Button
          type="button"
          variant="ghost"
          className="text-muted-foreground hover:text-foreground w-full justify-start"
          onClick={onLogout}
        >
          <LogOut className="size-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
}

"use client";

import {
  BriefcaseBusiness,
  Clock3,
  DollarSign,
  Download,
  Filter,
  MoreVertical,
  Search,
  UsersRound,
} from "lucide-react";

import {
  Badge,
  Button,
  Card,
  CardContent,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/atomic/atoms";
import {
  ADMIN_NAV_ITEMS,
  AdminSidebar,
  AdminStatCard,
  AdminTopbar,
} from "@/components/atomic/molecules";

type AdminUserManagementProps = {
  adminName?: string;
  onLogout: () => void;
};

type TempUser = {
  id: string;
  name: string;
  email: string;
  type: "Freelancer" | "Client";
  joined: string;
  status: "Active" | "Suspended";
};

const TEMP_USERS: TempUser[] = [
  {
    id: "u-001",
    name: "Mohammed Ismail",
    email: "ismail@gmail.com",
    type: "Freelancer",
    joined: "Nov 2025",
    status: "Active",
  },
  {
    id: "u-002",
    name: "TechStart Inc",
    email: "techs@gmail.com",
    type: "Client",
    joined: "Nov 2025",
    status: "Active",
  },
  {
    id: "u-003",
    name: "Mohammed Ismail",
    email: "ismail@gmail.com",
    type: "Freelancer",
    joined: "Nov 2025",
    status: "Suspended",
  },
  {
    id: "u-004",
    name: "Mohammed Ismail",
    email: "ismail@gmail.com",
    type: "Freelancer",
    joined: "Nov 2025",
    status: "Active",
  },
  {
    id: "u-005",
    name: "Mohammed Ismail",
    email: "ismail@gmail.com",
    type: "Freelancer",
    joined: "Nov 2025",
    status: "Active",
  },
];

const STAT_CARDS = [
  {
    title: "Total Users",
    value: "12,453",
    change: "+ 12%",
    trend: "up" as const,
    icon: UsersRound,
  },
  {
    title: "Active Jobs",
    value: "1,234",
    change: "+ 8%",
    trend: "up" as const,
    icon: BriefcaseBusiness,
  },
  {
    title: "Total Revenue",
    value: "$543K",
    change: "+ 23%",
    trend: "up" as const,
    icon: DollarSign,
  },
  {
    title: "Pending Reviews",
    value: "232",
    change: "- 5%",
    trend: "down" as const,
    icon: Clock3,
  },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase())
    .join("")
    .slice(0, 2);
}

export default function AdminUserManagement({
  adminName,
  onLogout,
}: AdminUserManagementProps) {
  return (
    <div className="bg-muted/30 min-h-screen">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[248px_1fr]">
        <AdminSidebar onLogout={onLogout} />

        <main className="flex min-h-screen flex-col">
          <AdminTopbar adminName={adminName} sectionTitle="User Management" />

          <section className="space-y-4 p-4 sm:space-y-6 sm:p-5 md:p-8">
            <div className="bg-card flex items-center gap-2 overflow-x-auto rounded-lg border p-2 lg:hidden">
              {ADMIN_NAV_ITEMS.map((item) => (
                <Button
                  key={item.label}
                  type="button"
                  variant={item.active ? "default" : "ghost"}
                  size="sm"
                  className="shrink-0"
                >
                  <item.icon className="size-4" />
                  {item.label}
                </Button>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="ml-auto shrink-0"
                onClick={onLogout}
              >
                Logout
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {STAT_CARDS.map((item) => (
                <AdminStatCard
                  key={item.title}
                  title={item.title}
                  value={item.value}
                  change={item.change}
                  icon={item.icon}
                  trend={item.trend}
                />
              ))}
            </div>

            <Card className="py-0">
              <CardContent className="space-y-5 px-3 py-4 sm:px-4 md:px-6 md:py-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
                    <div className="relative w-full sm:max-w-sm">
                      <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                      <Input
                        placeholder="Search users..."
                        className="pl-9"
                        aria-label="Search users"
                      />
                    </div>
                    <Button type="button" variant="outline">
                      <Filter className="size-4" />
                      Filter
                    </Button>
                  </div>

                  <Button type="button" className="w-full sm:w-auto">
                    <Download className="size-4" />
                    Export
                  </Button>
                </div>

                <Table className="min-w-190">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {TEMP_USERS.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="bg-muted text-muted-foreground grid size-7 place-items-center rounded-full text-xs font-medium">
                              {getInitials(user.name)}
                            </span>
                            <span className="font-medium">{user.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {user.email}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{user.type}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {user.joined}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              user.status === "Active" ? "success" : "destructive"
                            }
                          >
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button type="button" variant="ghost" size="icon">
                            <MoreVertical className="size-4" />
                            <span className="sr-only">Open actions</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="text-muted-foreground flex flex-wrap items-center justify-end gap-2 text-xs">
                  <button type="button" className="hover:text-foreground">
                    1
                  </button>
                  <button type="button" className="hover:text-foreground">
                    2
                  </button>
                  <button type="button" className="hover:text-foreground">
                    3
                  </button>
                  <button type="button" className="hover:text-foreground">
                    Next
                  </button>
                </div>
              </CardContent>
            </Card>
          </section>
        </main>
      </div>
    </div>
  );
}

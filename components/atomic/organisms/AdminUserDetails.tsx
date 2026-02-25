"use client";

import {
  CalendarDays,
  Mail,
  MapPin,
  ShieldBan,
  Star,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDispatch } from "react-redux";

import { Badge, Button, Card, CardContent } from "@/components/atomic/atoms";
import {
  ADMIN_NAV_ITEMS,
  AdminSidebar,
  AdminTopbar,
} from "@/components/atomic/molecules";
import { adminAction } from "@/lib/api/admin/admin-action.api";
import { logOut } from "@/lib/api/auth/logout.api";
import { clearUser } from "@/store/slices/user.slice";
import { ROUTES } from "@/lib/constants/routes.constants";

type ActivityItem = {
  id: string;
  title: string;
  date: string;
  amount?: string;
};

export type AdminUserDetailsData = {
  userId: string;
  name: string;
  email: string;
  role: string;
  joinedAt: string | Date;
  status: string;
  location?: string;
  completedJobs?: number;
  totalEarnings?: string;
  rating?: number;
  disputes?: number;
  recentActivity?: ActivityItem[];
};

type AdminUserDetailsProps = {
  user: AdminUserDetailsData;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase())
    .join("")
    .slice(0, 2);
}

function formatDate(value: string | Date) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

type UserDetailsTab = "activity" | "jobs" | "payments";

export default function AdminUserDetails({ user }: AdminUserDetailsProps) {
  const dispatch = useDispatch();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<UserDetailsTab>("activity");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onLogoutHandler = async () => {
    try {
      await logOut();
      dispatch(clearUser());
      router.replace(ROUTES.SIGN_IN.ROOT);
    } catch {
      router.replace(ROUTES.SIGN_IN.ROOT);
    }
  };

  const isBlocked = user.status === "BLOCKED";

  const handleToggleBan = async () => {
    const nextStatus = isBlocked ? "ACTIVE" : "BLOCKED";
    setIsSubmitting(true);

    try {
      await adminAction(user.userId, nextStatus);
      router.refresh();
    } catch (error) {
      console.error("User status update failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-muted/30 min-h-screen">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[248px_1fr]">
        <AdminSidebar onLogout={onLogoutHandler} />

        <main className="flex min-h-screen flex-col">
          <AdminTopbar adminName="Admin" sectionTitle="User Details" />

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
                onClick={onLogoutHandler}
              >
                Logout
              </Button>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-xl font-semibold">User Details</h1>
                <p className="text-muted-foreground text-sm">
                  Manage user account and activity
                </p>
              </div>

              <Button
                type="button"
                variant={isBlocked ? "outline" : "destructive"}
                className="cursor-pointer rounded-full"
                onClick={handleToggleBan}
                disabled={isSubmitting}
              >
                <ShieldBan className="size-4" />
                {isBlocked ? "Unban User" : "Ban User"}
              </Button>
            </div>

            <Card className="rounded-xl">
              <CardContent className="space-y-5 p-5 md:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="bg-muted text-muted-foreground grid size-16 place-items-center rounded-full text-lg font-semibold">
                      {getInitials(user.name) || "U"}
                    </div>

                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-base font-semibold">{user.name}</h2>
                        <Badge
                          variant={isBlocked ? "destructive" : "success"}
                          className="rounded-full"
                        >
                          {isBlocked ? "Blocked" : "Active"}
                        </Badge>
                        <Badge className="rounded-full">{user.role}</Badge>
                      </div>

                      <div className="text-muted-foreground space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="size-3.5" />
                          ID: {user.userId}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="size-3.5" />
                          {user.location || "Ernakulam, Kochi"}
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="size-3.5" />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-muted-foreground flex items-center gap-2 text-sm">
                    <CalendarDays className="size-4" />
                    Joined {formatDate(user.joinedAt)}
                  </div>
                </div>

                <div className="bg-border h-px w-full" />

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div>
                    <p className="text-muted-foreground text-xs">Completed Jobs</p>
                    <p className="mt-1 text-sm font-semibold">
                      {user.completedJobs ?? 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Total Earnings</p>
                    <p className="mt-1 text-sm font-semibold">
                      {user.totalEarnings || "$0"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Rating</p>
                    <p className="mt-1 flex items-center gap-1 text-sm font-semibold">
                      {user.rating ?? 0}
                      <Star className="size-3.5 fill-yellow-400 text-yellow-400" />
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Disputes</p>
                    <p className="mt-1 text-sm font-semibold">{user.disputes ?? 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="inline-flex rounded-full bg-muted p-1">
              <button
                type="button"
                className={`cursor-pointer rounded-full px-4 py-1.5 text-xs font-medium ${
                  activeTab === "activity" ? "bg-card shadow-sm" : "text-muted-foreground"
                }`}
                onClick={() => setActiveTab("activity")}
              >
                Activity
              </button>
              <button
                type="button"
                className={`cursor-pointer rounded-full px-4 py-1.5 text-xs font-medium ${
                  activeTab === "jobs" ? "bg-card shadow-sm" : "text-muted-foreground"
                }`}
                onClick={() => setActiveTab("jobs")}
              >
                Jobs
              </button>
              <button
                type="button"
                className={`cursor-pointer rounded-full px-4 py-1.5 text-xs font-medium ${
                  activeTab === "payments" ? "bg-card shadow-sm" : "text-muted-foreground"
                }`}
                onClick={() => setActiveTab("payments")}
              >
                Payments
              </button>
            </div>

            <Card className="rounded-xl border-blue-500">
              <CardContent className="p-0">
                <div className="border-b px-5 py-4">
                  <h3 className="text-sm font-semibold">
                    {activeTab === "activity"
                      ? "Recent Activity"
                      : activeTab === "jobs"
                        ? "Recent Jobs"
                        : "Recent Payments"}
                  </h3>
                </div>

                {activeTab === "activity" ? (
                  <div className="divide-y">
                    {(user.recentActivity ?? []).length === 0 ? (
                      <p className="text-muted-foreground p-5 text-sm">
                        No recent activity available.
                      </p>
                    ) : (
                      (user.recentActivity ?? []).map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-3 px-5 py-4"
                        >
                          <div>
                            <p className="text-sm">{item.title}</p>
                            <p className="text-muted-foreground mt-1 text-xs">
                              {item.date}
                            </p>
                          </div>
                          {item.amount ? (
                            <p className="text-sm font-medium text-emerald-600">
                              {item.amount}
                            </p>
                          ) : null}
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground p-5 text-sm">
                    No {activeTab} data available.
                  </p>
                )}
              </CardContent>
            </Card>
          </section>
        </main>
      </div>
    </div>
  );
}

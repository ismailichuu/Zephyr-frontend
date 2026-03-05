"use client";

import {
  Ban,
  MoreVertical,
  Search,
  User,
  UserCheck,
  UsersRound,
  UserRound,
} from "lucide-react";

import {
  Badge,
  Button,
  Card,
  CardContent,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
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
import { logOut } from "@/lib/api/auth/logout.api";
import { clearUser } from "@/store/slices/user.slice";
import { useDispatch } from "react-redux";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { adminAction } from "@/lib/api/admin/admin-action.api";
import { ROUTES } from "@/lib/constants/routes.constants";
import { useToast } from "@/components/providers/toast-provider";

type UserType = {
  userId: string;
  name: string;
  email: string;
  role: string;
  joinedAt: Date;
  status: string;
  verified?: boolean;
  isOtpVerified?: boolean;
  isAdminApproved?: boolean;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase())
    .join("")
    .slice(0, 2);
}

type AdminUserManagmentProps = {
  users: UserType[];
  totalPages: number;
  currentPage: number;
  totalUser: number;
}


export default function AdminUserManagement({ users, totalPages, currentPage, totalUser }: AdminUserManagmentProps) {
  const dispatch = useDispatch();
  const router = useRouter();
  const toast = useToast();

  const [input, setInput] = useState('');
  const [pendingBlockUser, setPendingBlockUser] = useState<UserType | null>(null);
  const [isStatusSubmitting, setIsStatusSubmitting] = useState(false);
  const [verifyingUserId, setVerifyingUserId] = useState<string | null>(null);
  const onLogoutHandler = async () => {
    try {
      await logOut();
      dispatch(clearUser());
      router.replace(ROUTES.SIGN_IN.ROOT);
    } catch {
      router.replace(ROUTES.SIGN_IN.ROOT);
    }
  };

  const searchParams = useSearchParams();

  const handleStatusToggle = async (user: UserType) => {
    const nextStatus = user.status === "BLOCKED" ? "ACTIVE" : "BLOCKED";
    setIsStatusSubmitting(true);

    try {
      await adminAction(user.userId, nextStatus);
      router.refresh();
    } catch (error) {
      console.error("Admin action error:", error);
    } finally {
      setIsStatusSubmitting(false);
      setPendingBlockUser(null);
    }
  };

  const handleBlockAction = (user: UserType) => {
    if (user.status === "BLOCKED") {
      handleStatusToggle(user);
      return;
    }

    setPendingBlockUser(user);
  };

  const handleGoToDetails = (userId: string) => {
    router.push(ROUTES.ADMIN.USER_DETAILS.replace('[id]', userId));
  };

  const isClient = (role: string) => role.toLowerCase() === "client";

  const isUserVerified = (user: UserType) =>
    Boolean(user.verified ?? user.isAdminApproved ?? false);

  const handleVerifyClient = async (user: UserType) => {
    setVerifyingUserId(user.userId);
    try {
      await adminAction(user.userId, "VERIFY");
      toast.success('Client verified successfully');
      router.refresh();
    } catch (error) {
      console.error("Verify client error:", error);
    } finally {
      setVerifyingUserId(null);
    }
  };

  const changePage = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNumber.toString());
    params.set("search", input);

    router.push(`${ROUTES.ADMIN.ROOT}?${params.toString()}`, { scroll: false });
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams);

      if (input) {
        params.set('search', input);
      } else {
        params.delete('search');
      }

      params.set("page", "1");

      router.replace(`${ROUTES.ADMIN.ROOT}?${params.toString()}`, { scroll: false });
    }, 500);

    return () => clearTimeout(timeout);
  }, [input])

  return (
    <div className="bg-muted/30 min-h-screen">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[248px_1fr]">
        <AdminSidebar onLogout={onLogoutHandler} />

        <main className="flex min-h-screen flex-col">
          <AdminTopbar adminName={'Admin'} sectionTitle="User Management" />

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

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <AdminStatCard
                title={"Total Users"}
                value={totalUser.toString()}
                change={"+ 5%"}
                icon={UsersRound}
                trend={"up"}
              />
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
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        aria-label="Search users"
                      />
                    </div>
                    {/* <Button type="button" variant="outline">
                      <Filter className="size-4" />
                      Filter
                    </Button> */}
                  </div>

                  {/* <Button type="button" className="w-full sm:w-auto">
                    <Download className="size-4" />
                    Export
                  </Button> */}
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
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6}>
                          <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="mb-4">
                              <User className="w-12 h-12 text-muted-foreground" />
                            </div>

                            <h2 className="text-xl font-semibold">
                              No Users Found
                            </h2>

                            <p className="text-gray-500 mt-2 max-w-sm">
                              We couldn’t find any users matching your search.
                              Try changing the keyword.
                            </p>

                            {input && (
                              <Button
                                onClick={() => setInput("")}
                                className="mt-6 px-4 py-2 text-white rounded-md"
                              >
                                Clear Search
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => (
                        <TableRow key={user.userId}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="relative">
                                <span className="bg-muted text-muted-foreground grid size-7 place-items-center rounded-full text-xs font-medium">
                                  {getInitials(user.name)}
                                </span>
                                {isClient(user.role) && !isUserVerified(user) && (
                                  <span
                                    className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-red-500 ring-2 ring-white"
                                    aria-label="Client not verified"
                                  />
                                )}
                              </div>
                              <span className="font-medium">{user.name}</span>
                            </div>
                          </TableCell>

                          <TableCell className="text-muted-foreground">
                            {user.email}
                          </TableCell>

                          <TableCell>
                            <Badge variant="secondary">{user.role}</Badge>
                          </TableCell>

                          <TableCell className="text-muted-foreground">
                            {user.joinedAt &&
                              new Date(user.joinedAt).toDateString()}
                          </TableCell>

                          <TableCell>
                            <Badge
                              variant={
                                user.status === "ACTIVE"
                                  ? "success"
                                  : "destructive"
                              }
                            >
                              {user.status}
                            </Badge>
                          </TableCell>

                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="cursor-pointer"
                                  aria-label={`Open actions for ${user.name}`}
                                >
                                  <MoreVertical className="h-4 w-4" />
                                  <span className="sr-only">Open actions</span>
                                </Button>
                              </DropdownMenuTrigger>

                              <DropdownMenuContent align="end" className="w-52">
                                <DropdownMenuLabel className="truncate">
                                  {user.name}
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />

                                <DropdownMenuItem
                                  variant={
                                    user.status === "ACTIVE"
                                      ? "destructive"
                                      : "default"
                                  }
                                  className={
                                    user.status === "BLOCKED"
                                      ? "cursor-pointer text-green-600 focus:text-green-700"
                                      : "cursor-pointer"
                                  }
                                  onSelect={() => handleBlockAction(user)}
                                >
                                  {user.status === "BLOCKED" ? (
                                    <UserCheck className="size-4" />
                                  ) : (
                                    <Ban className="size-4" />
                                  )}
                                  {user.status === "BLOCKED"
                                    ? "Unblock User"
                                    : "Block User"}
                                  <DropdownMenuShortcut>
                                    {user.status === "BLOCKED"
                                      ? "ACTIVE"
                                      : "BLOCK"}
                                  </DropdownMenuShortcut>
                                </DropdownMenuItem>

                                {isClient(user.role) && (
                                  <DropdownMenuItem
                                    onSelect={() => {
                                      if (!isUserVerified(user)) {
                                        handleVerifyClient(user);
                                      }
                                    }}
                                    disabled={isUserVerified(user) || verifyingUserId === user.userId}
                                    className="cursor-pointer"
                                  >
                                    <UserCheck className="size-4" />
                                    {isUserVerified(user) ? "Client Verified" : "Verify Client"}
                                    <DropdownMenuShortcut>
                                      {verifyingUserId === user.userId ? "..." : "VERIFY"}
                                    </DropdownMenuShortcut>
                                  </DropdownMenuItem>
                                )}

                                <DropdownMenuItem
                                  onSelect={() => handleGoToDetails(user.userId)}
                                  className="cursor-pointer"
                                >
                                  <UserRound className="size-4" />
                                  Go to Details
                                  <DropdownMenuShortcut>OPEN</DropdownMenuShortcut>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>

                <div className="text-muted-foreground flex flex-wrap items-center justify-end gap-2 text-xs">
                  {[...Array(totalPages)].map((_, index) => {
                    const pageNumber = index + 1;
                    return (
                      <Button
                        key={pageNumber}
                        onClick={() => changePage(pageNumber)}
                        className={`hover:text-foreground p-1.5 px-3.5 text-white rounded-4xl
                          ${currentPage === pageNumber ? '' : 'bg-gray-400'}`}
                        disabled={currentPage === pageNumber}
                      >
                        {pageNumber}
                      </Button>
                    )
                  })}
                  {totalPages > 1 &&
                    <button type="button"
                      className="hover:text-foreground p-2 text-white bg-gray-400 rounded-2xl"
                      onClick={() => changePage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </button>
                  }
                </div>
              </CardContent>
            </Card>
          </section>
        </main>
      </div>

      {pendingBlockUser && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <div className="bg-card w-full max-w-md rounded-lg border p-6 shadow-xl">
            <h2 className="text-lg font-semibold">Confirm Block User</h2>
            <p className="text-muted-foreground mt-2 text-sm">
              Are you sure you want to block <strong>{pendingBlockUser.name}</strong>? They will
              lose access until unblocked.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPendingBlockUser(null)}
                disabled={isStatusSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => handleStatusToggle(pendingBlockUser)}
                disabled={isStatusSubmitting}
              >
                {isStatusSubmitting ? "Blocking..." : "Block User"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

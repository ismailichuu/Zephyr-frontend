"use client";

import {
  MoreVertical,
  Search,
  User,
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
import { logOut } from "@/lib/api/auth/logout.api";
import { clearUser } from "@/store/slices/user.slice";
import { useDispatch } from "react-redux";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type UserType = {
  id: string;
  name: string;
  email: string;
  role: string;
  joinedAt: Date;
  status: string;
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

  const [input, setInput] = useState('');
  const onLogoutHandler = async () => {
    try {
      await logOut();
      dispatch(clearUser());
      router.replace("/signin");
    } catch {
      router.replace("/signin");
    }
  };

  const searchParams = useSearchParams();
  const changePage = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNumber.toString());
    params.set("search", input);

    router.push(`/admin?${params.toString()}`, { scroll: false });
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

      router.replace(`/admin?${params.toString()}`, { scroll: false });
    }, 500);

    return () => clearTimeout(timeout);
  }, [input, router, searchParams])

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
                            <Button type="button" variant="ghost" size="icon">
                              <MoreVertical className="size-4" />
                              <span className="sr-only">Open actions</span>
                            </Button>
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
    </div>
  );
}

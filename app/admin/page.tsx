import { AdminUserManagement } from "@/components/atomic/organisms";
import { getAllUsers } from "@/lib/api/admin/get-all-users.api";

type Props = {
  searchParams: {
    page?: string;
    limit?: string;
    search?: string;
  }
}

export default async function AdminPage({ searchParams }: Props) {

  const params = await searchParams;

  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 6;
  const search = params.search || '';

  const res = await getAllUsers(page, limit, search);

  return (
    <AdminUserManagement 
      users={res.users}
      totalPages={res.totalPages}
      currentPage={page}
      totalUser={res.totalUser}
    />
  );
}

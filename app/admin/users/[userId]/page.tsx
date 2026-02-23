import {
  AdminUserDetails,
  type AdminUserDetailsData,
} from "@/components/atomic/organisms";
import { getUserDetails } from "@/lib/api/admin/get-user-details.api";

type UserDetailsResponse = {
  user?: Partial<AdminUserDetailsData>;
} & Partial<AdminUserDetailsData>;

type Props = {
  params: Promise<{
    userId: string;
  }>;
};

export default async function AdminUserDetailsPage({ params }: Props) {
  const { userId } = await params;
  const { user } = await getUserDetails(userId) as UserDetailsResponse;

  if (!user) {
    return <div>User not found</div>;
  }

  return <AdminUserDetails user={user as AdminUserDetailsData} />;
}

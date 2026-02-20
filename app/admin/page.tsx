"use client";

import { AdminUserManagement } from "@/components/atomic/organisms";
import { logOut } from "@/lib/api/auth/logout.api";
import type { RootState } from "@/store";
import { clearUser } from "@/store/slices/user.slice";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";

export default function AdminPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const userName = useSelector((state: RootState) => state.user.name);

  const onLogoutHandler = async () => {
    try {
      await logOut();
      dispatch(clearUser());
      router.replace("/signin");
    } catch {
      router.replace("/signin");
    }
  };

  return (
    <AdminUserManagement
      adminName={userName ?? "Admin"}
      onLogout={onLogoutHandler}
    />
  );
}

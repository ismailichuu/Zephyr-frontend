"use client"
import { Button } from "@/components/atomic/atoms";
import { logOut } from "@/lib/api/auth/logout.api";
import { clearUser } from "@/store/slices/user.slice";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";

export default function ClientPage() {
  const user = useSelector(state => state.user);
  const router = useRouter();
  const dispatch = useDispatch();

  const onLogoutHandler = async () => {
    try {
      await logOut();
      dispatch(clearUser());
      router.replace('/signin');
    } catch (err: unknown) {
      router.push('/signin');
    }
  }

  return (
    <>
      <div>
        <nav className="top-0 left-0 right-0 flex p-2 m-3 flex-row justify-between items-center" aria-label="Main navigation">
          <div className="flex items-center justify-center gap-2">
            <Image src={'/logo.png'} width={32} height={32} alt="Zephyr logo" />
            <span className="text-xl font-semibold text-foreground hidden sm:inline">
              Admin Panel
            </span>
          </div>
          <div className="flex gap-2 sm:gap-3">
            <Button className="rounded-full" onClick={onLogoutHandler}>
              Logout
            </Button>
          </div>
        </nav>
      </div>
      <section className="flex flex-row justify-center items-center ">
        <h2>Welcome! {user.name}</h2>
      </section>

    </>
  )
}


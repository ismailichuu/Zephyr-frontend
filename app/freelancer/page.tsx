"use client"
import { Button } from "@/components/atomic/atoms";
import { logOut } from "@/lib/api/auth/logout.api";
import { clearUser } from "@/store/slices/user.slice";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";

export default function ClientPage() {
  const user = useSelector(state => state.user);
  const router = useRouter();
  const dispatch = useDispatch();
  console.log(user)

  const onLogoutHandler = async () => {
    try {
      await logOut();
      dispatch(clearUser());
      router.replace('/signin');
    } catch (err) {
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
              Freelacer Portal
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
        <div className="flex flex-col items-center gap-3">
          <h2>Welcome! {user.name}</h2>
          <Button asChild className="rounded-full">
            <Link href="/freelancer/complete-profile">Complete Profile</Link>
          </Button>
        </div>
      </section>

    </>
  )
}


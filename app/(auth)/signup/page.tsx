"use client"
import { SignupForm } from "@/components/atomic/organisms";
import { redirect, useSearchParams } from "next/navigation";

export default function SignupPage() {
  const searchParams = useSearchParams();
  const role: string | null = searchParams.get('role');

  if(!role || role !== 'freelancer' && role !== 'client') {
    redirect("/signup/role-selection");
  }

  return <SignupForm role={role}/>
}


"use client";

import { Briefcase, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/atomic/atoms";
import { AppLogo, RoleOptionCard } from "@/components/atomic/molecules";
import { AuthPageShell } from "@/components/atomic/templates";
import { ROUTES } from "@/lib/constants/routes.constants";

type Role = "client" | "freelancer";
type RoleSelectorFlow = "signup" | "login";

const roles = [
  {
    id: "client" as const,
    title: "I'm a Client",
    desc: "Hire talented freelancers",
    icon: <User className="h-6 w-6" />,
  },
  {
    id: "freelancer" as const,
    title: "I'm a Freelancer",
    desc: "Find work and grow",
    icon: <Briefcase className="h-6 w-6" />,
  },
];

export default function RoleSelector({ flow = "signup" }: { flow?: RoleSelectorFlow }) {
  const [selectedRole, setSelectedRole] = useState<Role>("client");
  const router = useRouter();

  const handleContinue = () => {
    if (flow === "login") {
      const role = selectedRole.toUpperCase();
      const url = new URL("/auth/google", window.location.origin);
      url.searchParams.set("role", role);
      url.searchParams.set("isLogin", "true");
      url.searchParams.set("redirectOnError", "/signin");
      window.location.href = url.toString();
      return;
    }

    router.push(`${ROUTES.SIGNUP.ROOT}?role=${selectedRole}`);
  };

  return (
    <AuthPageShell maxWidth="md" className="space-y-8">
      <AppLogo />

      <p className="text-center text-muted-foreground">
        {flow === 'signup' ? 
            "Choose how you'd like to get started" : "Choose your previous Role"}</p>

      <div className="grid grid-cols-2 gap-4">
        {roles.map((role) => (
          <RoleOptionCard
            key={role.id}
            id={role.id}
            title={role.title}
            description={role.desc}
            icon={role.icon}
            selected={selectedRole === role.id}
            onSelect={() => setSelectedRole(role.id)}
          />
        ))}
      </div>

      <Button className="w-full cursor-pointer" size="lg" onClick={handleContinue}>
        Continue
      </Button>
      {flow === "login" && (
        <Button variant="link" className="w-full" onClick={() => router.replace(ROUTES.SIGN_IN.ROOT)}>
          Back to Sign In
        </Button>
      )}
    </AuthPageShell>
  );
}

import { AuthBfcacheGuard } from "@/components/providers/auth-bfcache-guard";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <AuthBfcacheGuard />
      {children}
    </>
  );
}

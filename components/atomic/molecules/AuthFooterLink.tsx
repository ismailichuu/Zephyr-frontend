import Link from "next/link";

import { Button } from "@/components/atomic/atoms";

type AuthFooterLinkProps = {
  label: string;
  href: string;
  action: string;
};

export function AuthFooterLink({ label, href, action }: AuthFooterLinkProps) {
  return (
    <p className="text-center text-sm text-muted-foreground">
      {label}{" "}
      <Button variant="link" className="h-auto p-0 font-medium">
        <Link href={href}>{action}</Link>
      </Button>
    </p>
  );
}

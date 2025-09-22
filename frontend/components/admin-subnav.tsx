"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

const links = [
  { href: "/admin", label: "Dashboard Home" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/challenges", label: "Challenges" },
  { href: "/admin/reports", label: "Reports" },
];

export function AdminSubnav() {
  const pathname = usePathname();
  const isActive = (href: string) => (pathname === href ? true : pathname.startsWith(href) && href !== "/admin");

  return (
    <nav className="flex flex-wrap items-center gap-2">
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={cn(
            buttonVariants({ variant: isActive(l.href) ? "secondary" : "outline", size: "sm" })
          )}
        >
          {l.label}
        </Link>
      ))}
    </nav>
  );
}

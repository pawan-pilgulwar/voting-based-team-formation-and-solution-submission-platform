import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Dashboard | Student-Led Collaboration Platform",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Lightweight role awareness for header and Home link
  const cookieStore = await cookies();
  const role = (cookieStore.get("role")?.value || "student") as
    | "student"
    | "mentor"
    | "organization"
    | "admin";

  const roleTitleMap: Record<string, string> = {
    student: "Student Dashboard",
    mentor: "Mentor Dashboard",
    organization: "Organization Dashboard",
    admin: "Admin",
  };

  const homeHref = role === "admin" ? "/admin" : `/dashboard/${role}`;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            {roleTitleMap[role] || "Dashboard"}
          </h1>
          <div className="flex items-center gap-2">
            <Button variant="secondary" asChild>
              <Link href={homeHref}>Home</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/challenges">Challenges</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/teams">Teams</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/projects">Projects</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/chat">Chat</Link>
            </Button>
          </div>
        </div>
        <Separator />
      </div>

      <div className="min-h-[50vh]">{children}</div>
    </div>
  );
}

"use client";

import Head from "next/head"
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Lightweight role awareness for header and Home link
  const { user, loading } = useAuth();
  const router = useRouter();

  // Guard: if not authenticated redirect to login
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/login");
    }
  }, [user, loading, router]);

  if (loading) return null;
  if (!user) return null;
  const role =
    user?.role ||
    ("student" as "student" | "mentor" | "organization" | "admin");

  const roleTitleMap: Record<string, string> = {
    student: "Student Dashboard",
    mentor: "Mentor Dashboard",
    organization: "Organization Dashboard",
    admin: "Admin",
  };

  const homeHref = role === "admin" ? "/admin" : `/dashboard/${role}`;

  return (
    <>
      <Head>
        <title>Dashboard | Student-Led Collaboration Platform</title>
        <meta name="description" content="This is a description for my page." />
        <meta name="keywords" content="nextjs, react, seo" />
        <meta property="og:title" content="Student-Led Collaboration Platform" />
      </Head>

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
    </>
  );
}

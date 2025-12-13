"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { adminListUsers, adminListProblems, adminListReports, adminListTeams } from "@/lib/api";
import Link from "next/link";

export default function AdminHomePage() {
  const [usersCount, setUsersCount] = useState<number | null>(null);
  const [problemsCount, setProblemsCount] = useState<number | null>(null);
  const [reportsCount, setReportsCount] = useState<number | null>(null);
  const [teamsCount, setTeamsCount] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [users, problems, reports, teams] = await Promise.all([
          adminListUsers().catch(() => []),
          adminListProblems().catch(() => []),
          adminListReports().catch(() => []),
          adminListTeams().catch(() => []),
        ]);
        setUsersCount(users?.length ?? 0);
        setProblemsCount(problems?.length ?? 0);
        setReportsCount(reports?.length ?? 0);
        setTeamsCount(teams?.length ?? 0);
      } catch (e) {
        setUsersCount(0);
        setProblemsCount(0);
        setReportsCount(0);
        setTeamsCount(0);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        <Link href="/admin/users">
          <Card>
            <CardHeader>
              <CardTitle>Total Users</CardTitle>
              <CardDescription>Registered on the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{usersCount ?? "—"}</div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/problems">
          <Card>  
            <CardHeader>
              <CardTitle>Active Challenges</CardTitle>
              <CardDescription>Open for submissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{problemsCount ?? "—"}</div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/reports">
          <Card>
            <CardHeader>
              <CardTitle>Reports Pending</CardTitle>
              <CardDescription>Needing admin review</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{reportsCount ?? "—"}</div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/teams">
          <Card>
            <CardHeader>
              <CardTitle>Total Teams</CardTitle>
              <CardDescription>Created by users</CardDescription>
            </CardHeader>
            <CardContent>
             <div className="text-3xl font-semibold">{teamsCount ?? "—"}</div>
            </CardContent>
         </Card> 
        </Link>
      </div>
    </div>
  );
}


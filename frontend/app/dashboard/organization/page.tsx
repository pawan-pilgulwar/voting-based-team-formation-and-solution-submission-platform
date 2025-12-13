"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { fetchProblems, fetchTeams, getSolutionsByTeam } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function OrganizationDashboardPage() {
  const [problemsCount, setProblemsCount] = useState<number | null>(null);
  const [participantsCount, setParticipantsCount] = useState<number | null>(null);
  const [submissionsCount, setSubmissionsCount] = useState<number | null>(null);

  const {user} = useAuth();

  useEffect(() => {
    const load = async () => {
      try {
        let problems: any[] = await fetchProblems();
        // problems = problems.filter((p: any) => p.postedBy === user?._id);
        const teams = await fetchTeams();
        const participants = teams.reduce((sum: number, t: any) => sum + (t.members?.length || 0), 0);

        // Count submissions across teams (best-effort)
        const solsLists = await Promise.all((teams || []).map((t: any) => getSolutionsByTeam(t._id).catch(() => [])));
        const submissions = solsLists.reduce((sum: number, s: any[]) => sum + (s?.length || 0), 0);

        setProblemsCount(problems?.length ?? 0);
        setParticipantsCount(participants ?? 0);
        setSubmissionsCount(submissions ?? 0);
      } catch (e) {
        setProblemsCount(0);
        setParticipantsCount(0);
        setSubmissionsCount(0);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Challenges</CardTitle>
            <CardDescription>Hosted so far</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{problemsCount ?? "—"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Active Participants</CardTitle>
            <CardDescription>Across all challenges</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{participantsCount ?? "—"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Submissions</CardTitle>
            <CardDescription>Awaiting review</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{submissionsCount ?? "—"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Avg. Rating</CardTitle>
            <CardDescription>Community feedback</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">—</div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Manage Posted Problems</CardTitle>
            <CardDescription>Create and track your organization problems</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/dashboard/organization/create-problem">Create Problem</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/problems">My Problems</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reports & Insights</CardTitle>
            <CardDescription>Track performance and outcomes</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button variant="secondary">Download Summary</Button>
            <Button variant="outline">Open Analytics</Button>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest events across hosted challenges</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>Recent activity loaded from platform</div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { fetchProblems, fetchTeams, getSolutionsByTeam, getSolutionsByProblem } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function OrganizationDashboardPage() {
  const [problemsCount, setProblemsCount] = useState<number | null>(null);
  const [participantsCount, setParticipantsCount] = useState<number | null>(null);
  const [submissionsCount, setSubmissionsCount] = useState<number | null>(null);
  const [pendingReviewCount, setPendingReviewCount] = useState<number | null>(null);
  const [orgProblems, setOrgProblems] = useState<any[]>([]);

  const {user} = useAuth();

  useEffect(() => {
    const load = async () => {
      try {
        // Fetch all problems and filter by organization
        let allProblems: any[] = await fetchProblems();
        const problems = allProblems.filter((p: any) => {
          const postedById = typeof p.postedBy === "string" ? p.postedBy : p.postedBy?._id;
          return postedById === user?._id;
        });
        
        setOrgProblems(problems);

        // Get teams for org's problems only
        const problemIds = problems.map((p: any) => p._id);
        let teams: any[] = [];
        for (const problemId of problemIds) {
          const teamsForProblem = await fetchTeams({ problemId }).catch(() => []);
          teams = [...teams, ...teamsForProblem];
        }

        const participants = new Set<string>();
        teams.forEach((t: any) => {
          t.members?.forEach((m: any) => {
            participants.add(typeof m.user === "string" ? m.user : m.user?._id);
          });
        });

        // Count submissions across org's teams
        const solsLists = await Promise.all(
          teams.map((t: any) => getSolutionsByTeam(t._id).catch(() => []))
        );
        const submissions = solsLists.reduce((sum: number, s: any[]) => sum + (s?.length || 0), 0);

        // Count pending reviews (under-review status)
        let pendingCount = 0;
        for (const problemId of problemIds) {
          const sols = await getSolutionsByProblem(problemId).catch(() => []);
          pendingCount += sols.filter((s: any) => s.status === "submitted" || s.status === "under-review").length;
        }

        setProblemsCount(problems?.length ?? 0);
        setParticipantsCount(participants.size);
        setSubmissionsCount(submissions ?? 0);
        setPendingReviewCount(pendingCount ?? 0);
      } catch (e) {
        setProblemsCount(0);
        setParticipantsCount(0);
        setSubmissionsCount(0);
        setPendingReviewCount(0);
      }
    };
    load();
  }, [user?._id]);

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
            <CardTitle>Mentor Reviews</CardTitle>
            <CardDescription>Review and evaluate team submissions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm">
              <div className="font-medium">Pending Reviews: {pendingReviewCount ?? "—"}</div>
              <p className="text-muted-foreground text-xs mt-1">Solutions awaiting evaluation</p>
            </div>
            <Button className="w-full" asChild>
              <Link href="/dashboard/organization/review">Review Submissions</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>Your Posted Problems</CardTitle>
            <CardDescription>Challenges hosted by your organization</CardDescription>
          </CardHeader>
          <CardContent>
            {orgProblems.length === 0 ? (
              <div className="text-sm text-muted-foreground py-4">
                No problems posted yet. <Link href="/dashboard/organization/create-problem" className="text-primary hover:underline">Create one now</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {orgProblems.slice(0, 5).map((p: any) => (
                  <div key={p._id} className="flex items-center justify-between p-3 border rounded-md">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{p.title}</div>
                      <div className="text-xs text-muted-foreground">
                        Difficulty: {p.difficulty || "N/A"} • Created: {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "N/A"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

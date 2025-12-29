"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { fetchProblems, fetchTeams, getSolutionsByTeam } from "@/lib/api";

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const [problems, setProblems] = useState<any[]>([]);
  const [myTeams, setMyTeams] = useState<any[]>([]);
  const [teamsWithSolutions, setTeamsWithSolutions] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!user?._id) return;
      try {
        setLoading(true);

        // fetch teams for this student
        let teams = await fetchTeams();
        teams = teams.filter((t: any) => 
          t.members?.some((m: any) => {
            const memberId = typeof m.user === "string" ? m.user : m.user?._id;
            return memberId === user._id;
          })
        );
        setMyTeams(teams || []);

        // fetch solutions per team
        const teamsData: Array<any> = [];
        for (const t of teams || []) {
          try {
            const sols = await getSolutionsByTeam(t._id);
            if (sols && sols.length) {
              teamsData.push({ team: t, solutions: sols });
            }
          } catch (e) {
            // ignore per-team errors
          }
        }
        setTeamsWithSolutions(teamsData);

        // fetch all problems and filter to those related to student's teams
        const allProblems = await fetchProblems().catch(() => []);
        const problemIds = new Set((teams || []).map((x: any) => (typeof x.problem === 'string' ? x.problem : x.problem?._id)).filter(Boolean));
        const related = (allProblems || []).filter((p: any) => problemIds.has(p._id));
        setProblems(related);
      } catch (e) {
        setProblems([]);
        setMyTeams([]);
        setTeamsWithSolutions([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?._id]);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Welcome back, Student!</CardTitle>
            <CardDescription>
              Continue your journey by exploring challenges, collaborating with teams, and showcasing your projects.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/problems">Browse Challenges</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>Overview</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-2">
              <li>Active Challenges: {problems.length}</li>
              <li>My Teams: {myTeams.length}</li>
              <li>Open Tasks: -</li>
            </ul>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>My Challenges</CardTitle>
            <CardDescription>Jump back into your work</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {problems.slice(0, 3).map((p: any) => (
              <Button key={p._id || p.id} variant="outline" className="w-full" asChild>
                <Link href={`/problems/${p._id || p.id}`}>{p.title || p.name || "Challenge"}</Link>
              </Button>
            ))}
            <Button variant="ghost" className="w-full" asChild>
              <Link href="/dashboard/challenges">View all</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Teams</CardTitle>
            <CardDescription>Collaborations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {myTeams.slice(0, 5).map((t: any) => (
              <Button key={t._id} variant="outline" className="w-full" asChild>
                <Link href={`/teams/${t._id}`}>{t.name}</Link>
              </Button>
            ))}
            <Button variant="ghost" className="w-full" asChild>
              <Link href="/teams">Manage teams</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Submissions</CardTitle>
            <CardDescription>Recent submissions by your teams</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {loading && <div className="text-sm text-muted-foreground">Loading submissions...</div>}
            {!loading && teamsWithSolutions.length === 0 && (
              <div className="text-sm text-muted-foreground">No submissions found for your teams.</div>
            )}
            {teamsWithSolutions.flatMap(t => (t.solutions || []).slice(0,3).map((s: any) => {
              const team = t.team;
              const problemId = s.problem?._id || s.problem || team.problem?._id;
              const teamId = typeof s.team === 'string' ? s.team : s.team?._id || team._id;
              const title = s.problem?.title || (problemId && problems.find((p: any) => p._id === problemId)?.title) || `Submission`;
              return (
                <div key={s._id || `${team._id}-${problemId}`} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{title}</div>
                    <div className="text-xs text-muted-foreground">Team: {team.name}</div>
                  </div>
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/editor/${problemId}/${teamId}`}>Open Editor</Link>
                  </Button>
                </div>
              );
            }))}
            {teamsWithSolutions.length > 0 && (
              <Button variant="ghost" className="w-full" asChild>
                <Link href="/dashboard/submissions">View all submissions</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

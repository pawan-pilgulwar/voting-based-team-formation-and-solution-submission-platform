"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { fetchTeams, getSolutionsByTeam } from "@/lib/api";

export default function DashboardSubmissionsPage() {
  const { user } = useAuth();
  const [teamsWithSolutions, setTeamsWithSolutions] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!user?._id) return;
      try {
        setLoading(true);
        let teams = await fetchTeams();
        teams = teams.filter((t: any) => 
            t.members?.some((m: any) => {
                const memberId = typeof m.user === "string" ? m.user : m.user?._id;
                return memberId === user._id;
            })
        );
        const data: Array<any> = [];
        for (const t of teams || []) {
          try {
            const sols = await getSolutionsByTeam(t._id);
            if (sols && sols.length) data.push({ team: t, solutions: sols });
          } catch (e) {
            // ignore
          }
        }
        setTeamsWithSolutions(data);
      } catch (e) {
        setTeamsWithSolutions([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?._id]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>All Submissions</CardTitle>
          <CardDescription>Submissions from your teams</CardDescription>
        </CardHeader>
        <CardContent>
          {loading && <div className="text-sm text-muted-foreground">Loading submissions...</div>}
          {!loading && teamsWithSolutions.length === 0 && (
            <div className="text-sm text-muted-foreground">No submissions found for your teams.</div>
          )}

          <div className="space-y-4">
            {teamsWithSolutions.map((tws) => (
              <div key={tws.team._id} className="p-3 border rounded-md">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{tws.team.name}</div>
                    <div className="text-xs text-muted-foreground">Members: {tws.team.members?.length ?? 0}</div>
                  </div>
                  <div className="space-x-2">
                    <Button size="sm" asChild variant="outline">
                      <Link href={`/teams/${tws.team._id}`}>Open Team</Link>
                    </Button>
                  </div>
                </div>

                <div className="mt-3 space-y-2">
                  {tws.solutions.map((s: any) => {
                    const problemId = s.problem?._id || s.problem;
                    const teamId = typeof s.team === "string" ? s.team : s.team?._id || tws.team._id;
                    return (
                      <div key={s._id} className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{s.problem?.title || `Problem ${problemId}`}</div>
                          <div className="text-xs text-muted-foreground">Status: {s.status}</div>
                        </div>
                        <Button size="sm" variant="ghost" asChild>
                          <Link href={`/editor/${problemId}/${teamId}`}>Open Editor</Link>
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

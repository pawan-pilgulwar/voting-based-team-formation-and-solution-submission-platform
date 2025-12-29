"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { fetchTeams, getSolutionsByTeam } from "@/lib/api";
import type { Team } from "@/lib/types";

interface Solution {
  _id: string;
  status: "submitted" | "under-review" | "approved" | "rejected";
}

interface TeamWithSubmissions {
  _id: string;
  name: string;
  problem: { _id: string; title?: string };
  solutions: Solution[];
}

export default function MentorDashboardPage() {
  const { user } = useAuth();
  const [assignedTeams, setAssignedTeams] = useState<Team[]>([]);
  const [teamsWithSubmissions, setTeamsWithSubmissions] = useState<TeamWithSubmissions[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!user?._id || user.role !== "mentor") return;
      
      try {
        setLoading(true);
        const teams = await fetchTeams({ mentorId: user._id });
        setAssignedTeams(teams || []);

        const teamsData: TeamWithSubmissions[] = [];
        for (const team of teams) {
          try {
            const solutions = await getSolutionsByTeam(team._id);
            const pendingSolutions = solutions.filter(
              (s: Solution) => s.status === "submitted" || s.status === "under-review"
            );
            if (pendingSolutions.length > 0) {
              teamsData.push({
                _id: team._id,
                name: team.name,
                problem: team.problem,
                solutions: pendingSolutions,
              });
            }
          } catch (e) {
            // Skip if error loading solutions
          }
        }
        setTeamsWithSubmissions(teamsData);
      } catch (e) {
        console.error("Failed to load mentor data", e);
      } finally {
        setLoading(false);
      }
    };
    
    load();
  }, [user?._id, user?.role]);

  const assignedCount = assignedTeams.length;
  const pendingReviewCount = teamsWithSubmissions.reduce(
    (total, team) => total + team.solutions.length,
    0
  );

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Welcome, Mentor!</CardTitle>
            <CardDescription>
              Review assigned teams, guide students, and collaborate on solutions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/teams">Browse Teams</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/problems">Browse Problems</Link>
              </Button>
              <Button variant="secondary" asChild>
                <Link href="/dashboard/mentor/review">Review Submissions</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>At a glance</CardTitle>
            <CardDescription>Your mentorship overview</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-2">
              <li>Assigned Teams: {assignedCount}</li>
              <li>Pending Reviews: {pendingReviewCount}</li>
            </ul>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Assigned Teams</CardTitle>
            <CardDescription>Your current mentorship scope</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {loading && <div className="text-sm text-muted-foreground">Loading teams...</div>}
            {!loading && assignedTeams.length === 0 && (
              <div className="text-sm text-muted-foreground">You are not assigned to any teams yet. Use the Teams page to offer mentorship.</div>
            )}
            {assignedTeams.slice(0, 5).map((t) => (
              <div key={t._id} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{t.name}</div>
                  <div className="text-xs text-muted-foreground">
                    Members: {t.members?.length ?? 0}
                  </div>
                </div>
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/teams/${t._id}`}>Open</Link>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Reviews</CardTitle>
            <CardDescription>Submissions awaiting your feedback</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading && <div className="text-sm text-muted-foreground">Loading submissions...</div>}
            {!loading && teamsWithSubmissions.length === 0 && (
              <div className="text-sm text-muted-foreground">No submissions awaiting review. Check back soon!</div>
            )}
            {teamsWithSubmissions.slice(0, 5).map((team) => (
              <div key={team._id} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-sm">{team.name}</div>
                  <Badge variant="outline">{team.solutions.length} submission(s)</Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  Problem: {typeof team.problem === "string" ? team.problem : team.problem?.title}
                </div>
              </div>
            ))}
            {teamsWithSubmissions.length > 0 && (
              <Button className="w-full mt-4" asChild>
                <Link href="/dashboard/mentor/review">Review All Submissions</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

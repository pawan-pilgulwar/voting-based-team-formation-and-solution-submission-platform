"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { fetchTeams } from "@/lib/api";
import type { Team } from "@/lib/types";
import { getRecommendedTeams } from "@/lib/ai";

export default function MentorDashboardPage() {
  const { user } = useAuth();
  const [assignedTeams, setAssignedTeams] = useState<Team[]>([]);
  const [recommended, setRecommended] = useState<Array<{ team: Team; score: number }>>([]);

  useEffect(() => {
    const load = async () => {
      if (!user?._id || user.role !== "mentor") return;
      const [teams, rec] = await Promise.all([
        fetchTeams({ mentorId: user._id }),
        getRecommendedTeams(user._id).catch(() => []),
      ]);
      setAssignedTeams(teams || []);
      setRecommended(rec as any);
    };
    load();
  }, [user?._id, user?.role]);

  const assignedCount = assignedTeams.length;
  const recommendedCount = recommended.length;

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
              {/* <Button variant="secondary" asChild>
                <Link href="/dashboard/mentor/review">Mentor Reviews</Link>
              </Button> */}
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
              <li>Recommended Teams: {recommendedCount}</li>
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
            {assignedTeams.length === 0 && (
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
            <CardTitle>AI Recommended Teams</CardTitle>
            <CardDescription>Teams that match your expertise</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommended.length === 0 && (
              <div className="text-sm text-muted-foreground">No recommendations yet. Update your profile skills and expertise to get better matches.</div>
            )}
            {recommended.slice(0, 5).map((item: any) => {
              const team: Team = item.team || item;
              return (
                <div key={team._id} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{team.name}</div>
                    <div className="text-xs text-muted-foreground">
                      Members: {team.members?.length ?? 0}
                    </div>
                  </div>
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/teams/${team._id}`}>Open</Link>
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

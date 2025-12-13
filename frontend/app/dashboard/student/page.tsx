"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { fetchProblems, fetchTeams } from "@/lib/api";

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const [problems, setProblems] = useState<any[]>([]);
  const [myTeams, setMyTeams] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [p, teams] = await Promise.all([
          fetchProblems().catch(() => []),
          user?._id ? fetchTeams({ studentId: user._id }).catch(() => []) : Promise.resolve([]),
        ]);
        setProblems(p || []);
        setMyTeams(teams || []);
      } catch (e) {
        setProblems([]);
        setMyTeams([]);
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
                <Link href="/dashboard/challenges">Browse Challenges</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard/teams">Find/Manage Teams</Link>
              </Button>
              <Button variant="secondary" asChild>
                <Link href="/dashboard/projects">My Projects</Link>
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
                <Link href={`/challenges/${p._id || p.id}`}>{p.title || p.name || "Challenge"}</Link>
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
              <Link href="/dashboard/teams">Manage teams</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Projects</CardTitle>
            <CardDescription>Showcase your work</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full" asChild>
              <Link href="#">Smart Irrigation</Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href="#">Campus Navigator</Link>
            </Button>
            <Button variant="ghost" className="w-full" asChild>
              <Link href="/dashboard/projects">View all</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

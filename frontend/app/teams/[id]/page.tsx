"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchTeamById } from "@/lib/api";
import type { Team } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";

export default function TeamDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isLeader = useMemo(() => {
    if (!team || !user) return false;
    return team.leader?.user._id === user._id;
  }, [team, user]);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const t = await fetchTeamById(id);
        const leader = t.members.find((m) => m.role === "leader");
        const members = t.members.filter((m) => m.role === "member");
        setTeam({...t, leader: leader? leader : null, members: members});
      } catch (e: any) {
        setError(e?.message || "Failed to load team");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-10 space-y-6">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="max-w-3xl mx-10">
        <h1 className="text-2xl font-semibold tracking-tight mb-2">Team</h1>
        <p className="text-red-500">{error || "Team not found"}</p>
        <Button variant="ghost" onClick={() => router.push("/teams")}>Back to Teams</Button>
      </div>
    );
  }

  return (
    <div className="mx-10 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{team.name}</h1>
          <p className="text-muted-foreground">Team overview, members and actions</p>
        </div>
        <div className="flex gap-2">
          {team.problem && user?.role === "student" && (
            <Link href={`/editor/${typeof team.problem === "string" ? team.problem : team.problem._id}/${team._id}`}>
              <Button style={{zIndex: 9999, position: "relative"}}>Open Editor</Button>
            </Link>
          )}

          {user?.role === "organization" && (
            <Link href={`/problems/${typeof team.problem === "string" ? team.problem : team.problem._id}/#solutions-section`}>
              <Button style={{zIndex: 9999, position: "relative"}}>Manage Solutions</Button>
            </Link>
          )}

          {isLeader && (
            <Button style={{zIndex: 9999, position: "relative"}} variant="outline">Edit Team Info</Button>
          )}
        </div>
      </div>

      <div className="flex gap-4">
        <Card className="flex-1">
          <CardHeader className="flex justify-between">
            <CardTitle>Leader</CardTitle>
            <CardTitle>User Name</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y">
              <li key={team.leader?.user._id} className="flex items-center justify-between py-2">
                <div className="font-medium">{team.leader?.user.name}</div>
                <div className="text-sm text-muted-foreground">@{team.leader?.user.username}</div>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardHeader className="flex justify-between">
            <CardTitle>Members</CardTitle>
            <CardTitle>User Name</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y">
              {team.members?.map((m) => (
                m.role === "member" && <li key={m.user._id} className="flex items-center justify-between py-2">
                  <span className="font-medium">{m.user.name}</span>
                  <span className="text-sm text-muted-foreground capitalize">@{m.user.username}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
      <div className="flex gap-3">
        <Link href="/teams">
          <Button variant="ghost">Back to Teams</Button>
        </Link>
      </div>
    </div>
  );
}

"use client";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useMemo } from "react";
import { fetchTeams, joinTeamAsMentor } from "@/lib/api";
import type { Team } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { relative } from "path";

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const [showAssigned, setShowAssigned] = useState(false);
  const [assigningId, setAssigningId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchTeams();
        if (user?.role === "student") {
          const filteredData = data.filter((t: any) => t.members?.some((m: any) => m.user._id === user._id));
          setTeams(filteredData as Team[]);
        } else if (user?.role === "organization") {
          const filteredData = data.filter((t: any) => t.problem?.postedBy === user._id);
          setTeams(filteredData as Team[]);
        } else if (user?.role === "mentor") {
          setTeams(data as Team[]);
        } else {
          setTeams(data as Team[]);
        }
      } catch (e: any) {
        setError(e?.message || "Failed to load teams");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const isMentor = user?.role === "mentor";

  const visibleTeams = useMemo(() => {
    if (!isMentor || !showAssigned) return teams;
    if (!user) return teams;
    return teams.filter((t: any) => {
      const mentor: any = (t as any).mentor;
      if (!mentor) return false;
      return typeof mentor === "string" ? mentor === user._id : mentor._id === user._id;
    });
  }, [teams, isMentor, showAssigned, user]);

  const handleGiveMentorship = async (teamId: string) => {
    if (!user || !isMentor) return;
    try {
      setAssigningId(teamId);
      await joinTeamAsMentor(teamId);
      setTeams((prev) =>
        prev.map((t) =>
          t._id === teamId
            ? ({
                ...t,
                mentor: user,
              } as any)
            : t
        )
      );
      toast.success("You are now assigned as mentor to this team");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || "Failed to assign as mentor");
    } finally {
      setAssigningId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-10 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Teams</h1>
          <p className="text-muted-foreground">Browse your teams or discover new ones to join.</p>
        </div>
        {isMentor && (
          <div className="flex gap-2">
            <Button
              variant={showAssigned ? "outline" : "default"}
              style={{position: "relative"}}
              size="sm"
              onClick={() => setShowAssigned(false)}
            >
              All Teams
            </Button>
            <Button
              variant={showAssigned ? "default" : "outline"}
              style={{position: "relative"}}
              size="sm"
              onClick={() => setShowAssigned(true)}
            >
              Assigned Teams
            </Button>
          </div>
        )}
      </div>
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-2/3" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-1/2" />
                <div className="flex gap-2">
                  <Skeleton className="h-9 w-20" />
                  <Skeleton className="h-9 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleTeams.map((t) => (
            <Card key={t._id}>
              <CardHeader>
                <CardTitle className="text-lg">{t.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-2">
                <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                  <span>Members: {t.members?.length ?? 0}</span>
                  {isMentor && (t as any).mentor && (
                    <span>  
                      Mentor: {typeof (t as any).mentor === "string" ? "Assigned" : (t as any).mentor?.name}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Link href={`/teams/${t._id}`}>
                    <Button variant="outline" size="sm">Open</Button>
                  </Link>
                  {t.problem && user?.role === "student" && (
                    <Link href={`/editor/${typeof t.problem === "string" ? t.problem : t.problem._id}/${t._id}`}>
                      <Button size="sm">Editor</Button>
                    </Link>
                  )}

                  {t.problem && user?.role === "organization" && (
                    <Link href={`/problems/${typeof t.problem === "string" ? t.problem : t.problem._id}`}>
                      <Button size="sm">Solutions</Button>
                    </Link>
                  )}

                  {t.problem && isMentor && showAssigned && (
                    <Link href={`/editor/${typeof t.problem === "string" ? t.problem : t.problem._id}/${t._id}`}>
                      <Button size="sm">Solutions</Button>
                    </Link>
                  )}

                  {isMentor && (
                    <Button
                      size="sm"
                      variant={(t as any).mentor ? "outline" : "default"}
                      disabled={Boolean((t as any).mentor) || assigningId === t._id}
                      className={showAssigned ? "hidden" : ""}
                      onClick={() => handleGiveMentorship(t._id)}
                    >
                      {(t as any).mentor && !showAssigned
                        ? (typeof (t as any).mentor === "string" || (t as any).mentor?._id === user?._id)
                          ? "Assigned"
                          : "Has Mentor"
                        : assigningId === t._id
                        ? "Assigning..."
                        : "Give Mentorship"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}


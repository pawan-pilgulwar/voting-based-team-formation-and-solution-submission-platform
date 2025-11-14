"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { getUserRecommendations, getMentorRecommendations, getOrgRecommendations } from "@/lib/api";

interface ProblemRec { problem: any; score: number }
interface TeamRec { team: any; score: number }

export default function AIRecommendation() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [problems, setProblems] = useState<ProblemRec[]>([]);
  const [teams, setTeams] = useState<TeamRec[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!user?._id) return;
      setLoading(true);
      try {
        if (user.role === "student") {
          const res = await getUserRecommendations(user._id);
          setProblems(res?.problems || []);
        } else if (user.role === "mentor") {
          const res = await getMentorRecommendations(user._id);
          setTeams(res?.teams || []);
        } else if (user.role === "organization") {
          const res = await getOrgRecommendations(user._id);
          setTeams(res?.teams || []);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?._id, user?.role]);

  if (!user) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {loading && Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="p-4">
          <Skeleton className="h-4 w-2/3 mb-2" />
          <Skeleton className="h-3 w-full mb-2" />
          <Skeleton className="h-3 w-5/6" />
        </Card>
      ))}

      {!loading && user.role === "student" && problems.map((p) => (
        <Card key={p.problem?._id || p.problem?.id} className="p-4">
          <div className="text-sm font-medium">{p.problem?.title}</div>
          <div className="text-xs text-muted-foreground mt-1 line-clamp-3">{p.problem?.description}</div>
          <div className="mt-2 text-xs text-muted-foreground">Score: {(p.score ?? 0).toFixed(2)}</div>
        </Card>
      ))}

      {!loading && (user.role === "mentor" || user.role === "organization") && teams.map((t) => (
        <Card key={t.team?._id || t.team?.id} className="p-4">
          <div className="text-sm font-medium">{t.team?.name}</div>
          <div className="text-xs text-muted-foreground mt-1">{t.team?.problem?.title}</div>
          <div className="mt-2 text-xs text-muted-foreground">Score: {(t.score ?? 0).toFixed(2)}</div>
          <div className="mt-3">
            <Button size="sm" variant="secondary">View</Button>
          </div>
        </Card>
      ))}
    </div>
  );
}

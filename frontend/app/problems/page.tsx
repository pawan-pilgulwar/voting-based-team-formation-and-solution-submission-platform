"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useVote } from "@/context/VoteContext";
import { useAuth } from "@/context/AuthContext";
import { fetchProblems } from "@/lib/api";
import type { Problem } from "@/lib/types";

export default function ProblemsListPage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { voteCounts, getVoteCount, castVote, hasVoted, loading: voting } = useVote();
  const [showMine, setShowMine] = useState(false);

  const updateVoteCount = (problemId: string) => {
    castVote(problemId);
    setProblems((prev) =>
      prev.map((p) =>
        p._id === problemId
          ? { ...p, hasVoted: true, voteCount: (p.voteCount ?? 0) + 1 }
          : p
      )
    );
  }

  const filteredProblems = showMine && user ? problems.filter((p) => {
    const postedBy = (p as any).postedBy;
    if (!postedBy || typeof postedBy === "string") return false;
    return postedBy._id === user._id;
  }) : problems;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchProblems();
        setProblems(data);        // prefetch vote counts
        data.forEach((p) => getVoteCount(p._id));
      } catch (e: any) {
        setError(e?.message || "Failed to load problems");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Problems</h1>
          <p className="text-muted-foreground">Explore community and organization posted problems.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-2/3" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <div className="flex gap-2">
                  <Skeleton className="h-9 w-24" />
                  <Skeleton className="h-9 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold tracking-tight mb-2">Problems</h1>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Problems</h1>
          <p className="text-muted-foreground">Explore community and organization posted problems.</p>
        </div>
        {user && (user.role === "organization" || user.role === "admin" || user.role === "student") && (
          <Button
            variant={showMine ? "default" : "outline"}
            style={{position: "relative"}}
            size="sm"
            onClick={() => setShowMine((v) => !v)}
          >
            {showMine ? "Showing: My Problems" : "Showing: All Problems"}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProblems.length === 0 ? (
          <div className="col-span-full flex justify-center items-center py-20">
            <p className="text-center text-muted-foreground text-lg">
              No problems found
            </p>
          </div>
        ) : filteredProblems.map((p) => (
          <Card key={p._id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-lg line-clamp-2">{p.title}</CardTitle>
                {p.difficulty && <Badge variant="secondary" className="capitalize">{p.difficulty}</Badge>}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-3">{p.description}</p>
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm text-muted-foreground">Votes: {p.voteCount ?? 0}</div>
                <div className="flex gap-2">
                  <Link href={`/problems/${p._id}`}>
                    <Button variant="secondary">Details</Button>
                  </Link>
                  {user && (user.role === "organization" || user.role === "admin") && (
                    <Link href={`/problems/${p._id}#solutions-section`}>
                      <Button variant="outline">Solutions</Button>
                    </Link>
                  )}
                  {user?.role === "student" && (
                    <Button
                      onClick={() => updateVoteCount(p._id)}
                      disabled={!user || p.hasVoted || (p.voteCount ?? 0) >= 6 || voting}
                    >
                      {p.hasVoted ? "Voted" : voting ? "Voting..." : "Vote"}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

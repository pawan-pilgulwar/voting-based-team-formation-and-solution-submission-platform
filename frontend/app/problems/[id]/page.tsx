"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useVote } from "@/context/VoteContext";
import { useAuth } from "@/context/AuthContext";
import { fetchProblemById } from "@/lib/api";
import type { Problem } from "@/lib/types";

export default function ProblemDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id as string;
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { voteCounts, getVoteCount, castVote, hasVoted, loading: voting } = useVote();

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const data = await fetchProblemById(id);
        setProblem(data);
        await getVoteCount(id);
      } catch (e: any) {
        setError(e?.message || "Failed to load problem");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold tracking-tight mb-2">Problem</h1>
        <p className="text-red-500">{error || "Problem not found"}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">{problem.title}</h1>
          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            {problem.difficulty && <Badge variant="secondary" className="capitalize">{problem.difficulty}</Badge>}
            <span>Votes: {voteCounts[id] ?? 0}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => castVote(id)}
            disabled={!user || hasVoted[id] || voting}
          >
            {hasVoted[id] ? "Voted" : voting ? "Voting..." : "Vote"}
          </Button>
          <Button variant="secondary" onClick={() => router.push("/problems")}>Back</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Problem Description</CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
          {problem.description}
        </CardContent>
      </Card>
    </div>
  );
}

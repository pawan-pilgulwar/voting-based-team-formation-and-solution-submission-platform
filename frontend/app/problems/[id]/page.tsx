"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useVote } from "@/context/VoteContext";
import { useAuth } from "@/context/AuthContext";
import { fetchProblemById, getSolutionsByProblem } from "@/lib/api";
import type { Problem } from "@/lib/types";

interface SolutionItem {
  _id: string;
  team: any;
  problem: any;
  status: "draft" | "submitted" | "under-review" | "approved" | "rejected";
  submittedBy?: { _id: string; name?: string } | string;
  createdAt?: string;
}

export default function ProblemDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id as string;
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { getVoteCount, castVote, hasVoted, loading: voting } = useVote();
  const [solutions, setSolutions] = useState<SolutionItem[]>([]);
  const [solutionsLoading, setSolutionsLoading] = useState(false);
  const [solutionsError, setSolutionsError] = useState<string | null>(null);

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
  }, [id]);

  useEffect(() => {
    const loadSolutions = async () => {
      if (!id) return;
      if (!user || (user.role !== "organization" && user.role !== "admin")) return;
      try {
        setSolutionsLoading(true);
        setSolutionsError(null);
        const data = await getSolutionsByProblem(id);
        setSolutions(Array.isArray(data) ? data : []);
      } catch (e: any) {
        setSolutionsError(e?.message || "Failed to load solutions");
      } finally {
        setSolutionsLoading(false);
      }
    };
    loadSolutions();
  }, [id]);

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
            <span>Votes: {problem.voteCount ?? 0}</span>
          </div>
        </div>
        <div className="flex gap-2">
          {user?.role === "student" && (
            <Button
              style={{zIndex: 1 }}
              onClick={() => castVote(id)}
              disabled={!user || hasVoted[id] || voting}
            >
              {hasVoted[id] ? "Voted" : voting ? "Voting..." : "Vote"}
            </Button>
          )}
          {user && (user.role === "organization" || user.role === "admin") && (
            <Button
              variant="outline"
              style={{zIndex: 1 }}
              onClick={() => {
                const el = document.getElementById("solutions-section");
                if (el) {
                  el.scrollIntoView({ behavior: "smooth" });
                }
              }}
            >
              Solutions
            </Button>
          )}
          <Button 
            variant="secondary" 
            style={{zIndex: 1 }} 
            onClick={() => router.push("/problems")}>Back</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Problem Details</CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
          {/* Description */}
          {problem.description && (
            <div>
              <span className="font-medium text-foreground">Description:</span>{" "}
              {problem.description}
            </div>
          )}

          {/* Posted By */}
          {problem.postedBy && (
            <div>
              <span className="font-medium text-foreground">Posted By:</span>{" "}
              {problem.postedBy?.username} ({problem.postedBy?.email})
            </div>
          )}

          {/* Status */}
          {problem.status && (
            <div>
              <span className="font-medium text-foreground">Status:</span>{" "}
              {problem.status}
            </div>
          )}

          {/* Difficulty */}
          {problem.difficulty && (
            <div>
              <span className="font-medium text-foreground">Difficulty:</span>{" "}
              {problem.difficulty}
            </div>
          )}

          {/* Tags */}
          {problem.tags && (
            <div>
              <span className="font-medium text-foreground">Skills:</span>{" "}
              {problem.tags?.length
            ? problem.tags.join(", ")
            : "No tags added"}
            </div>
          )}

          {/* Deadline */}
          {problem.deadline && (
            <div>
              <span className="font-medium text-foreground">Deadline:</span>{" "}
              {problem.deadline
                ? new Date(problem.deadline).toLocaleString()
                : "No deadline"}
            </div>
          )}

          {/* Created At */}
          {user?.role == "organization" && problem.createdAt && (
            <div>
              <span className="font-medium text-foreground">Created At:</span>{" "}
              {new Date(problem.createdAt).toLocaleString()}
            </div>
          )}

          {user?.role == "organization" && problem.updatedAt && (
            <div>
              <span className="font-medium text-foreground">Updated At:</span>{" "}
              {new Date(problem.updatedAt).toLocaleString()}
            </div>
          )}

          {/* Vote Count */}
          {problem.voteCount && (
            <div>
              <span className="font-medium text-foreground">Total Votes:</span>{" "}
              {problem.voteCount}
            </div>
          )}

          {/* You Have Voted */}
          {user?.role == "student" && problem.hasVoted && (
            <div>
              <span className="font-medium text-foreground">You Voted:</span>{" "}
              {problem.hasVoted ? "Yes" : "No"}
            </div>
          )}

          {/* Selected Teams */}
          {user?.role == "organization" && problem.selectedTeams && (
            <div>
              <span className="font-medium text-foreground">Selected Teams:</span>{" "}
              {problem.selectedTeams?.length
                ? problem.selectedTeams.map((t: any) => t.name).join(", ")
                : "No teams yet"}
            </div>
          )}

          {/* Votes Array */}
          {user?.role == "organization" && problem.votes && (
            <div>
              <span className="font-medium text-foreground">Votes List:</span>{" "}
              {problem.votes?.length
                ? problem.votes.map((v: any) => v.user?.username || v.user).join(", ")
                : "No votes"}
            </div>
          )}
        </CardContent>
      </Card>

      {user && (user.role === "organization" || user.role === "admin") && (
        <Card id="solutions-section">
          <CardHeader>
            <CardTitle>Submitted Solutions</CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="space-y-4">
            {solutionsLoading && <p className="text-sm text-muted-foreground">Loading solutions...</p>}
            {solutionsError && !solutionsLoading && (
              <p className="text-sm text-red-500">{solutionsError}</p>
            )}
            {!solutionsLoading && !solutionsError && solutions.length === 0 && (
              <p className="text-sm text-muted-foreground">No solutions have been submitted yet.</p>
            )}
            {!solutionsLoading && !solutionsError && solutions.length > 0 && (
              <div className="space-y-3">
                {solutions.map((s) => {
                  const team = s.team as any;
                  const teamName = typeof team === "string" ? team : team?.name || team?._id;
                  const members =
                    team && Array.isArray(team.members)
                      ? team.members
                          .map((m: any) => m?.user?.name || m?.user?.email || "Member")
                          .join(", ")
                      : null;
                  const submittedBy =
                    typeof s.submittedBy === "string"
                      ? s.submittedBy
                      : s.submittedBy?.name || s.submittedBy?._id;
                  return (
                    <div key={s._id} className="border rounded-md p-3 text-sm space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <div className="font-medium">Team: {teamName}</div>
                          {members && (
                            <div className="text-xs text-muted-foreground">Members: {members}</div>
                          )}
                          <div className="text-xs text-muted-foreground">
                            Submitted by: {submittedBy}
                            {s.createdAt && ` • ${new Date(s.createdAt).toLocaleString()}`}
                          </div>
                          <div className="text-xs capitalize text-muted-foreground">Status: {s.status}</div>
                        </div>
                        {typeof team !== "string" && (
                          <div className="flex flex-col gap-1">
                            <Button
                              size="sm"
                              variant="secondary"
                              asChild
                            >
                              <Link href={`/editor/${problem._id}/${team._id}`}>
                                Open Editor
                              </Link>
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

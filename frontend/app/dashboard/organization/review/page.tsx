"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { fetchProblems, getSolutionsByProblem, reviewSolution } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

interface SolutionItem {
  _id: string;
  team: { _id: string; name?: string } | string;
  problem: { _id: string; title?: string } | string;
  status: "submitted" | "under-review" | "approved" | "rejected";
  submittedBy?: { _id: string; name?: string };
  createdAt?: string;
  evaluation?: { score?: number; remarks?: string };
}

interface ProblemWithSolutions {
  _id: string;
  title: string;
  solutions: SolutionItem[];
}

export default function OrgReviewPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [problems, setProblems] = useState<ProblemWithSolutions[]>([]);
  const [selectedProblem, setSelectedProblem] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  
  const [status, setStatus] = useState<"under-review" | "approved" | "rejected">("under-review");
  const [score, setScore] = useState<string>("");
  const [remarks, setRemarks] = useState<string>("");
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  // Load organization's problems and their solutions
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const allProblems = await fetchProblems();
        
        // Filter problems by organization
        const orgProblems = allProblems.filter((p: any) => {
          const postedById = typeof p.postedBy === "string" ? p.postedBy : p.postedBy?._id;
          return postedById === user?._id;
        });

        // Fetch solutions for each problem
        const problemsWithSolutions: ProblemWithSolutions[] = [];
        for (const problem of orgProblems) {
          try {
            const solutions = await getSolutionsByProblem(problem._id);
            // Filter to show only submitted/under-review solutions
            const submittedSolutions = solutions.filter(
              (s: any) => s.status === "submitted" || s.status === "under-review"
            );
            if (submittedSolutions.length > 0) {
              problemsWithSolutions.push({
                _id: problem._id,
                title: problem.title,
                solutions: submittedSolutions,
              });
            }
          } catch (e) {
            // Skip if error loading solutions for this problem
          }
        }

        setProblems(problemsWithSolutions);
        if (problemsWithSolutions.length > 0) {
          setSelectedProblem(problemsWithSolutions[0]._id);
        }
      } catch (e: any) {
        toast?.({ title: "Load Failed", description: e?.message });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?._id]);

  const actReview = async () => {
    if (!selected) {
      toast?.({ title: "Select a solution first" });
      return;
    }
    try {
      setReviewingId(selected);
      await reviewSolution({
        solutionId: selected,
        status,
        score: score ? Number(score) : undefined,
        remarks: remarks || undefined,
      });
      toast?.({ title: "Review saved", description: "Solution status updated" });
      setSelected(null);
      setScore("");
      setRemarks("");
      setStatus("under-review");
      
      // Reload problems to update the list
      const allProblems = await fetchProblems();
      const orgProblems = allProblems.filter((p: any) => {
        const postedById = typeof p.postedBy === "string" ? p.postedBy : p.postedBy?._id;
        return postedById === user?._id;
      });

      const problemsWithSolutions: ProblemWithSolutions[] = [];
      for (const problem of orgProblems) {
        try {
          const solutions = await getSolutionsByProblem(problem._id);
          const submittedSolutions = solutions.filter(
            (s: any) => s.status === "submitted" || s.status === "under-review"
          );
          if (submittedSolutions.length > 0) {
            problemsWithSolutions.push({
              _id: problem._id,
              title: problem.title,
              solutions: submittedSolutions,
            });
          }
        } catch (e) {
          // Skip if error
        }
      }
      setProblems(problemsWithSolutions);
    } catch (e: any) {
      toast?.({ title: "Review Failed", description: e?.response?.data?.message || e?.message });
    } finally {
      setReviewingId(null);
    }
  };

  const currentProblem = problems.find((p) => p._id === selectedProblem);

  return (
    <div className="space-y-6">
      {loading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">Loading problems and solutions...</div>
          </CardContent>
        </Card>
      ) : problems.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Submissions to Review</CardTitle>
            <CardDescription>There are no pending submissions for your problems.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Review Team Solutions</CardTitle>
              <CardDescription>Select a problem to review submitted solutions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                <Label htmlFor="problem-select">Select Problem</Label>
                <select
                  id="problem-select"
                  value={selectedProblem || ""}
                  onChange={(e) => {
                    setSelectedProblem(e.target.value);
                    setSelected(null);
                    setScore("");
                    setRemarks("");
                  }}
                  className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {problems.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.title} ({p.solutions.length} pending)
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {currentProblem && (
            <Card>
              <CardHeader>
                <CardTitle>Submissions for {currentProblem.title}</CardTitle>
                <CardDescription>{currentProblem.solutions.length} solutions awaiting review</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Team</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentProblem.solutions.map((s) => (
                        <TableRow key={s._id} className={selected === s._id ? "bg-muted/40" : ""}>
                          <TableCell className="font-medium">
                            {typeof s.team === "string" ? s.team : s.team?.name || "Unknown Team"}
                          </TableCell>
                          <TableCell className="capitalize">{s.status}</TableCell>
                          <TableCell>
                            {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : "-"}
                          </TableCell>
                          <TableCell className="space-x-2">
                            <Button
                              size="sm"
                              variant={selected === s._id ? "default" : "outline"}
                              onClick={() => setSelected(s._id)}
                            >
                              {selected === s._id ? "Selected" : "Select"}
                            </Button>
                            <Button asChild size="sm" variant="secondary">
                              <Link href={`/editor/${currentProblem._id}/${typeof s.team === "string" ? s.team : s.team?._id}`}>
                                Open Editor
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {selected && (
                  <div className="border-t pt-6">
                    <h3 className="font-semibold mb-4">Review Selected Solution</h3>
                    <div className="grid gap-3 md:grid-cols-3">
                      <div className="grid gap-2">
                        <Label>Status</Label>
                        <Select value={status} onValueChange={(v) => setStatus(v as any)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="under-review">Under Review</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="score">Score (optional)</Label>
                        <Input
                          id="score"
                          type="number"
                          min={0}
                          max={100}
                          value={score}
                          onChange={(e) => setScore(e.target.value)}
                          placeholder="0-100"
                        />
                      </div>
                      <div className="grid gap-2 md:col-span-3">
                        <Label htmlFor="remarks">Remarks (optional)</Label>
                        <Textarea
                          id="remarks"
                          rows={4}
                          value={remarks}
                          onChange={(e) => setRemarks(e.target.value)}
                          placeholder="Feedback or notes for the team"
                        />
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Button onClick={actReview} disabled={reviewingId !== null}>
                        {reviewingId !== null ? "Saving..." : "Save Review"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelected(null);
                          setScore("");
                          setRemarks("");
                          setStatus("under-review");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

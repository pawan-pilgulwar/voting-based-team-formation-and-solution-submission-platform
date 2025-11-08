"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { getSolutionsByProblem, reviewSolution } from "@/lib/api";

interface SolutionItem {
  _id: string;
  team: { _id: string; name?: string } | string;
  problem: { _id: string; title?: string } | string;
  status: "submitted" | "under-review" | "approved" | "rejected";
  submittedBy?: { _id: string; name?: string };
  createdAt?: string;
  evaluation?: { score?: number; remarks?: string };
}

export default function OrgReviewPage() {
  const [problemId, setProblemId] = useState("");
  const [loading, setLoading] = useState(false);
  const [solutions, setSolutions] = useState<SolutionItem[]>([]);

  const [selected, setSelected] = useState<string | null>(null);
  const [status, setStatus] = useState<"under-review" | "approved" | "rejected">("under-review");
  const [score, setScore] = useState<string>("");
  const [remarks, setRemarks] = useState<string>("");

  const loadSolutions = async () => {
    if (!problemId.trim()) {
      toast?.({ title: "Problem ID required" });
      return;
    }
    try {
      setLoading(true);
      const data = await getSolutionsByProblem(problemId.trim());
      setSolutions(data);
    } catch (e: any) {
      toast?.({ title: "Load Failed", description: e?.response?.data?.message || e?.message });
    } finally {
      setLoading(false);
    }
  };

  const actReview = async () => {
    if (!selected) {
      toast?.({ title: "Select a solution first" });
      return;
    }
    try {
      setLoading(true);
      await reviewSolution({
        solutionId: selected,
        status,
        score: score ? Number(score) : undefined,
        remarks: remarks || undefined,
      });
      toast?.({ title: "Review saved" });
      await loadSolutions();
    } catch (e: any) {
      toast?.({ title: "Review Failed", description: e?.response?.data?.message || e?.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Review Team Solutions</CardTitle>
          <CardDescription>Load submissions for a problem and mark them as approved/rejected.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-3 md:items-end">
            <div className="grid gap-2 md:w-80">
              <Label htmlFor="pid">Problem ID</Label>
              <Input id="pid" placeholder="Enter Problem ID" value={problemId} onChange={(e) => setProblemId(e.target.value)} />
            </div>
            <Button onClick={loadSolutions} disabled={loading}>{loading ? "Loading..." : "Load"}</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Submissions</CardTitle>
          <CardDescription>{solutions.length} found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Solution</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {solutions.map((s) => (
                  <TableRow key={s._id} className={selected === s._id ? "bg-muted/40" : ""}>
                    <TableCell className="font-medium">{s._id}</TableCell>
                    <TableCell>{typeof s.team === "string" ? s.team : (s.team?.name || s.team?._id)}</TableCell>
                    <TableCell className="capitalize">{s.status}</TableCell>
                    <TableCell>{s.createdAt ? new Date(s.createdAt).toLocaleString() : "-"}</TableCell>
                    <TableCell>
                      <Button size="sm" variant={selected === s._id ? "default" : "outline"} onClick={() => setSelected(s._id)}>
                        {selected === s._id ? "Selected" : "Select"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
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
              <Input id="score" type="number" min={0} max={100} value={score} onChange={(e) => setScore(e.target.value)} />
            </div>
            <div className="grid gap-2 md:col-span-3">
              <Label htmlFor="remarks">Remarks (optional)</Label>
              <Textarea id="remarks" rows={4} value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Feedback or notes" />
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <Button onClick={actReview} disabled={!selected || loading}>{loading ? "Saving..." : "Save Review"}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { addSolutionFeedback, getSolutionsByTeam } from "@/lib/api";
import Link from "next/link";

interface SolutionItem {
  _id: string;
  team: { _id: string; name?: string } | string;
  problem: { _id: string; title?: string } | string;
  status: "submitted" | "under-review" | "approved" | "rejected";
  submittedBy?: { _id: string; name?: string };
  createdAt?: string;
}

export default function MentorReviewPage() {
  const [teamId, setTeamId] = useState("");
  const [loading, setLoading] = useState(false);
  const [solutions, setSolutions] = useState<SolutionItem[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [comment, setComment] = useState("");

  const loadSolutions = async () => {
    if (!teamId.trim()) {
      toast?.({ title: "Team ID required" });
      return;
    }
    try {
      setLoading(true);
      const data = await getSolutionsByTeam(teamId.trim());
      setSolutions(data);
    } catch (e: any) {
      toast?.({ title: "Load Failed", description: e?.response?.data?.message || e?.message });
    } finally {
      setLoading(false);
    }
  };

  const submitFeedback = async () => {
    if (!selected || !comment.trim()) {
      toast?.({ title: "Select a solution and enter feedback" });
      return;
    }
    try {
      setLoading(true);
      await addSolutionFeedback(selected, comment.trim());
      toast?.({ title: "Feedback added" });
      setComment("");
      await loadSolutions();
    } catch (e: any) {
      toast?.({ title: "Feedback Failed", description: e?.response?.data?.message || e?.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Mentor Reviews</CardTitle>
          <CardDescription>Load team submissions and add your feedback.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-3 md:items-end">
            <div className="grid gap-2 md:w-80">
              <Label htmlFor="tid">Team ID</Label>
              <Input id="tid" placeholder="Enter Team ID" value={teamId} onChange={(e) => setTeamId(e.target.value)} />
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
                  <TableHead>Problem</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {solutions.map((s) => (
                  <TableRow key={s._id} className={selected === s._id ? "bg-muted/40" : ""}>
                    <TableCell className="font-medium">{s._id}</TableCell>
                    <TableCell>{typeof s.problem === "string" ? s.problem : (s.problem?.title || s.problem?._id)}</TableCell>
                    <TableCell className="capitalize">{s.status}</TableCell>
                    <TableCell>{s.createdAt ? new Date(s.createdAt).toLocaleString() : "-"}</TableCell>
                    <TableCell className="flex gap-2">
                      <Button size="sm" variant={selected === s._id ? "default" : "outline"} onClick={() => setSelected(s._id)}>
                        {selected === s._id ? "Selected" : "Select"}
                      </Button>
                      {typeof s.problem !== "string" && typeof s.team !== "string" && (
                        <Link href={`/editor/${s.problem._id}/${s.team._id}`}>
                          <Button size="sm" variant="secondary">Open Editor</Button>
                        </Link>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="mt-6 grid gap-2">
            <Label htmlFor="fb">Feedback</Label>
            <Textarea id="fb" rows={4} placeholder="Write constructive feedback for the team" value={comment} onChange={(e) => setComment(e.target.value)} />
          </div>

          <div className="mt-4 flex gap-2">
            <Button onClick={submitFeedback} disabled={!selected || loading}>{loading ? "Sending..." : "Add Feedback"}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

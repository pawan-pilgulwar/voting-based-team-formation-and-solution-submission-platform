"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { getSolutionsByTeam } from "@/lib/api";
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Team Solutions Viewer</CardTitle>
          <CardDescription>Load team submissions and open their solutions in read-only mode.</CardDescription>
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
                  <TableRow key={s._id}>
                    <TableCell className="font-medium">{s._id}</TableCell>
                    <TableCell>{typeof s.problem === "string" ? s.problem : (s.problem?.title || s.problem?._id)}</TableCell>
                    <TableCell className="capitalize">{s.status}</TableCell>
                    <TableCell>{s.createdAt ? new Date(s.createdAt).toLocaleString() : "-"}</TableCell>
                    <TableCell className="flex gap-2">
                      {typeof s.problem !== "string" && typeof s.team !== "string" && (
                        <Link href={`/editor/${s.problem._id}/${s.team._id}`}>
                          <Button size="sm" variant="outline">View Code</Button>
                        </Link>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

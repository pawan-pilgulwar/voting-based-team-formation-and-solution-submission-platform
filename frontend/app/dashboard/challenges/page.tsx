"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchProblems } from "@/lib/api";

export default function DashboardChallengesPage() {
  const [problems, setProblems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const p = await fetchProblems().catch(() => []);
        setProblems(p || []);
      } catch (e) {
        setProblems([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>All Challenges</CardTitle>
          <CardDescription>Browse available problems</CardDescription>
        </CardHeader>
        <CardContent>
          {loading && <div className="text-sm text-muted-foreground">Loading challenges...</div>}
          {!loading && problems.length === 0 && (
            <div className="text-sm text-muted-foreground">No challenges found.</div>
          )}
          <div className="space-y-2">
            {problems.map((p) => (
              <Button key={p._id || p.id} variant="outline" className="w-full" asChild>
                <Link href={`/problems/${p._id || p.id}`}>{p.title || p.name || "Challenge"}</Link>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

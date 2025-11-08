"use client";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { adminListTeams } from "@/lib/api";
import Link from "next/link";

export default function AdminTeamsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await adminListTeams();
        setItems(Array.isArray(data) ? data : []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    const term = q.toLowerCase();
    return items.filter((t) => [t.name, t.status].some((f: any) => String(f || "").toLowerCase().includes(term)));
  }, [items, q]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Teams</CardTitle>
            <div className="flex items-center gap-2">
              <Input placeholder="Search teams..." className="h-9 w-[240px]" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <Table>
              <TableCaption>All teams.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Problem</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((t) => (
                  <TableRow key={t._id}>
                    <TableCell className="font-medium">{t.name}</TableCell>
                    <TableCell>{t.members?.length ?? 0}</TableCell>
                    <TableCell className="capitalize">{t.status || "-"}</TableCell>
                    <TableCell>{typeof t.problem === "string" ? t.problem : t.problem?._id}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {t.problem && (
                          <Link href={`/editor/${typeof t.problem === "string" ? t.problem : t.problem?._id}/${t._id}`}>
                            <Button variant="secondary" size="sm">Open Editor</Button>
                          </Link>
                        )}
                        <Link href={`/teams/${t._id}`}>
                          <Button variant="outline" size="sm">Open</Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

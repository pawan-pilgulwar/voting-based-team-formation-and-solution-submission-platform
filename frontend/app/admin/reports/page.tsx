// Make this a Client Component to handle filtering UI state"use client";
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";


const allReports = [
  { id: "RPT-1001", title: "Abuse Report", status: "pending" as const, by: "student", date: "2025-09-01" },
  { id: "RPT-1002", title: "Spam Submission", status: "resolved" as const, by: "mentor", date: "2025-09-02" },
  { id: "RPT-1003", title: "Inappropriate Content", status: "pending" as const, by: "student", date: "2025-09-05" },
  { id: "RPT-1004", title: "Duplicate Challenge", status: "resolved" as const, by: "organization", date: "2025-09-10" },
];

export default function AdminReportsPage() {
  const [filter, setFilter] = useState<"all" | "pending" | "resolved">("all");
  const filtered = allReports.filter((r) => (filter === "all" ? true : r.status === filter));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <CardTitle>Reports</CardTitle>
            <div className="w-[200px]">
              <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reported By</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.id}</TableCell>
                  <TableCell>{r.title}</TableCell>
                  <TableCell className="capitalize">{r.status}</TableCell>
                  <TableCell className="capitalize">{r.by}</TableCell>
                  <TableCell>{r.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

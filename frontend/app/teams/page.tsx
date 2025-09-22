import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const mockTeams = [
  { id: "t1", name: "Health Innovators", members: 6, role: "Member" },
  { id: "t2", name: "GreenTech Squad", members: 4, role: "Member" },
  { id: "t3", name: "FinTech Wizards", members: 5, role: "Can Join" },
] as const;

export default function TeamsPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Teams</h1>
        <p className="text-muted-foreground">Browse your teams or discover new ones to join.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockTeams.map((t) => (
          <Card key={t.id}>
            <CardHeader>
              <CardTitle className="text-lg">{t.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-2">
              <p className="text-sm text-muted-foreground">Members: {t.members}</p>
              <div className="flex gap-2">
                <Link href={`/teams/${t.id}`}>
                  <Button variant="outline" size="sm">Open</Button>
                </Link>
                <Link href={`/chat/${t.id}`}>
                  <Button size="sm">Chat</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

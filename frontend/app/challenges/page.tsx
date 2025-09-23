import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const mockChallenges = [
  { id: "c1", title: "AI for Healthcare", status: "Active", summary: "Build AI tools to improve patient care." },
  { id: "c2", title: "Sustainability Hack", status: "Upcoming", summary: "Innovate for a greener future." },
  { id: "c3", title: "FinTech Innovation", status: "Completed", summary: "Reimagine financial inclusion." },
] as const;

export default function ChallengesPage() {
  return (
    <div className="max-w-6xl mx-10 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Challenges</h1>
        <p className="text-muted-foreground">Explore active, upcoming, and completed challenges.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockChallenges.map((c) => (
          <Card key={c.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-lg">{c.title}</CardTitle>
                <Badge variant="secondary">{c.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{c.summary}</p>
              <Link href={`/challenges/${c.id}`}>
                <Button className="w-full">View Details</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

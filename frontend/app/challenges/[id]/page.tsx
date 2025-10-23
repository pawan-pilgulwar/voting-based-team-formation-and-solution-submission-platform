import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const mockChallenges = [
  {
    id: "c1",
    title: "AI for Healthcare",
    status: "Active",
    description:
      "Design and prototype AI-driven solutions to improve diagnostics, triage, and patient outcomes.",
    participants: ["Alex", "Sam", "Priya"],
  },
  {
    id: "c2",
    title: "Sustainability Hack",
    status: "Upcoming",
    description: "Innovate to reduce carbon footprints and enable circular economies.",
    participants: ["Lee", "Jordan"],
  },
  {
    id: "c3",
    title: "FinTech Innovation",
    status: "Completed",
    description: "Create inclusive financial solutions using modern tech stacks.",
    participants: ["Taylor", "Morgan", "Chris"],
  },
];

export default async function ChallengeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const challenge = mockChallenges.find((c) => c.id === id);
  if (!challenge) return notFound();

  return (
    <div className="max-w-4xl mx-10 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{challenge.title}</h1>
          <p className="text-muted-foreground">Challenge overview and actions</p>
        </div>
        <Badge variant="secondary">{challenge.status}</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{challenge.description}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Participants</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-1">
            {challenge.participants.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button>Join</Button>
        <Button variant="outline"> solution</Button>
        <Button variant="outline">Start</Button>
        <Link href="/challenges">
          <Button variant="ghost">Back to Challenges</Button>
        </Link>
      </div>
    </div>
  );
}

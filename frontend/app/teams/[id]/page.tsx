import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const mockTeams = [
  {
    id: "t1",
    name: "Health Innovators",
    members: [
      { name: "Alex", role: "Developer" },
      { name: "Sam", role: "Designer" },
      { name: "Priya", role: "Data Scientist" },
    ],
  },
  {
    id: "t2",
    name: "GreenTech Squad",
    members: [
      { name: "Lee", role: "Researcher" },
      { name: "Jordan", role: "Developer" },
    ],
  },
  {
    id: "t3",
    name: "FinTech Wizards",
    members: [
      { name: "Taylor", role: "PM" },
      { name: "Morgan", role: "Developer" },
      { name: "Chris", role: "QA" },
    ],
  },
];

export default async function TeamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const team = mockTeams.find((t) => t.id === id);
  if (!team) return notFound();

  return (
    <div className="max-w-4xl mx-10 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{team.name}</h1>
          <p className="text-muted-foreground">Team overview, members and actions</p>
        </div>
        <Link href={`/chat/${team.id}`}>
          <Button>Open Chat</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y">
            {team.members.map((m) => (
              <li key={m.name} className="flex items-center justify-between py-2">
                <span className="font-medium">{m.name}</span>
                <span className="text-sm text-muted-foreground">{m.role}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Role Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Role management coming soon. Placeholder for assigning roles and permissions within the team.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline">Request Role Change</Button>
        <Link href="/teams">
          <Button variant="ghost">Back to Teams</Button>
        </Link>
      </div>
    </div>
  );
}

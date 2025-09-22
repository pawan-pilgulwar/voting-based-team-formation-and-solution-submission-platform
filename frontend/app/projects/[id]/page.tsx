import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const mockProjects = [
  {
    id: "p1",
    title: "Smart Triage App",
    status: "In Progress",
    description: "An ML-powered triage assistant for emergency rooms.",
    participants: ["Alex", "Sam", "Priya"],
    owner: "Team Health Innovators",
  },
  {
    id: "p2",
    title: "Carbon Tracker",
    status: "Planning",
    description: "A dashboard and mobile app to help campuses track carbon emissions.",
    participants: ["Lee", "Jordan"],
    owner: "GreenTech Squad",
  },
  {
    id: "p3",
    title: "MicroLoan Platform",
    status: "Completed",
    description: "Web platform to enable micro loans in underserved regions.",
    participants: ["Taylor", "Morgan", "Chris"],
    owner: "FinTech Wizards",
  },
];

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = mockProjects.find((p) => p.id === id);
  if (!project) return notFound();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{project.title}</h1>
          <p className="text-muted-foreground">Owned by {project.owner}</p>
        </div>
        <Badge variant="secondary">{project.status}</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{project.description}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Participants</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-1">
            {project.participants.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline">Request to Join</Button>
        <Link href="/projects">
          <Button variant="ghost">Back to Projects</Button>
        </Link>
      </div>
    </div>
  );
}

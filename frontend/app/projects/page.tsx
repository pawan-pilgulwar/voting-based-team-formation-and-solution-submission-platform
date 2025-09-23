import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const mockProjects = [
  {
    id: "p1",
    title: "Smart Triage App",
    status: "In Progress",
    owner: "Team Health Innovators",
    summary: "Mobile app to prioritize ER patients using ML.",
  },
  {
    id: "p2",
    title: "Carbon Tracker",
    status: "Planning",
    owner: "GreenTech Squad",
    summary: "Track and reduce carbon emissions for campuses.",
  },
  {
    id: "p3",
    title: "MicroLoan Platform",
    status: "Completed",
    owner: "FinTech Wizards",
    summary: "Enable micro loans for underserved communities.",
  },
] as const;

export default function ProjectsPage() {
  return (
    <div className="max-w-6xl mx-10 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
        <p className="text-muted-foreground">Discover projects across teams and challenges.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockProjects.map((p) => (
          <Card key={p.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-lg">{p.title}</CardTitle>
                <Badge variant="secondary">{p.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{p.summary}</p>
              <p className="text-sm"><span className="text-muted-foreground">Owner:</span> {p.owner}</p>
              <Link href={`/projects/${p.id}`}>
                <Button className="w-full">View Details</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

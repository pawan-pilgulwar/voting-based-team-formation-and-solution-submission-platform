import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function StudentDashboardPage() {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Welcome back, Student!</CardTitle>
            <CardDescription>
              Continue your journey by exploring challenges, collaborating with teams, and showcasing your projects.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/dashboard/challenges">Browse Challenges</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard/teams">Find/Manage Teams</Link>
              </Button>
              <Button variant="secondary" asChild>
                <Link href="/dashboard/projects">My Projects</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>Mock overview</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-2">
              <li>Active Challenges: 2</li>
              <li>Team Invites: 1</li>
              <li>Open Tasks: 5</li>
            </ul>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>My Challenges</CardTitle>
            <CardDescription>Jump back into your work</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full" asChild>
              <Link href="#">AI for Social Good</Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href="#">Green Energy Hack</Link>
            </Button>
            <Button variant="ghost" className="w-full" asChild>
              <Link href="/dashboard/challenges">View all</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Teams</CardTitle>
            <CardDescription>Collaborations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full" asChild>
              <Link href="#">Team Phoenix</Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href="#">Quantum Crew</Link>
            </Button>
            <Button variant="ghost" className="w-full" asChild>
              <Link href="/dashboard/teams">Manage teams</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Projects</CardTitle>
            <CardDescription>Showcase your work</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full" asChild>
              <Link href="#">Smart Irrigation</Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href="#">Campus Navigator</Link>
            </Button>
            <Button variant="ghost" className="w-full" asChild>
              <Link href="/dashboard/projects">View all</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

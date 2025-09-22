import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function MentorDashboardPage() {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Welcome, Mentor!</CardTitle>
            <CardDescription>
              Review assigned challenges, guide teams, and evaluate submissions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/dashboard/challenges">Assigned Challenges</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard/teams">My Teams</Link>
              </Button>
              <Button variant="secondary" asChild>
                <Link href="#">Pending Reviews</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>At a glance</CardTitle>
            <CardDescription>Mock overview</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-2">
              <li>Assigned Challenges: 3</li>
              <li>Active Teams: 4</li>
              <li>Pending Reviews: 6</li>
            </ul>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Assigned Challenges</CardTitle>
            <CardDescription>Your current mentorship scope</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span>Healthcare Analytics</span>
              <Button size="sm" variant="outline" asChild>
                <Link href="#">View</Link>
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <span>Climate Data Insights</span>
              <Button size="sm" variant="outline" asChild>
                <Link href="#">View</Link>
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <span>Smart Mobility</span>
              <Button size="sm" variant="outline" asChild>
                <Link href="#">View</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Submissions to Review</CardTitle>
            <CardDescription>Latest pending reviews</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Team Phoenix</div>
                <div className="text-sm text-muted-foreground">AI for Social Good</div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary">Preview</Button>
                <Button size="sm">Review</Button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Quantum Crew</div>
                <div className="text-sm text-muted-foreground">Green Energy Hack</div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary">Preview</Button>
                <Button size="sm">Review</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

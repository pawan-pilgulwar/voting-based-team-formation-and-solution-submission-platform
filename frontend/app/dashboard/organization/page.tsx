import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function OrganizationDashboardPage() {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Challenges</CardTitle>
            <CardDescription>Hosted so far</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">12</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Active Participants</CardTitle>
            <CardDescription>Across all challenges</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">842</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Submissions</CardTitle>
            <CardDescription>Awaiting review</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">37</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Avg. Rating</CardTitle>
            <CardDescription>Community feedback</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">4.6</div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Manage Hosted Challenges</CardTitle>
            <CardDescription>Create and update your organization challenges</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="#">Create Challenge</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/challenges">View All Challenges</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reports & Insights</CardTitle>
            <CardDescription>Track performance and outcomes</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button variant="secondary">Download Summary</Button>
            <Button variant="outline">Open Analytics</Button>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest events across hosted challenges</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>Team &quot;Innovators&quot; submitted to &quot;Smart Cities&quot;</div>
            <div>New challenge draft created: &quot;Waste Management&quot;</div>
            <div>Mentor &quot;Dr. Lee&quot; added to &quot;HealthTech 2025&quot;</div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

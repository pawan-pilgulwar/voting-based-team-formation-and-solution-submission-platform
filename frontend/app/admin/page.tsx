import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";

export default function AdminHomePage() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
            <CardDescription>Registered on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">1,284</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Challenges</CardTitle>
            <CardDescription>Open for submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">42</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reports Pending</CardTitle>
            <CardDescription>Needing admin review</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">19</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


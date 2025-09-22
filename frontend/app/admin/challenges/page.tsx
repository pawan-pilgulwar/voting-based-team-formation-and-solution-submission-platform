import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function AdminChallengesPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Challenges</CardTitle>
            <div className="flex items-center gap-2">
              <Input placeholder="Search challenges..." className="h-9 w-[220px]" />
              <Button size="sm">Create New Challenge</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>Manage platform challenges.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Submissions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { title: 'Sustainability Hack', submissions: 23, status: 'active' as const },
                { title: 'AI for Good', submissions: 11, status: 'completed' as const },
                { title: 'Smart Mobility', submissions: 7, status: 'active' as const },
              ].map((c) => (
                <TableRow key={c.title}>
                  <TableCell className="font-medium">{c.title}</TableCell>
                  <TableCell>{c.submissions}</TableCell>
                  <TableCell>
                    {c.status === 'active' ? (
                      <Badge variant="default">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Completed</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="sm">View</Button>
                      <Button variant="outline" size="sm">Edit</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}


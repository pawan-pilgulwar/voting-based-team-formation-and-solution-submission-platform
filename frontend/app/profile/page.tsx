"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ProfileCard, UserRole } from "@/components/ui/ProfileCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function useMockUser() {
  // In a real app, replace with session/auth context
  const [role, setRole] = useState<UserRole>("student");
  const user = useMemo(
    () => ({
      name: "Alex Johnson",
      email: "alex.johnson@example.com",
      role,
      avatarUrl: undefined as string | undefined,
    }),
    [role]
  );
  return { user, setRole };
}

export default function ProfilePage() {
  const { user, setRole } = useMockUser();

  return (
    <div className="max-w-6xl mx-10 space-y-6">
      {/* Header: Profile card and role switcher (mock) */}
      <div className="flex flex-col gap-4">
        <ProfileCard
          name={user.name}
          email={user.email}
          role={user.role}
          onAvatarUpload={(file) => {
            // mock upload
            console.log("Avatar selected:", file.name);
          }}
        />
        <div className="flex items-center gap-3">
          <Label htmlFor="role">Preview as role</Label>
          <Select value={user.role} onValueChange={(v) => setRole(v as UserRole)}>
            <SelectTrigger id="role" className="w-[200px]">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="student">Student</SelectItem>
              <SelectItem value="mentor">Mentor</SelectItem>
              <SelectItem value="organization">Organization</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Shared editable details (mock read-only for email) */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={user.name} readOnly />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={user.email} readOnly />
          </div>
        </CardContent>
      </Card>

      {/* Role specific sections */}
      {user.role === "student" && <StudentSections />}
      {user.role === "mentor" && <MentorSections />}
      {user.role === "organization" && <OrganizationSections />}
      {user.role === "admin" && <AdminSections />}
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function StudentSections() {
  const enrolledChallenges = [
    { id: "c1", title: "AI for Healthcare", status: "Active" },
    { id: "c2", title: "Sustainability Hack", status: "Upcoming" },
  ];
  const teams = [
    { id: "t1", name: "Health Innovators" },
    { id: "t2", name: "GreenTech Squad" },
  ];
  const projects = [
    { id: "p1", title: "Smart Triage App" },
    { id: "p2", title: "Carbon Tracker" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <SectionCard title="Enrolled Challenges">
        <ul className="space-y-2">
          {enrolledChallenges.map((c) => (
            <li key={c.id} className="flex items-center justify-between">
              <div>
                <p className="font-medium">{c.title}</p>
                <p className="text-sm text-muted-foreground">{c.status}</p>
              </div>
              <Link href={`/challenges/${c.id}`}>
                <Button variant="outline" size="sm">View</Button>
              </Link>
            </li>
          ))}
        </ul>
      </SectionCard>
      <SectionCard title="My Teams">
        <ul className="space-y-2">
          {teams.map((t) => (
            <li key={t.id} className="flex items-center justify-between">
              <p className="font-medium">{t.name}</p>
              <div className="flex gap-2">
                <Link href={`/teams/${t.id}`}>
                  <Button variant="outline" size="sm">Open</Button>
                </Link>
                <Link href={`/chat/${t.id}`}>
                  <Button size="sm">Chat</Button>
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </SectionCard>
      <SectionCard title="My Projects">
        <ul className="space-y-2">
          {projects.map((p) => (
            <li key={p.id} className="flex items-center justify-between">
              <p className="font-medium">{p.title}</p>
              <Link href={`/projects/${p.id}`}>
                <Button variant="outline" size="sm">Details</Button>
              </Link>
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  );
}

function MentorSections() {
  const assigned = [
    { id: "c3", title: "FinTech Challenge", type: "Challenge" },
    { id: "t9", title: "Quant Ninjas", type: "Team" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <SectionCard title="Assigned Challenges/Teams">
        <ul className="space-y-2">
          {assigned.map((a) => (
            <li key={a.id} className="flex items-center justify-between">
              <div>
                <p className="font-medium">{a.title}</p>
                <p className="text-sm text-muted-foreground">{a.type}</p>
              </div>
              <Link href={a.type === "Team" ? `/teams/${a.id}` : `/challenges/${a.id}`}>
                <Button variant="outline" size="sm">Open</Button>
              </Link>
            </li>
          ))}
        </ul>
      </SectionCard>
      <SectionCard title="Expertise / Skills">
        <div className="space-y-3">
          <Label htmlFor="skills">Skills (comma separated)</Label>
          <Input id="skills" placeholder="e.g., React, Data Science, UX" />
          <Button>Save</Button>
        </div>
      </SectionCard>
    </div>
  );
}

function OrganizationSections() {
  const hosted = [
    { id: "c10", title: "Smart Cities Hackathon", status: "Active" },
    { id: "c11", title: "EdTech Innovation", status: "Completed" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <SectionCard title="Hosted Challenges">
        <ul className="space-y-2">
          {hosted.map((c) => (
            <li key={c.id} className="flex items-center justify-between">
              <div>
                <p className="font-medium">{c.title}</p>
                <p className="text-sm text-muted-foreground">{c.status}</p>
              </div>
              <Link href={`/challenges/${c.id}`}>
                <Button variant="outline" size="sm">Manage</Button>
              </Link>
            </li>
          ))}
        </ul>
      </SectionCard>
      <SectionCard title="Organization Details">
        <div className="grid grid-cols-1 gap-3">
          <div className="space-y-1">
            <Label>Name</Label>
            <Input placeholder="Org Name" defaultValue="Global Student Network" />
          </div>
          <div className="space-y-1">
            <Label>Website</Label>
            <Input placeholder="https://example.org" defaultValue="https://gsn.example.org" />
          </div>
          <div className="space-y-1">
            <Label>Contact Email</Label>
            <Input placeholder="contact@example.org" defaultValue="contact@gsn.org" />
          </div>
          <div>
            <Button>Save</Button>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

function AdminSections() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <SectionCard title="Admin Overview">
        <p className="text-sm text-muted-foreground">
          You are logged in as an admin. Manage users, challenges, and platform settings.
        </p>
      </SectionCard>
      <SectionCard title="Quick Actions">
        <div className="flex flex-wrap gap-3">
          <Link href="/admin">
            <Button>Go to Admin Dashboard</Button>
          </Link>
          <Link href="/challenges">
            <Button variant="outline">View Challenges</Button>
          </Link>
        </div>
      </SectionCard>
    </div>
  );
}

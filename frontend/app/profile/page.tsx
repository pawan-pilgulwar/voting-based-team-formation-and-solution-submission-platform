"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { ProfileCard } from "@/components/ui/ProfileCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

type UiRole = "student" | "mentor" | "organization" | "admin";

export default function ProfilePage() {
  const { user, updateProfile, changePassword, fetchUser } = useAuth();
  const uiRole: UiRole = useMemo(() => {
    if (!user?.role) return "student";
    switch (user.role) {
      case "mentor":
        return "mentor";
      case "orgAdmin":
        return "organization";
      case "superAdmin":
        return "admin";
      case "student":
      default:
        return "student";
    }
  }, [user?.role]);

  const [editOpen, setEditOpen] = useState(false);
  const [pwdOpen, setPwdOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pwdSaving, setPwdSaving] = useState(false);

  const [form, setForm] = useState({
    name: user?.name || "",
    username: user?.username || "",
    email: user?.email || "",
    institution: user?.institution || "",
    bio: user?.bio || "",
    // role specific
    gender: user?.gender || "",
    year: user?.year ?? ("" as any),
    branch: user?.branch || "",
    skills: (user?.skills || []).join(", "),
    preferredTeamRoles: (user as any)?.preferredTeamRoles?.join(", ") || "",
    expertise: (user?.expertise || []).join(", "),
    availability: user?.availability || "",
    organizationName: user?.organizationName || "",
    designation: user?.designation || "",
  });

  const [pwdForm, setPwdForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [avatarFile, setAvatarFile] = useState<File | undefined>(undefined);
  const [coverFile, setCoverFile] = useState<File | undefined>(undefined);

  const onSaveProfile = async () => {
    setSaving(true);
    try {
      const payload: any = {
        name: form.name,
        institution: form.institution,
        bio: form.bio,
      };
      if (user?.role === "student") {
        if (form.gender) payload.gender = form.gender;
        if (form.year) payload.year = Number(form.year);
        if (form.branch) payload.branch = form.branch;
        if (form.skills) payload.skills = form.skills.split(",").map((s) => s.trim()).filter(Boolean);
        if (form.preferredTeamRoles) payload.preferredTeamRoles = form.preferredTeamRoles.split(",").map((s: any) => s.trim()).filter(Boolean);
      } else if (user?.role === "mentor") {
        if (form.gender) payload.gender = form.gender;
        if (form.expertise) payload.expertise = form.expertise.split(",").map((s: any) => s.trim()).filter(Boolean);
        if (form.availability) payload.availability = form.availability;
        if (form.skills) payload.skills = form.skills.split(",").map((s: any) => s.trim()).filter(Boolean);
      } else if (user?.role === "orgAdmin") {
        if (form.organizationName) payload.organizationName = form.organizationName;
        if (form.designation) payload.designation = form.designation;
      }
      await updateProfile(payload, { avatar: avatarFile, coverImage: coverFile });
      await fetchUser();
      setEditOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const onChangePassword = async () => {
    setPwdSaving(true);
    try {
      await changePassword(pwdForm);
      setPwdOpen(false);
      setPwdForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } finally {
      setPwdSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-6xl mx-10 space-y-6">
      <div className="flex flex-col gap-4">
        <ProfileCard
          name={user.name}
          email={user.email}
          role={uiRole}
          avatarUrl={user?.avatar}
          coverUrl={user?.coverImage}
        />
        <div className="flex gap-3">
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogTrigger asChild>
              <Button>Edit Profile</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Profile</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input value={form.username} disabled />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Email</Label>
                  <Input value={form.email} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Institution</Label>
                  <Input value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Bio</Label>
                  <Input value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
                </div>

                <div className="space-y-2">
                  <Label>Avatar</Label>
                  <Input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files?.[0])} />
                </div>
                <div className="space-y-2">
                  <Label>Cover Image</Label>
                  <Input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0])} />
                </div>

                {user.role === "student" && (
                  <>
                    <div className="space-y-2">
                      <Label>Gender</Label>
                      <Input placeholder="male | female | other" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Year</Label>
                      <Input type="number" value={form.year as any} onChange={(e) => setForm({ ...form, year: e.target.value })} />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Branch</Label>
                      <Input value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })} />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Skills (comma separated)</Label>
                      <Input value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Preferred Team Roles (comma separated)</Label>
                      <Input value={form.preferredTeamRoles} onChange={(e) => setForm({ ...form, preferredTeamRoles: e.target.value })} />
                    </div>
                  </>
                )}

                {user.role === "mentor" && (
                  <>
                    <div className="space-y-2">
                      <Label>Gender</Label>
                      <Input placeholder="male | female | other" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Expertise (comma separated)</Label>
                      <Input value={form.expertise} onChange={(e) => setForm({ ...form, expertise: e.target.value })} />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Availability</Label>
                      <Input value={form.availability} onChange={(e) => setForm({ ...form, availability: e.target.value })} />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Skills (comma separated)</Label>
                      <Input value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} />
                    </div>
                  </>
                )}

                {user.role === "orgAdmin" && (
                  <>
                    <div className="space-y-2">
                      <Label>Organization Name</Label>
                      <Input value={form.organizationName} onChange={(e) => setForm({ ...form, organizationName: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Designation</Label>
                      <Input value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} />
                    </div>
                  </>
                )}
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
                <Button onClick={onSaveProfile} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={pwdOpen} onOpenChange={setPwdOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Change Password</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Change Password</DialogTitle>
              </DialogHeader>
              <div className="grid gap-3">
                <div className="space-y-2">
                  <Label>Current Password</Label>
                  <Input type="password" value={pwdForm.currentPassword} onChange={(e) => setPwdForm({ ...pwdForm, currentPassword: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <Input type="password" value={pwdForm.newPassword} onChange={(e) => setPwdForm({ ...pwdForm, newPassword: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Confirm Password</Label>
                  <Input type="password" value={pwdForm.confirmPassword} onChange={(e) => setPwdForm({ ...pwdForm, confirmPassword: e.target.value })} />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setPwdOpen(false)}>Cancel</Button>
                <Button onClick={onChangePassword} disabled={pwdSaving}>{pwdSaving ? "Updating..." : "Update"}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

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
          {user.institution && (
            <div className="space-y-2 sm:col-span-2">
              <Label>Institution</Label>
              <Input value={user.institution} readOnly />
            </div>
          )}
          {user.bio && (
            <div className="space-y-2 sm:col-span-2">
              <Label>Bio</Label>
              <Input value={user.bio} readOnly />
            </div>
          )}

          {user.role === "student" && (
            <>
              {user.gender && (
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Input value={user.gender} readOnly />
                </div>
              )}
              {typeof user.year !== "undefined" && (
                <div className="space-y-2">
                  <Label>Year</Label>
                  <Input value={String(user.year)} readOnly />
                </div>
              )}
              {user.branch && (
                <div className="space-y-2">
                  <Label>Branch</Label>
                  <Input value={user.branch} readOnly />
                </div>
              )}
              {(user.skills && user.skills.length > 0) && (
                <div className="space-y-2 sm:col-span-2">
                  <Label>Skills</Label>
                  <Input value={user.skills.join(", ")} readOnly />
                </div>
              )}
            </>
          )}

          {user.role === "mentor" && (
            <>
              {user.gender && (
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Input value={user.gender} readOnly />
                </div>
              )}
              {(user.expertise && user.expertise.length > 0) && (
                <div className="space-y-2 sm:col-span-2">
                  <Label>Expertise</Label>
                  <Input value={user.expertise.join(", ")} readOnly />
                </div>
              )}
              {user.availability && (
                <div className="space-y-2 sm:col-span-2">
                  <Label>Availability</Label>
                  <Input value={user.availability} readOnly />
                </div>
              )}
              {(user.skills && user.skills.length > 0) && (
                <div className="space-y-2 sm:col-span-2">
                  <Label>Skills</Label>
                  <Input value={user.skills.join(", ")} readOnly />
                </div>
              )}
            </>
          )}

          {user.role === "orgAdmin" && (
            <>
              {user.organizationName && (
                <div className="space-y-2">
                  <Label>Organization Name</Label>
                  <Input value={user.organizationName} readOnly />
                </div>
              )}
              {user.designation && (
                <div className="space-y-2">
                  <Label>Designation</Label>
                  <Input value={user.designation} readOnly />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
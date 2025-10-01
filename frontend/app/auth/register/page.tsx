"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const Page = () => {
  const [role, setRole] = useState("");
  const { setUser } = useAuth();
  const router = useRouter();

  // Common fields
  const [common, setCommon] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });

  // Role-specific fields
  const [student, setStudent] = useState({
    gender: "",
    year: "",
    branch: "",
    skills: "",
    preferredTeamRoles: "",
  });

  const [mentor, setMentor] = useState({
    gender: "",
    skills: "",
    availability: "",
  });

  const [orgAdmin, setOrgAdmin] = useState({
    organizationName: "",
    designation: "",
  });

  // // Common input handler
  const handleCommonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type, checked } = e.target;
    setCommon((prev) => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value,
    }));
  };

  // Role-specific input handler
  const handleRoleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;

    if (role === "student") {
      setStudent((prev) => ({ ...prev, [id]: value }));
    } else if (role === "mentor") {
      setMentor((prev) => ({ ...prev, [id]: value }));
    } else if (role === "orgAdmin") {
      setOrgAdmin((prev) => ({ ...prev, [id]: value }));
    }
  };

  // Submit
  const handleSubmit = async () => {
    try {
      const payload = {
        ...common,
        role,
        ...(role === "student" ? student : {}),
        ...(role === "mentor" ? mentor : {}),
        ...(role === "orgAdmin" ? orgAdmin : {}),
      };

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/register`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (!res.status.toString().startsWith("2")) {
        throw new Error("Failed to fetch user");
      }

      if (res.status === 200) {
        setUser(res.data.user); // <-- update context immediately
        router.push("/dashboard");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="w-full flex items-center justify-center py-10">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Create your account</CardTitle>
          <CardDescription>Join the global student network</CardDescription>
        </CardHeader>

        <CardContent>
          <form className="flex flex-col gap-6">
            {/* Basic Info */}
            <div className="grid gap-2">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                type="text"
                onChange={handleCommonChange}
                placeholder="Jane Doe"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                onChange={handleCommonChange}
                placeholder="m@example.com"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                onChange={handleCommonChange}
                placeholder="jane_doe"
                required
              />
            </div>

            {/* Role Selection */}
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Select onValueChange={(value) => setRole(value)}>
                <SelectTrigger id="role" className="w-full">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="mentor">Mentor</SelectItem>
                  <SelectItem value="orgAdmin">Organization</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Role-specific fields */}
            {role === "student" && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    onValueChange={(val) =>
                      setStudent((prev) => ({ ...prev, gender: val }))
                    }
                  >
                    <SelectTrigger id="gender" className="w-full">
                      <SelectValue placeholder="Select your gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    type="number"
                    onChange={handleRoleChange}
                    min={1}
                    max={5}
                    placeholder="2"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="branch">Branch</Label>
                  <Input
                    id="branch"
                    type="text"
                    onChange={handleRoleChange}
                    placeholder="CSE"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="skills">Skills (comma separated)</Label>
                  <Input
                    id="skills"
                    type="text"
                    onChange={handleRoleChange}
                    placeholder="react, ml, iot"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="preferredTeamRoles">
                    Preferred Team Roles
                  </Label>
                  <Input
                    id="preferredTeamRoles"
                    type="text"
                    onChange={handleRoleChange}
                    placeholder="Leader, Developer, Designer"
                  />
                </div>
              </>
            )}

            {role === "mentor" && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    onValueChange={(val) =>
                      setMentor((prev) => ({ ...prev, gender: val }))
                    }
                  >
                    <SelectTrigger id="gender" className="w-full">
                      <SelectValue placeholder="Select your gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="skills">
                    Skills / Expertise (comma separated)
                  </Label>
                  <Input
                    id="skills"
                    type="text"
                    onChange={handleRoleChange}
                    placeholder="AI, Web Dev"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="availability">Availability</Label>
                  <Input
                    id="availability"
                    type="text"
                    onChange={handleRoleChange}
                    placeholder="Weekends"
                  />
                </div>
              </>
            )}

            {role === "orgAdmin" && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="organizationName">Organization Name</Label>
                  <Input
                    id="organizationName"
                    type="text"
                    onChange={handleRoleChange}
                    placeholder="ABC Org"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="designation">Designation</Label>
                  <Input
                    id="designation"
                    type="text"
                    onChange={handleRoleChange}
                    placeholder="Coordinator"
                  />
                </div>
              </>
            )}

            {/* Common fields */}
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                onChange={handleCommonChange}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                onChange={handleCommonChange}
                type="password"
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                onChange={(e: any) => handleCommonChange(e)}
                required
              />
              <Label htmlFor="terms" className="text-sm text-muted-foreground">
                I agree to the terms and privacy policy
              </Label>
            </div>

            <Button type="button" onClick={handleSubmit} className="w-full">
              Create account
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex-col gap-2">
          <Button variant="outline" className="w-full">
            Continue with Google
          </Button>
          <Button variant="link" asChild>
            <Link href="/auth/login">Already have an account? Sign in</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Page;

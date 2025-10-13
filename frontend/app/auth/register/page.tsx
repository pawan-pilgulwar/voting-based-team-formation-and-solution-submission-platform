"use client";

import React, { useEffect, useState } from "react";
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
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const Page = () => {
  const [role, setRole] = useState("");
  const { setUser, user, loading, setLoading } = useAuth();
  const router = useRouter();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  // Zod schema
  const schema = z
    .object({
      name: z.string().min(2, { message: "Name is too short" }),
      email: z.string().email({ message: "Enter a valid email" }),
      username: z.string().min(3, { message: "Username is too short" }).toLowerCase(),
      password: z.string().min(6, { message: "Min 6 characters" }),
      confirmPassword: z.string().min(6, { message: "Min 6 characters" }),
      role: z.enum(["student", "mentor", "orgAdmin", "superAdmin"], {
        errorMap: () => ({ message: "Select your role" }),
      }),
      gender: z.string().optional(),
      year: z.coerce.number().int().min(1).max(8).optional(),
      branch: z.string().optional(),
      skills: z.string().optional(),
      expertise: z.string().optional(),
      preferredTeamRoles: z.string().optional(),
      availability: z.string().optional(),
      organizationName: z.string().optional(),
      designation: z.string().optional(),
      bio: z.string().max(1000).optional(),
      institution: z.string().optional(),
      social_linkedin: z.string().url().optional().or(z.literal("")),
      social_github: z.string().url().optional().or(z.literal("")),
      social_website: z.string().url().optional().or(z.literal("")),
      terms: z.boolean(),
    })
    .refine((d: any) => d.password === d.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    })
    .refine((d: any) => (d.role === "student" || d.role === "mentor" ? !!d.gender : true), {
      message: "Gender is required",
      path: ["gender"],
    })
    .refine((d: any) => d.terms === true, {
      message: "You must accept terms",
      path: ["terms"],
    });

  type FormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
      role: undefined as any,
      terms: false,
    },
    mode: "onBlur",
  });

  const currentRole = watch("role");

  // If already authenticated, redirect away
  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

  // Submit
  const onSubmit = async (values: FormValues) => {
    try {
      setLoading(true);
      const fd = new FormData();
      fd.append("name", values.name);
      fd.append("email", values.email);
      fd.append("username", values.username);
      fd.append("password", values.password);
      fd.append("role", values.role as string);

      if (values.bio) fd.append("bio", values.bio);
      if (values.institution) fd.append("institution", values.institution);
      if (values.social_linkedin) fd.append("social[linkedin]", values.social_linkedin);
      if (values.social_github) fd.append("social[github]", values.social_github);
      if (values.social_website) fd.append("social[website]", values.social_website);

      if (values.role === "student") {
        if (values.gender) fd.append("gender", values.gender);
        if (values.year) fd.append("year", String(values.year));
        if (values.branch) fd.append("branch", values.branch);
        if (values.skills) fd.append("skills", values.skills);
        if (values.preferredTeamRoles) fd.append("preferredTeamRoles", values.preferredTeamRoles);
      } else if (values.role === "mentor") {
        if (values.gender) fd.append("gender", values.gender);
        if (values.skills) fd.append("skills", values.skills);
        if (values.expertise) fd.append("expertise", values.expertise);
        if (values.availability) fd.append("availability", values.availability);
      } else if (values.role === "orgAdmin") {
        if (values.organizationName) fd.append("organizationName", values.organizationName);
        if (values.designation) fd.append("designation", values.designation);
      }

      if (avatarFile) fd.append("avatar", avatarFile);
      if (coverFile) fd.append("coverImage", coverFile);

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/register`,
        fd,
        {
          withCredentials: true,
        }
      );

      if (!res.status.toString().startsWith("2")) {
        throw new Error("Failed to fetch user");
      }

      setUser(res.data.data.user);

    } catch (error) {
      console.log(error);
    } finally { setLoading(false); }
  };

  return (
    <div className="w-full flex items-center justify-center py-10">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Create your account</CardTitle>
          <CardDescription>Join the global student network</CardDescription>
        </CardHeader>

        <CardContent>
          <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Basic Info */}
            <div className="grid gap-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" type="text" placeholder="Jane Doe" {...register("name")} />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="m@example.com" {...register("email")} />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" type="text" placeholder="jane_doe" {...register("username")} />
              {errors.username && (
                <p className="text-xs text-red-500">{errors.username.message}</p>
              )}
            </div>

            {/* Profile Images */}
            <div className="grid gap-2">
              <Label htmlFor="avatar">Profile image</Label>
              <Input id="avatar" type="file" accept="image/*" onChange={(e) => {
                const f = e.target.files?.[0];
                setAvatarFile(f || null);
              }} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="coverImage">Cover image</Label>
              <Input id="coverImage" type="file" accept="image/*" onChange={(e) => {
                const f = e.target.files?.[0];
                setCoverFile(f || null);
              }} />
            </div>

            {/* Role Selection */}
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Select onValueChange={(value) => { setRole(value); setValue("role", value as any, { shouldValidate: true }); }}>
                <SelectTrigger id="role" className="w-full">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="mentor">Mentor</SelectItem>
                  <SelectItem value="orgAdmin">Organization</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-xs text-red-500">{errors.role.message as any}</p>
              )}
            </div>

            {/* Role-specific fields */}
            {role === "student" && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select onValueChange={(val) => { setValue("gender", val as any, { shouldValidate: true }); }}>
                    <SelectTrigger id="gender" className="w-full">
                      <SelectValue placeholder="Select your gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.gender && (
                    <p className="text-xs text-red-500">{errors.gender.message as any}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="year">Year</Label>
                  <Input id="year" type="number" min={1} max={8} placeholder="2" {...register("year")} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="branch">Branch</Label>
                  <Input id="branch" type="text" placeholder="CSE" {...register("branch")} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="skills">Skills (comma separated)</Label>
                  <Input id="skills" type="text" placeholder="react, ml, iot" {...register("skills")} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="preferredTeamRoles">
                    Preferred Team Roles
                  </Label>
                  <Input id="preferredTeamRoles" type="text" placeholder="Leader, Developer, Designer" {...register("preferredTeamRoles")} />
                </div>
              </>
            )}

            {role === "mentor" && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select onValueChange={(val) => { setValue("gender", val as any, { shouldValidate: true }); }}>
                    <SelectTrigger id="gender" className="w-full">
                      <SelectValue placeholder="Select your gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.gender && (
                    <p className="text-xs text-red-500">{errors.gender.message as any}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="skills">
                    Skills / Expertise (comma separated)
                  </Label>
                  <Input id="skills" type="text" placeholder="AI, Web Dev" {...register("skills")} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="expertise">Expertise (comma separated)</Label>
                  <Input id="expertise" type="text" placeholder="AI, Web Dev" {...register("expertise")} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="availability">Availability</Label>
                  <Input id="availability" type="text" placeholder="Weekends" {...register("availability")} />
                </div>
              </>
            )}

            {role === "orgAdmin" && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="organizationName">Organization Name</Label>
                  <Input id="organizationName" type="text" placeholder="ABC Org" {...register("organizationName")} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="designation">Designation</Label>
                  <Input id="designation" type="text" placeholder="Coordinator" {...register("designation")} />
                </div>
              </>
            )}

            {/* Common fields */}
            <div className="grid gap-2">
              <Label htmlFor="bio">Bio</Label>
              <Input id="bio" type="text" placeholder="Tell us about yourself" {...register("bio")} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="institution">Institution</Label>
              <Input id="institution" type="text" placeholder="Your college/university" {...register("institution")} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="social_linkedin">LinkedIn</Label>
              <Input id="social_linkedin" type="url" placeholder="https://linkedin.com/in/..." {...register("social_linkedin")} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="social_github">GitHub</Label>
              <Input id="social_github" type="url" placeholder="https://github.com/username" {...register("social_github")} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="social_website">Website</Label>
              <Input id="social_website" type="url" placeholder="https://yourdomain.com" {...register("social_website")} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...register("password")} />
              {errors.password && (
                <p className="text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input id="confirmPassword" type="password" {...register("confirmPassword")} />
              {errors.confirmPassword && (
                <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="terms" onCheckedChange={(val: any) => setValue("terms", Boolean(val), { shouldValidate: true })} />
              <Label htmlFor="terms" className="text-sm text-muted-foreground">
                I agree to the terms and privacy policy
              </Label>
            </div>
            {errors.terms && (
              <p className="text-xs text-red-500">{errors.terms.message}</p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating..." : "Create account"}
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

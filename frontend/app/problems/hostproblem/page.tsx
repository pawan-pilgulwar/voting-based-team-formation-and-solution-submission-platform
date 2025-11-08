"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

// 🧩 Zod validation schema
const problemSchema = z.object({
  title: z.string().min(5, "Title is too short"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  tags: z.string().min(1, "At least one tag required"),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
  deadline: z.string().optional(),
  status: z.enum(["open", "in-progress", "completed", "archived"]).default("open"),
});

type ProblemFormData = z.infer<typeof problemSchema>;

export default function HostProblemPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ProblemFormData>({
    resolver: zodResolver(problemSchema),
    defaultValues: {
      difficulty: "medium",
      status: "open",
    },
  });

  const onSubmit = async (values: ProblemFormData) => {
    try {
      setLoading(true);

      const payload = {
        title: values.title,
        description: values.description,
        tags: values.tags.split(",").map((tag) => tag.trim()),
        difficulty: values.difficulty,
        status: values.status,
        deadline: values.deadline ? new Date(values.deadline) : null,
      };

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/problems/create-problem`,
        payload,
        { withCredentials: true }
      );

      if (!res.status.toString().startsWith("2")) {
        throw new Error("Failed to create problem");
      }

      toast?.({
        title: "Problem Hosted!",
        description: "Your challenge has been created successfully.",
      });

      router.push("/problems");
    } catch (err) {
      console.error(err);
      toast?.({
        title: "Error",
        description: "Failed to host problem. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Optional: restrict access
  if (!user) {
    return (
      <div className="w-full text-center py-20">
        <p className="text-lg text-muted-foreground">
          Please log in to host a problem.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full flex items-center justify-center py-10">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle>Host a New Problem</CardTitle>
          <CardDescription>
            Create a challenge or problem statement for students to solve.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Title */}
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" placeholder="AI-based Waste Management" {...register("title")} />
              {errors.title && (
                <p className="text-xs text-red-500">{errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Provide a detailed problem statement..."
                rows={5}
                {...register("description")}
              />
              {errors.description && (
                <p className="text-xs text-red-500">{errors.description.message}</p>
              )}
            </div>

            {/* Tags */}
            <div className="grid gap-2">
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input id="tags" placeholder="AI, Healthcare, Web" {...register("tags")} />
              {errors.tags && (
                <p className="text-xs text-red-500">{errors.tags.message}</p>
              )}
            </div>

            {/* Difficulty */}
            <div className="grid gap-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select
                onValueChange={(val) => setValue("difficulty", val as any, { shouldValidate: true })}
              >
                <SelectTrigger id="difficulty">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
              {errors.difficulty && (
                <p className="text-xs text-red-500">{errors.difficulty.message}</p>
              )}
            </div>

            {/* Deadline */}
            <div className="grid gap-2">
              <Label htmlFor="deadline">Deadline</Label>
              <Input id="deadline" type="date" {...register("deadline")} />
            </div>

            {/* Status */}
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                onValueChange={(val) => setValue("status", val as any, { shouldValidate: true })}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating..." : "Host Problem"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Need help? Contact admin for posting guidelines.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

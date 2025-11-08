"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { createProblem } from "@/lib/api";

const schema = z.object({
  title: z.string().min(4, "Title too short"),
  description: z.string().min(20, "Description too short"),
  tags: z.string().optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
});

type FormValues = z.infer<typeof schema>;

export default function CreateProblemPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { difficulty: "medium" },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      setSubmitting(true);
      const payload = {
        title: values.title,
        description: values.description,
        tags: values.tags ? values.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        difficulty: values.difficulty,
      } as const;
      await createProblem(payload);
      toast?.({ title: "Problem Created", description: "Your problem has been posted." });
      router.push("/problems");
    } catch (e: any) {
      toast?.({ title: "Create Failed", description: e?.response?.data?.message || e?.message || "Something went wrong" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create Problem</CardTitle>
          <CardDescription>Post a new challenge for students and mentors.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" placeholder="Enter a concise title" {...register("title")} />
              {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={8} placeholder="Explain the problem, expectations, and deliverables" {...register("description")} />
              {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input id="tags" placeholder="ai, web, healthcare" {...register("tags")} />
            </div>

            <div className="grid gap-2">
              <Label>Difficulty</Label>
              <Select onValueChange={(v) => setValue("difficulty", v as any, { shouldValidate: true })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={submitting}>{submitting ? "Creating..." : "Create"}</Button>
              <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

import { z } from "zod";

export const schema = z
    .object({
      name: z.string().min(2, { message: "Name is too short" }),

    email: z.string().email({ message: "Enter a valid email" }),

    // ✅ Stronger username validation
    username: z
      .string()
      .min(3, { message: "Username must be at least 3 characters" })
      .max(20, { message: "Username must be at most 20 characters" })
      .regex(/^[a-zA-Z0-9_]+$/, {
        message: "Only letters, numbers, and underscores are allowed",
      })
      .transform((val) => val.toLowerCase()),

    // ✅ Stronger password validation
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" })
      .regex(/[A-Z]/, {
        message: "Password must contain at least one uppercase letter",
      })
      .regex(/[a-z]/, {
        message: "Password must contain at least one lowercase letter",
      })
      .regex(/[0-9]/, {
        message: "Password must contain at least one number",
      }),

    confirmPassword: z
      .string()
      .min(8, { message: "Confirm your password" }),

    role: z.enum(["student", "mentor", "organization", "admin"], {
      errorMap: () => ({ message: "Select your role" }),
    }),

    gender: z.string().optional(),

    // allow empty, but if filled must be 1–8
    year: z
      .union([z.string(), z.number()])
      .optional()
      .transform((val) =>
        val === undefined || val === "" ? undefined : Number(val)
      )
      .refine(
        (val) => val === undefined || (Number.isInteger(val) && val >= 1 && val <= 8),
        { message: "Enter a valid year" }
      ),

    branch: z.string().optional(),
    skills: z.string().optional(),
    expertise: z.string().optional(),
    preferredTeamRoles: z.string().optional(),
    availability: z.string().optional(),
    organizationName: z.string().optional(),
    designation: z.string().optional(),

    bio: z
      .string()
      .max(1000, { message: "Bio must be at most 1000 characters" })
      .optional(),

    institution: z.string().optional(),

    social_linkedin: z
      .string()
      .url({ message: "Enter a valid LinkedIn URL" })
      .optional()
      .or(z.literal("")),

    social_github: z
      .string()
      .url({ message: "Enter a valid GitHub URL" })
      .optional()
      .or(z.literal("")),

    social_website: z
      .string()
      .url({ message: "Enter a valid website URL" })
      .optional()
      .or(z.literal("")),

    terms: z.boolean(),
  })
    // ✅ passwords must match
    .refine((d: any) => d.password === d.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    })
    // ✅ gender is required for students and mentors
    .refine((d: any) => (d.role === "student" || d.role === "mentor" ? !! d.gender : true), {
      message: "Gender is required",
      path: ["gender"],
    })
    // ✅ terms must be accepted
    .refine((d: any) => d.terms === true, {
      message: "You must accept terms",
      path: ["terms"],
    });

export type FormValues = z.infer<typeof schema>;
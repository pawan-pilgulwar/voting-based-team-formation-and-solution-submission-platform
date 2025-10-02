import { z } from "zod";

const baseRegister = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  username: z.string().min(3),
  password: z.string().min(6),
  role: z.enum(["student", "mentor", "orgAdmin", "superAdmin"]),
});

const studentFields = z.object({
  gender: z.enum(["male", "female", "other"]),
  year: z.coerce.number().int().min(1).max(8).optional(),
  branch: z.string().optional(),
  skills: z
    .union([
      z.array(z.string()).transform((a) => a.map((s) => s.trim()).filter(Boolean)),
      z.string().transform((s) => s.split(",").map((x) => x.trim()).filter(Boolean)),
    ])
    .optional(),
  preferredTeamRoles: z
    .union([
      z.array(z.string()).transform((a) => a.map((s) => s.trim()).filter(Boolean)),
      z.string().transform((s) => s.split(",").map((x) => x.trim()).filter(Boolean)),
    ])
    .optional(),
});

const mentorFields = z.object({
  gender: z.enum(["male", "female", "other"]),
  skills: z
    .union([
      z.array(z.string()).transform((a) => a.map((s) => s.trim()).filter(Boolean)),
      z.string().transform((s) => s.split(",").map((x) => x.trim()).filter(Boolean)),
    ])
    .optional(),
  expertise: z
    .union([
      z.array(z.string()).transform((a) => a.map((s) => s.trim()).filter(Boolean)),
      z.string().transform((s) => s.split(",").map((x) => x.trim()).filter(Boolean)),
    ])
    .optional(),
  availability: z.string().optional(),
});

const orgAdminFields = z.object({
  organizationName: z.string().min(2),
  designation: z.string().optional(),
});

export const registerSchema = z.object({
  body: z.discriminatedUnion("role", [
    baseRegister.extend({ role: z.literal("student") }).merge(studentFields),
    baseRegister.extend({ role: z.literal("mentor") }).merge(mentorFields),
    baseRegister.extend({ role: z.literal("orgAdmin") }).merge(orgAdminFields),
    baseRegister.extend({ role: z.literal("superAdmin") }),
  ]),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
  }),
});

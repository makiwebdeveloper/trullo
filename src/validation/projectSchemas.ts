import { z } from "zod";

export const createProjectSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1).optional(),
});

export const updateProjectSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
});

export const addUserToProjectSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["ADMIN", "USER"]).default("USER").optional(),
});

export const editUserRoleSchema = z.object({
  role: z.enum(["ADMIN", "USER"]),
});

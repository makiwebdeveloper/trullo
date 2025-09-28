import { z } from "zod";

export const createTaskSchema = z.object({
  projectId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1).optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "BlOCKED", "DONE"]).optional(),
  assignedToId: z.string().min(1).optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "BlOCKED", "DONE"]).optional(),
  assignedToId: z.string().min(1).optional(),
});

export const assignToSchema = z.object({
  userId: z.string().min(1),
});

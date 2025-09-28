import { z } from "zod";

export const signUpSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  name: z.string().min(1),
});

export const signInSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

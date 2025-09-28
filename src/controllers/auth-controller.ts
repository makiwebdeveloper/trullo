import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import { createUser, getUserByEmail } from "../services/user-service";
import { signInSchema, signUpSchema } from "../validation/authSchemas";
import jwt from "jsonwebtoken";

export const SALT = 11;

export async function signUp(req: Request, res: Response) {
  try {
    const bodyValidation = signUpSchema.safeParse(req.body);
    if (!bodyValidation.success) {
      return res.status(400).json({
        error: "Invalid data",
        details: bodyValidation.error.issues.map((issue: any) => ({
          message: `${issue.message}`,
        })),
      });
    }

    const userExist = await getUserByEmail(bodyValidation.data.email);
    if (userExist) {
      return res
        .status(400)
        .json({ error: "A user with this email already exists" });
    }

    const hashedPassword = bcrypt.hashSync(bodyValidation.data.password, SALT);

    await createUser({
      ...bodyValidation.data,
      password: hashedPassword,
    });

    res.status(200).json({ message: "User successfuly created" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function signIn(req: Request, res: Response) {
  try {
    const bodyValidation = signInSchema.safeParse(req.body);
    if (!bodyValidation.success) {
      return res.status(400).json({
        error: "Invalid data",
        details: bodyValidation.error.issues.map((issue: any) => ({
          message: `${issue.message}`,
        })),
      });
    }

    const user = await getUserByEmail(req.body.email);
    if (!user) {
      return res
        .status(400)
        .json({ error: "A user with this email not found." });
    }

    const passwordMatch = bcrypt.compareSync(
      bodyValidation.data.password,
      user.password
    );
    if (!passwordMatch) {
      return res.status(401).json({ error: "Password not mathed" });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET_KEY!);

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}

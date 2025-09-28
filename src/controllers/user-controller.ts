import type { Request, Response } from "express";
import { getUserByEmail, getUserById } from "../services/user-service";
import { prisma } from "../index";
import { updateUserSchema } from "../validation/userSchemas";
import { SALT } from "./auth-controller";
import bcrypt from "bcrypt";

export async function getUsers(req: Request, res: Response) {
  const users = await prisma.user.findMany();
  res.status(200).json({ users });
}

export async function getUserProfile(req: Request, res: Response) {
  const id = req.userId;
  if (!id) return res.status(400).json({ error: "Bad request" });

  const user = await getUserById(id);
  if (user) {
    return res.status(200).json({ user });
  } else {
    return res.status(404).json({ error: "User not found" });
  }
}

export async function getUser(req: Request, res: Response) {
  const id = req.params.id;
  if (!id) return res.status(400).json({ error: "Bad request" });

  const user = await getUserById(id);
  if (user) {
    return res.status(200).json({ user });
  } else {
    return res.status(404).json({ error: "User not found" });
  }
}

export async function updateUser(req: Request, res: Response) {
  const id = req.userId;
  if (!id) return res.status(400).json({ error: "Bad request" });

  const user = await getUserById(id);
  if (!user) return res.status(400).json({ error: "Bad request" });

  try {
    const bodyValidation = updateUserSchema.safeParse(req.body);
    if (!bodyValidation.success) {
      return res.status(400).json({
        error: "Invalid data",
        details: bodyValidation.error.issues.map((issue: any) => ({
          message: `${issue.message}`,
        })),
      });
    }

    const { email, password, ...rest } = bodyValidation.data;
    let hashedPassword = user.password;

    if (email) {
      const userExist = await getUserByEmail(email);
      if (userExist) {
        return res
          .status(400)
          .json({ error: "A user with this email already exists" });
      }
    }

    if (password) {
      const passwordMatch = bcrypt.compareSync(password, user.password);
      if (!passwordMatch) {
        hashedPassword = bcrypt.hashSync(password, SALT);
      }
    }

    await prisma.user.update({
      where: { id },
      data: {
        ...rest,
        email,
        password: hashedPassword,
      },
    });

    return res.status(200).json({ message: "User successfully updated" });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function deleteUser(req: Request, res: Response) {
  const id = req.userId;
  if (!id) return res.status(400).json({ error: "Bad request" });

  const user = await getUserById(id);
  if (!user) return res.status(400).json({ error: "Bad request" });

  try {
    await prisma.user.delete({ where: { id } });

    return res.status(200).json({ message: "User successfully deleted" });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function getUserProjects(req: Request, res: Response) {
  const id = req.params.id;
  if (!id) return res.status(400).json({ error: "Bad request" });

  const user = await getUserById(id);
  if (!user) return res.status(400).json({ error: "User not found" });

  const userProjects = await prisma.projectUser.findMany({
    where: { userId: user.id },
    include: {
      project: {
        include: {
          users: true,
          tasks: true,
        },
      },
    },
  });

  res.status(200).json({ projects: userProjects.map((item) => item.project) });
}

export async function getUserTasks(req: Request, res: Response) {
  const id = req.params.id;
  if (!id) return res.status(400).json({ error: "Bad request" });

  const user = await getUserById(id);
  if (!user) return res.status(400).json({ error: "User not found" });

  const tasks = await prisma.task.findMany({
    where: { assignedToId: user.id },
  });

  res.status(200).json({ tasks });
}

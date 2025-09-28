import type { Request, Response } from "express";
import { prisma } from "../index";
import {
  assignToSchema,
  createTaskSchema,
  updateTaskSchema,
} from "../validation/taskSchemas";
import { ProjectUserRole } from "../generated/prisma";
import { getProjectById } from "../services/project-service";

export async function getProjectTasks(req: Request, res: Response) {
  const project = await getProjectById(req.params.id!);
  if (!project) return res.status(400).json({ error: "Project not exist" });

  const tasks = await prisma.task.findMany({
    where: {
      projectId: req.params.id!,
    },
  });

  res.status(200).json({ tasks });
}

export async function createTask(req: Request, res: Response) {
  try {
    // Validate body
    const bodyValidation = createTaskSchema.safeParse(req.body);
    if (!bodyValidation.success) {
      return res.status(400).json({
        error: "Invalid data",
        details: bodyValidation.error.issues.map((issue: any) => ({
          message: `${issue.message}`,
        })),
      });
    }

    const project = await getProjectById(bodyValidation.data.projectId!);
    if (!project) return res.status(400).json({ error: "Project not exist" });

    const admin = await prisma.projectUser.findUnique({
      where: {
        userId_projectId: {
          userId: req.userId!,
          projectId: bodyValidation.data.projectId,
        },
      },
    });

    if (admin?.role !== ProjectUserRole.ADMIN) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const task = await prisma.task.create({
      data: {
        ...bodyValidation.data,
        projectId: bodyValidation.data.projectId,
      },
    });

    res.status(200).json({ message: "Task successfully created" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getTask(req: Request, res: Response) {
  const task = await prisma.task.findUnique({ where: { id: req.params.id } });

  return res.status(200).json({ task });
}

export async function updateTask(req: Request, res: Response) {
  try {
    // Validate body
    const bodyValidation = updateTaskSchema.safeParse(req.body);
    if (!bodyValidation.success) {
      return res.status(400).json({
        error: "Invalid data",
        details: bodyValidation.error.issues.map((issue: any) => ({
          message: `${issue.message}`,
        })),
      });
    }

    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
    });
    if (!task) return res.status(400).json({ error: "Project not exist" });

    const admin = await prisma.projectUser.findUnique({
      where: {
        userId_projectId: {
          userId: req.userId!,
          projectId: task.projectId!,
        },
      },
    });

    if (admin?.role !== ProjectUserRole.ADMIN) {
      return res.status(403).json({ error: "Forbidden" });
    }

    await prisma.task.update({
      where: {
        id: task.id,
      },
      data: {
        ...bodyValidation.data,
      },
    });

    res.status(200).json({ message: "Task successfully updated" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function deleteTask(req: Request, res: Response) {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
    });
    if (!task) return res.status(400).json({ error: "Project not exist" });

    const admin = await prisma.projectUser.findUnique({
      where: {
        userId_projectId: {
          userId: req.userId!,
          projectId: task.projectId!,
        },
      },
    });

    if (admin?.role !== ProjectUserRole.ADMIN) {
      return res.status(403).json({ error: "Forbidden" });
    }

    await prisma.task.delete({ where: { id: task.id } });
    res.status(200).json({ message: "Task successfully deleted" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function assignTaskToUser(req: Request, res: Response) {
  try {
    // Validate body
    const bodyValidation = assignToSchema.safeParse(req.body);
    if (!bodyValidation.success) {
      return res.status(400).json({
        error: "Invalid data",
        details: bodyValidation.error.issues.map((issue: any) => ({
          message: `${issue.message}`,
        })),
      });
    }

    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
    });
    if (!task) return res.status(400).json({ error: "Project not exist" });

    const admin = await prisma.projectUser.findUnique({
      where: {
        userId_projectId: {
          userId: req.userId!,
          projectId: task.projectId!,
        },
      },
    });

    if (admin?.role !== ProjectUserRole.ADMIN) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const projectUser = await prisma.projectUser.findUnique({
      where: {
        userId_projectId: {
          userId: bodyValidation.data.userId,
          projectId: task.projectId,
        },
      },
    });
    if (!projectUser)
      return res.status(400).json({ error: "User not exist in this project" });

    await prisma.task.update({
      where: {
        id: task.id,
      },
      data: {
        assignedToId: bodyValidation.data.userId,
      },
    });

    res.status(200).json({ message: "Task successfully assigned to user" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}

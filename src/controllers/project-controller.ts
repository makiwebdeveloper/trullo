import type { Request, Response } from "express";
import {
  addUserToProjectSchema,
  createProjectSchema,
  editUserRoleSchema,
  updateProjectSchema,
} from "../validation/projectSchemas";
import { prisma } from "../index";
import { ProjectUserRole } from "../generated/prisma";
import { getUserById } from "../services/user-service";
import { getProjectById } from "../services/project-service";

export async function createProject(req: Request, res: Response) {
  try {
    // Validate body
    const bodyValidation = createProjectSchema.safeParse(req.body);
    if (!bodyValidation.success) {
      return res.status(400).json({
        error: "Invalid data",
        details: bodyValidation.error.issues.map((issue: any) => ({
          message: `${issue.message}`,
        })),
      });
    }

    // Validate user
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) return res.status(404).json({ error: "Bad request" });

    // Create project
    const project = await prisma.project.create({
      data: {
        title: bodyValidation.data.title,
        description: bodyValidation.data.description,
        users: {
          create: {
            userId: user.id,
            role: ProjectUserRole.ADMIN,
          },
        },
      },
    });

    res
      .status(200)
      .json({ message: "Project successfully created", projectId: project.id });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function updateProject(req: Request, res: Response) {
  try {
    // Validate body
    const bodyValidation = updateProjectSchema.safeParse(req.body);
    if (!bodyValidation.success) {
      return res.status(400).json({
        error: "Invalid data",
        details: bodyValidation.error.issues.map((issue: any) => ({
          message: `${issue.message}`,
        })),
      });
    }

    // Check if user is ADMIN
    const projectUser = await prisma.projectUser.findUnique({
      where: {
        userId_projectId: {
          userId: req.userId!,
          projectId: req.params.id!,
        },
      },
    });

    if (!projectUser || projectUser?.role !== ProjectUserRole.ADMIN) {
      return res.status(403).json({ error: "Forbidden" });
    }

    // Update project
    await prisma.project.update({
      where: { id: req.params.id },
      data: bodyValidation.data,
    });

    res.status(200).json({ message: "Project successfully updated" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function deleteProject(req: Request, res: Response) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
    });
    if (!project) return res.status(400).json({ message: "Bad request" });

    // Check if user is ADMIN
    const projectUser = await prisma.projectUser.findUnique({
      where: {
        userId_projectId: {
          userId: req.userId!,
          projectId: req.params.id!,
        },
      },
    });

    if (!projectUser || projectUser?.role !== ProjectUserRole.ADMIN) {
      return res.status(403).json({ error: "Forbidden" });
    }

    // Delete project
    await prisma.project.delete({ where: { id: req.params.id } });

    res.status(200).json({ message: "Project successfully deleted" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getProjects(req: Request, res: Response) {
  const projects = await prisma.project.findMany();

  res.status(200).json({ projects });
}

export async function getProject(req: Request, res: Response) {
  const id = req.params.id;
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      users: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      },

      tasks: true,
    },
  });

  if (!project) {
    return res.status(200).json({ project: undefined });
  }

  // Check if uesr exist in project
  const projectUser = await prisma.projectUser.findUnique({
    where: {
      userId_projectId: {
        userId: req.userId!,
        projectId: project.id,
      },
    },
  });
  if (!projectUser) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const users = project?.users.map((item) => ({
    ...item.user,
    role: item.role,
  }));

  res.status(200).json({
    project: {
      ...project,
      users,
    },
  });
}

export async function addUserToProject(req: Request, res: Response) {
  try {
    // Validate body
    const bodyValidation = addUserToProjectSchema.safeParse(req.body);
    if (!bodyValidation.success) {
      return res.status(400).json({
        error: "Invalid data",
        details: bodyValidation.error.issues.map((issue: any) => ({
          message: `${issue.message}`,
        })),
      });
    }

    // Check if project with this ID exist
    const project = await getProjectById(req.params.id!);
    if (!project) return res.status(404).json({ message: "Bad request" });

    // Check if user with this ID exist
    const user = await getUserById(bodyValidation.data.userId);
    if (!user) return res.status(404).json({ message: "Bad request" });

    // Check if user with this ID exist in project
    const projectUser = await prisma.projectUser.findUnique({
      where: {
        userId_projectId: {
          userId: user.id,
          projectId: project.id,
        },
      },
    });
    if (projectUser)
      return res.status(404).json({ message: "User already in project" });

    // Check if user is ADMIN
    const admin = await prisma.projectUser.findUnique({
      where: {
        userId_projectId: {
          userId: req.userId!,
          projectId: req.params.id!,
        },
      },
    });

    if (!admin || admin?.role !== ProjectUserRole.ADMIN) {
      return res.status(403).json({ error: "Forbidden" });
    }

    // Add user to project
    await prisma.projectUser.create({
      data: {
        userId: bodyValidation.data.userId,
        projectId: project.id,
        role: bodyValidation.data.role,
      },
    });

    res.status(200).json({ message: "User successfully added to project" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function deleteUserFromProject(req: Request, res: Response) {
  try {
    // Check if project with this ID exist
    const project = await getProjectById(req.params.projectId!);
    if (!project) return res.status(404).json({ message: "Bad request" });

    // Check if user with this ID exist in project
    const projectUser = await prisma.projectUser.findUnique({
      where: {
        userId_projectId: {
          userId: req.params.userId!,
          projectId: project.id,
        },
      },
    });
    if (!projectUser) return res.status(404).json({ message: "Bad request" });

    // Check if user is ADMIN or trying delete his account
    if (req.userId !== req.params.userId) {
      const admin = await prisma.projectUser.findUnique({
        where: {
          userId_projectId: {
            userId: req.userId!,
            projectId: project.id,
          },
        },
      });

      if (admin?.role !== ProjectUserRole.ADMIN) {
        return res.status(403).json({ error: "Forbidden" });
      }
    }

    // Delete user from project
    await prisma.projectUser.delete({
      where: {
        userId_projectId: {
          userId: req.params.userId!,
          projectId: project.id,
        },
      },
    });

    res.status(200).json({ message: "User successfully added to project" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function editUserRoleInProject(req: Request, res: Response) {
  try {
    // Validate body
    const bodyValidation = editUserRoleSchema.safeParse(req.body);
    if (!bodyValidation.success) {
      return res.status(400).json({
        error: "Invalid data",
        details: bodyValidation.error.issues.map((issue: any) => ({
          message: `${issue.message}`,
        })),
      });
    }

    const role = bodyValidation.data.role;

    // Check if project and user with this IDs exist
    const project = await getProjectById(req.params.projectId!);
    if (!project) return res.status(404).json({ message: "Bad request" });

    const projectUser = await prisma.projectUser.findUnique({
      where: {
        userId_projectId: {
          userId: req.params.userId!,
          projectId: project.id,
        },
      },
    });
    if (!projectUser) return res.status(404).json({ message: "Bad request" });
    if (req.userId !== projectUser.userId) {
      if (projectUser.role === "ADMIN") {
        return res
          .status(404)
          .json({ message: "You can not change ADMIN role" });
      }
    }

    // Check if user is ADMIN
    const admin = await prisma.projectUser.findUnique({
      where: {
        userId_projectId: {
          userId: req.userId!,
          projectId: project.id,
        },
      },
    });

    if (!admin || admin.role !== ProjectUserRole.ADMIN) {
      return res.status(403).json({ error: "Forbidden" });
    }

    // Edit role
    await prisma.projectUser.update({
      where: {
        userId_projectId: {
          userId: projectUser.userId,
          projectId: project.id,
        },
      },
      data: { role },
    });

    res
      .status(200)
      .json({ message: `User's role successfully changed to ${role}` });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}

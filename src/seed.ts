import { ProjectUserRole } from "./generated/prisma";
import { TaskStatusEnum } from "./generated/prisma";
import { PrismaClient } from "./generated/prisma";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();
const SALT = 11;

async function clearDb() {
  await prisma.task.deleteMany();
  await prisma.projectUser.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();
}

async function generateData() {
  console.log("🌱 Seeding database...");

  // Создаём пользователей
  const password1 = await bcrypt.hash("12345678", SALT);
  const password2 = await bcrypt.hash("12345678", SALT);

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@example.com",
      password: password1,
    },
  });

  const regularUser = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      name: "Regular User",
      email: "user@example.com",
      password: password2,
    },
  });

  const project = await prisma.project.create({
    data: {
      title: "Seed Project",
      description: "Project for seeding tasks",
    },
  });

  await prisma.projectUser.createMany({
    data: [
      {
        userId: adminUser.id,
        projectId: project.id,
        role: ProjectUserRole.ADMIN,
      },
      {
        userId: regularUser.id,
        projectId: project.id,
        role: ProjectUserRole.USER,
      },
    ],
  });

  const tasksData = [
    {
      title: "Setup project",
      description: "Initialize repository and install dependencies",
      status: TaskStatusEnum.TODO,
      projectId: project.id,
      assignedToId: adminUser.id,
    },
    {
      title: "Create auth endpoints",
      description: "Sign-up and Sign-in endpoints",
      status: TaskStatusEnum.IN_PROGRESS,
      projectId: project.id,
      assignedToId: regularUser.id,
    },
    {
      title: "Create user CRUD",
      description: "Endpoints to manage users",
      status: TaskStatusEnum.BlOCKED,
      projectId: project.id,
      assignedToId: null,
    },
    {
      title: "Setup Swagger docs",
      description: "Add API documentation",
      status: TaskStatusEnum.DONE,
      projectId: project.id,
      assignedToId: adminUser.id,
    },
  ];

  for (const task of tasksData) {
    await prisma.task.create({ data: task });
  }

  console.log("✅ Seeding processed successfully!");
}

await clearDb();
await generateData();

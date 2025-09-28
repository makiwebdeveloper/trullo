import { prisma } from "../index";

export async function getProjectById(id: string) {
  return prisma.project.findUnique({ where: { id } });
}

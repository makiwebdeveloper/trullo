import { prisma } from "../index";

export async function getUserById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export async function createUser(user: {
  email: string,
  name: string,
  password: string
}) {
  return prisma.user.create({ data: user });
}

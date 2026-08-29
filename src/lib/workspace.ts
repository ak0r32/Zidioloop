import { hash } from "bcryptjs";

import { prisma } from "@/lib/db";

export async function createWorkspaceWithAdmin({
  name,
  userName,
  email,
  password,
}: {
  name: string;
  userName: string;
  email: string;
  password: string;
}) {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("A user with this email already exists.");
  }

  const workspace = await prisma.workspace.create({
    data: {
      name,
      users: {
        create: [
          {
            name: userName,
            email,
            passwordHash: await hash(password, 10),
            role: "ADMIN",
          },
        ],
      },
    },
    include: {
      users: true,
    },
  });

  return workspace.users[0];
}

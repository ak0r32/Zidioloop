import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";

export async function getCurrentSession() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return null;
  }

  return session;
}

export async function requireWorkspaceSession() {
  const session = await getCurrentSession();

  if (!session) {
    throw new Error("UNAUTHENTICATED");
  }

  if (!session.user.workspaceId) {
    throw new Error("WORKSPACE_MISSING");
  }

  return session;
}

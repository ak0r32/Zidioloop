import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { canManageFeedback } from "@/lib/rbac";
import { getCurrentSession } from "@/lib/session";
import { feedbackUpdateSchema } from "@/lib/validation";

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json({ message: "Authentication required" }, { status: 401 });
  }

  const feedback = await prisma.feedback.findFirst({
    where: {
      id: params.id,
      workspaceId: session.user.workspaceId,
    },
  });

  if (!feedback) {
    return NextResponse.json({ message: "Feedback not found" }, { status: 404 });
  }

  return NextResponse.json(feedback);
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json({ message: "Authentication required" }, { status: 401 });
  }

  if (!canManageFeedback(session.user.role)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = feedbackUpdateSchema.parse(body);

    const feedback = await prisma.feedback.updateMany({
      where: {
        id: params.id,
        workspaceId: session.user.workspaceId,
      },
      data: parsed,
    });

    if (feedback.count === 0) {
      return NextResponse.json({ message: "Feedback not found" }, { status: 404 });
    }

    const updated = await prisma.feedback.findFirst({
      where: {
        id: params.id,
        workspaceId: session.user.workspaceId,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.issues[0]?.message ?? "Invalid feedback payload" },
        { status: 400 },
      );
    }

    return NextResponse.json({ message: "Unable to update feedback" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json({ message: "Authentication required" }, { status: 401 });
  }

  if (!canManageFeedback(session.user.role)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const result = await prisma.feedback.deleteMany({
    where: {
      id: params.id,
      workspaceId: session.user.workspaceId,
    },
  });

  if (result.count === 0) {
    return NextResponse.json({ message: "Feedback not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

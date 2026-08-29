import { NextResponse } from "next/server";
import { z } from "zod";

import { canManageFeedback, canViewFeedback } from "@/lib/rbac";
import { getCurrentSession } from "@/lib/session";
import { feedbackInputSchema } from "@/lib/validation";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json({ message: "Authentication required" }, { status: 401 });
  }

  if (!canViewFeedback(session.user.role)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(searchParams.get("pageSize") ?? "10");
  const status = searchParams.get("status");
  const channel = searchParams.get("channel");
  const search = searchParams.get("search");

  const skip = (page - 1) * pageSize;

  const where: any = {
    workspaceId: session.user.workspaceId,
  };

  if (status) {
    where.status = status;
  }

  if (channel) {
    where.channel = channel;
  }

  if (search) {
    where.OR = [
      { content: { contains: search, mode: "insensitive" } },
      { customerLabel: { contains: search, mode: "insensitive" } },
      { sourceRef: { contains: search, mode: "insensitive" } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.feedback.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.feedback.count({ where }),
  ]);

  return NextResponse.json({ items, total, page, pageSize });
}

export async function POST(request: Request) {
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json({ message: "Authentication required" }, { status: 401 });
  }

  if (!canManageFeedback(session.user.role)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = feedbackInputSchema.parse(body);

    const feedback = await prisma.feedback.create({
      data: {
        content: parsed.content,
        channel: parsed.channel,
        sourceRef: parsed.sourceRef ?? null,
        customerLabel: parsed.customerLabel ?? null,
        status: parsed.status ?? "NEW",
        workspaceId: session.user.workspaceId,
      },
    });

    return NextResponse.json(feedback, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.issues[0]?.message ?? "Invalid feedback payload" },
        { status: 400 },
      );
    }

    return NextResponse.json({ message: "Unable to create feedback" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { z } from "zod";

import { createWorkspaceWithAdmin } from "@/lib/workspace";
import { signUpSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = signUpSchema.parse(body);

    const user = await createWorkspaceWithAdmin({
      name: `${parsed.name}'s Workspace`,
      userName: parsed.name,
      email: parsed.email,
      password: parsed.password,
    });

    return NextResponse.json(
      {
        message: "Workspace created successfully.",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          workspaceId: user.workspaceId,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.issues[0]?.message ?? "Invalid request." },
        { status: 400 },
      );
    }

    if (error instanceof Error && error.message.includes("already exists")) {
      return NextResponse.json({ message: error.message }, { status: 409 });
    }

    return NextResponse.json({ message: "Unable to create workspace." }, { status: 500 });
  }
}

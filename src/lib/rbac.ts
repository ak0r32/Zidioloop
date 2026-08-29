import type { Role } from "@prisma/client";

export function canManageFeedback(role: Role): boolean {
  return role === "ADMIN" || role === "ANALYST";
}

export function canManageWorkspace(role: Role): boolean {
  return role === "ADMIN";
}

export function canViewFeedback(role: Role): boolean {
  return role === "ADMIN" || role === "ANALYST" || role === "VIEWER";
}

export function canManageMembers(role: Role): boolean {
  return role === "ADMIN";
}

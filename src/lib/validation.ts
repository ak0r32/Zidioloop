import { z } from "zod";

export const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Valid email is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const feedbackInputSchema = z.object({
  content: z.string().min(10, "Feedback content must be at least 10 characters"),
  channel: z.string().min(2, "Channel is required"),
  sourceRef: z.string().optional().nullable(),
  customerLabel: z.string().optional().nullable(),
  status: z.enum(["NEW", "REVIEWED", "ACTIONED"]).optional(),
});

export const feedbackUpdateSchema = z.object({
  content: z.string().min(10).optional(),
  channel: z.string().min(2).optional(),
  sourceRef: z.string().optional().nullable(),
  customerLabel: z.string().optional().nullable(),
  status: z.enum(["NEW", "REVIEWED", "ACTIONED"]).optional(),
});

export const memberRoleSchema = z.object({
  role: z.enum(["ADMIN", "ANALYST", "VIEWER"]),
});

import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export const categorySchema = z.object({
  name: z.string().trim().min(1).max(80),
});

export const sermonFieldsSchema = z.object({
  title: z.string().trim().min(1).max(200),
  speaker: z.string().trim().min(1).max(200),
  datePreached: z.string().trim().min(1),
  description: z.string().trim().max(5000).default(""),
  categoryIds: z.array(z.string()).default([]),
});

export const eventFieldsSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(5000).default(""),
  eventDate: z.string().trim().min(1),
  location: z.string().trim().max(300).default(""),
});

import { z } from "zod";
import { contentTypes } from "./linkCategorizer";

// User validation schemas
export const signupSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(50),
  password: z.string().min(6, "Password must be at least 6 characters").max(100),
});

export const signinSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6).max(100),
});

// Content validation schemas
export const createContentSchema = z.object({
  link: z.string().url("Invalid URL format"),
  title: z.string().min(1, "Title is required").max(200),
  type: z.enum(contentTypes as any).optional(), // Optional, will be auto-detected
  description: z.string().max(1000).optional(),
  thumbnail: z.string().url().optional(),
});

export const updateContentSchema = z.object({
  link: z.string().url().optional(),
  title: z.string().min(1).max(200).optional(),
  type: z.enum(contentTypes as any).optional(),
  description: z.string().max(1000).optional(),
  thumbnail: z.string().url().optional(),
});

export const contentIdSchema = z.object({
  contentId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid content ID"),
});

// Link sharing validation
export const shareLinkSchema = z.object({
  share: z.boolean(),
});

// Query parameter validation
export const contentFilterSchema = z.object({
  type: z.enum(contentTypes as any).optional(),
  category: z.enum([
    "social", "video", "code", "article", "audio", "image", "document", "other"
  ] as const).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  offset: z.string().regex(/^\d+$/).transform(Number).optional(),
});

// Type exports for use in the application
export type SignupInput = z.infer<typeof signupSchema>;
export type SigninInput = z.infer<typeof signinSchema>;
export type CreateContentInput = z.infer<typeof createContentSchema>;
export type UpdateContentInput = z.infer<typeof updateContentSchema>;
export type ContentFilterInput = z.infer<typeof contentFilterSchema>;

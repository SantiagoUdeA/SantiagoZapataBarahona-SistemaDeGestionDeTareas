import { z } from 'zod'

export const RoleEnum = z.enum(['ADMIN', 'USER'])

export const ProfileUpdateSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  avatarUrl: z.string().url().optional(),
  username: z
    .string()
    .min(3)
    .max(20)
    .regex(/^[a-zA-Z0-9_]+$/, 'Alphanumeric and underscore only')
    .optional(),
  bio: z.string().max(500).optional(),
})

export const ProfileSelectSchema = z.object({
  id: z.string().uuid(),
  fullName: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  username: z.string().nullable(),
  bio: z.string().nullable(),
  role: RoleEnum,
  email: z.string().email(),
  enabled: z.boolean(),
  deleted: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

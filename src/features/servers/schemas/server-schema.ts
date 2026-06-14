import { z } from 'zod'

export const serverFormSchema = z
  .object({
    name: z.string().min(1, 'Name is required').max(64),
    baseUrl: z.string().min(1, 'Base URL is required').url('Must be a valid URL'),
    environment: z.enum(['development', 'qa', 'sit', 'uat', 'production-like', 'local']),
    authType: z.enum(['none', 'basic', 'bearer']),
    username: z.string().optional(),
    password: z.string().optional(),
    token: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.authType === 'basic' && !data.username) {
      ctx.addIssue({
        code: 'custom',
        message: 'Username is required for basic auth',
        path: ['username'],
      })
    }
    if (data.authType === 'bearer' && !data.token) {
      ctx.addIssue({
        code: 'custom',
        message: 'Token is required for bearer auth',
        path: ['token'],
      })
    }
  })

export type ServerFormValues = z.infer<typeof serverFormSchema>

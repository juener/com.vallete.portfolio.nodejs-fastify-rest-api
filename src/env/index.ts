import 'dotenv/config'

import {z} from 'zod'

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('production'),
    DATABASE_URL: z.string()
})

export const env = envSchema.parse(process.env)
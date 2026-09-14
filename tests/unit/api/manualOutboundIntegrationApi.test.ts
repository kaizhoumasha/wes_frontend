import { describe, expect, it } from 'vitest'
import { IntegrationRunResponseSchema } from '@/types/generated/zod-schemas'

describe('manual outbound integration contract', () => {
  it('accepts the manual-picking plugin key returned by WES', () => {
    expect(IntegrationRunResponseSchema.shape.expected_plugin_key.safeParse('manual-picking').success).toBe(true)
  })
})

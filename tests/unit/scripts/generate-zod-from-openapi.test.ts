import { describe, expect, it } from 'vitest'
import { schemaToZod } from '../../../scripts/generate-zod-from-openapi'
import { _DebugTransportStepConfirmationSchema } from '@/types/zod-extensions'

describe('generate-zod-from-openapi helpers', () => {
  it('preserves OpenAPI const constraints including false and zero', () => {
    expect(schemaToZod({ type: 'string', const: 'FIXED' }, {})).toBe('z.literal("FIXED")')
    expect(schemaToZod({ type: 'boolean', const: false }, {})).toBe('z.literal(false)')
    expect(schemaToZod({ type: 'integer', const: 0 }, {})).toBe('z.literal(0)')
  })

  it('rejects values that violate a generated contract constant', () => {
    const baseValue = {
      step: 'BINS_TO_INFEED' as const,
    }

    expect(_DebugTransportStepConfirmationSchema.safeParse({
      ...baseValue,
      assertion: 'PHYSICAL_TARGET_REACHED',
    }).success).toBe(true)
    expect(_DebugTransportStepConfirmationSchema.safeParse({
      ...baseValue,
      assertion: 'WRONG',
    }).success).toBe(false)
  })
})

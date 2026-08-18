import { describe, expect, it } from 'vitest'
import { schemaToZod } from '../../../scripts/generate-zod-from-openapi'
import { WmsSyncObligationResolutionSchema } from '@/types/zod-extensions'

describe('generate-zod-from-openapi helpers', () => {
  it('preserves OpenAPI const constraints including false and zero', () => {
    expect(schemaToZod({ type: 'string', const: 'FIXED' }, {})).toBe('z.literal("FIXED")')
    expect(schemaToZod({ type: 'boolean', const: false }, {})).toBe('z.literal(false)')
    expect(schemaToZod({ type: 'integer', const: 0 }, {})).toBe('z.literal(0)')
  })

  it('rejects values that violate a generated contract constant', () => {
    const baseValue = {
      resolved_operation_identity: 'wms.inventory.confirm_inbound@v1',
      resolved_fact_version: 'fact-v1',
      source_event_id: 'event-1',
      evidence_reference: 'evidence-1',
    }

    expect(WmsSyncObligationResolutionSchema.safeParse({
      ...baseValue,
      resolution: 'OBLIGATION_SATISFIED',
    }).success).toBe(true)
    expect(WmsSyncObligationResolutionSchema.safeParse({
      ...baseValue,
      resolution: 'WRONG',
    }).success).toBe(false)
  })
})

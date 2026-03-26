/**
 * detailFieldLayout Utility Tests
 *
 * Tests for field layout resolution including:
 * - Layout pattern matching
 * - Value-based layout decisions
 * - Truncation limits
 */

import { describe, it, expect } from 'vitest'
import {
  resolveDetailFieldLayout,
  getDetailFieldTruncationLimit,
  type DetailFieldResolvedLayout
} from '@/components/common/crud-page/detail/detailFieldLayout'

describe('detailFieldLayout', () => {
  describe('resolveDetailFieldLayout', () => {
    describe('explicit layout override', () => {
      it('should use explicit layout when specified', () => {
        const field = { key: 'name', layout: 'full' as DetailFieldResolvedLayout }
        expect(resolveDetailFieldLayout(field, 'test')).toBe('full')
      })

      it('should ignore auto layout and resolve normally', () => {
        const field = { key: 'name', layout: 'auto' as DetailFieldResolvedLayout }
        expect(resolveDetailFieldLayout(field, 'test')).toBe('half')
      })
    })

    describe('JSON formatter', () => {
      it('should return full for json formatter', () => {
        const field = { key: 'data', formatter: 'json' as const }
        expect(resolveDetailFieldLayout(field, { foo: 'bar' })).toBe('full')
      })
    })

    describe('full-width field patterns', () => {
      it('should return full for description fields', () => {
        const field = { key: 'description' }
        expect(resolveDetailFieldLayout(field, 'Some description')).toBe('full')
      })

      it('should return full for remark fields', () => {
        const field = { key: 'remark' }
        expect(resolveDetailFieldLayout(field, 'A remark')).toBe('full')
      })

      it('should return full for content fields', () => {
        const field = { key: 'content' }
        expect(resolveDetailFieldLayout(field, 'Content')).toBe('full')
      })

      it('should return full for nested full-width fields', () => {
        const field = { key: 'user.description' }
        expect(resolveDetailFieldLayout(field, 'Text')).toBe('full')
      })
    })

    describe('object and array values', () => {
      it('should return full for object values', () => {
        const field = { key: 'metadata' }
        expect(resolveDetailFieldLayout(field, { foo: 'bar' })).toBe('full')
      })

      it('should return full for array values', () => {
        const field = { key: 'tags' }
        expect(resolveDetailFieldLayout(field, ['a', 'b'])).toBe('full')
      })

      it('should return full for null objects', () => {
        const field = { key: 'data' }
        expect(resolveDetailFieldLayout(field, null)).toBe('half')
      })
    })

    describe('long text values', () => {
      it('should return full for multiline strings', () => {
        const field = { key: 'notes' }
        expect(resolveDetailFieldLayout(field, 'line1\nline2')).toBe('full')
      })

      it('should return full for strings >= 60 chars', () => {
        const field = { key: 'notes' }
        const longText = 'a'.repeat(60)
        expect(resolveDetailFieldLayout(field, longText)).toBe('full')
      })

      it('should return half for strings < 60 chars (non-full-width field)', () => {
        const field = { key: 'label' } // 不匹配 fullWidthFieldPattern
        expect(resolveDetailFieldLayout(field, 'short text')).toBe('half')
      })
    })

    describe('date/datetime/boolean formatters', () => {
      it('should return half for date formatter', () => {
        const field = { key: 'created_at', formatter: 'date' as const }
        expect(resolveDetailFieldLayout(field, '2024-01-01')).toBe('half')
      })

      it('should return half for datetime formatter', () => {
        const field = { key: 'updated_at', formatter: 'datetime' as const }
        expect(resolveDetailFieldLayout(field, '2024-01-01T00:00:00Z')).toBe('half')
      })

      it('should return half for boolean formatter', () => {
        const field = { key: 'is_active', formatter: 'boolean' as const }
        expect(resolveDetailFieldLayout(field, true)).toBe('half')
      })
    })

    describe('status formatter', () => {
      it('should return third for short status values', () => {
        const field = { key: 'status', formatter: 'status' as const }
        expect(resolveDetailFieldLayout(field, 'active')).toBe('third')
      })

      it('should return half for long status values', () => {
        const field = { key: 'status', formatter: 'status' as const }
        expect(resolveDetailFieldLayout(field, 'a_very_long_status')).toBe('half')
      })
    })

    describe('compact field patterns', () => {
      it('should return third for id fields with short values', () => {
        const field = { key: 'id' }
        expect(resolveDetailFieldLayout(field, 123)).toBe('third')
      })

      it('should return third for code fields', () => {
        const field = { key: 'code' }
        expect(resolveDetailFieldLayout(field, 'ABC123')).toBe('third')
      })

      it('should return half for id fields with long values', () => {
        const field = { key: 'id' }
        // Use string to avoid precision loss
        expect(resolveDetailFieldLayout(field, '12345678901234567890')).toBe('half')
      })
    })

    describe('half-width field patterns', () => {
      it('should return half for status field without formatter', () => {
        const field = { key: 'status' }
        expect(resolveDetailFieldLayout(field, 'active')).toBe('half')
      })

      it('should return half for email field', () => {
        const field = { key: 'email' }
        expect(resolveDetailFieldLayout(field, 'test@example.com')).toBe('half')
      })

      it('should return half for name field', () => {
        const field = { key: 'name' }
        expect(resolveDetailFieldLayout(field, 'John Doe')).toBe('half')
      })

      it('should return half for is_* boolean fields', () => {
        const field = { key: 'is_active' }
        expect(resolveDetailFieldLayout(field, true)).toBe('half')
      })
    })

    describe('number values', () => {
      it('should return third for short numbers (compact field)', () => {
        const field = { key: 'count' } // 匹配 compactThirdWidthFieldPattern
        expect(resolveDetailFieldLayout(field, 100)).toBe('third')
      })

      it('should return third for compact fields with values <= 18 chars', () => {
        const field = { key: 'count' }
        // Use string representation of 18-digit number to avoid precision loss
        expect(resolveDetailFieldLayout(field, '123456789012345678')).toBe('third')
      })

      it('should return half for non-compact fields with long numbers', () => {
        const field = { key: 'amount' } // 不匹配 compactThirdWidthFieldPattern
        expect(resolveDetailFieldLayout(field, 1234567890123)).toBe('half') // 13位
      })

      it('should return third for non-compact fields with short numbers', () => {
        const field = { key: 'amount' }
        expect(resolveDetailFieldLayout(field, 123)).toBe('third') // 3位
      })
    })

    describe('default cases', () => {
      it('should return half for unknown string fields', () => {
        const field = { key: 'unknown_field' }
        expect(resolveDetailFieldLayout(field, 'value')).toBe('half')
      })

      it('should return half for null values', () => {
        const field = { key: 'field' }
        expect(resolveDetailFieldLayout(field, null)).toBe('half')
      })

      it('should return half for undefined values', () => {
        const field = { key: 'field' }
        expect(resolveDetailFieldLayout(field, undefined)).toBe('half')
      })
    })
  })

  describe('getDetailFieldTruncationLimit', () => {
    it('should return 140 for full layout', () => {
      expect(getDetailFieldTruncationLimit('full')).toBe(140)
    })

    it('should return 50 for half layout', () => {
      expect(getDetailFieldTruncationLimit('half')).toBe(50)
    })

    it('should return 28 for third layout', () => {
      expect(getDetailFieldTruncationLimit('third')).toBe(28)
    })

    it('should return 50 for auto layout (default)', () => {
      expect(getDetailFieldTruncationLimit('auto')).toBe(50)
    })
  })
})
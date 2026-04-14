import { describe, expect, it } from 'vitest'
import {
  formatDurationFromMilliseconds,
  formatDurationFromSeconds
} from '@/views/logs/shared/formatters'

describe('log duration formatters', () => {
  it('formats audit log seconds as milliseconds for sub-second values', () => {
    expect(formatDurationFromSeconds(0.345)).toBe('345 ms')
  })

  it('formats audit log seconds as seconds for long values', () => {
    expect(formatDurationFromSeconds(1.234)).toBe('1.23 s')
  })

  it('formats api access log milliseconds with integer precision', () => {
    expect(formatDurationFromMilliseconds(345)).toBe('345 ms')
  })

  it('keeps sub-millisecond api access values readable', () => {
    expect(formatDurationFromMilliseconds(0.345)).toBe('0.35 ms')
  })
})

import { describe, expect, it } from 'vitest'
import { APP_DESCRIPTION, APP_FULL_NAME, APP_NAME } from '@/constants/app'

describe('app constants', () => {
  it('exports the MCS brand constants', () => {
    expect(APP_NAME).toBe('P9 MCS')
    expect(APP_FULL_NAME).toBe('Houston Material Control System')
    expect(APP_DESCRIPTION).toBe('休斯顿智能物料控制系统')
  })
})

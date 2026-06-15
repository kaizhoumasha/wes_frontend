import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('RuntimeStatusBadge styles', () => {
  it('disables pulse animation for reduced motion users', () => {
    const source = readFileSync(
      resolve(process.cwd(), 'src/components/common/runtime/RuntimeStatusBadge.vue'),
      'utf8'
    )

    expect(source).toContain('@media (prefers-reduced-motion: reduce)')
    expect(source).toContain('.runtime-status-badge__dot.is-pulse')
    expect(source).toMatch(/animation:\s*none/)
  })
})

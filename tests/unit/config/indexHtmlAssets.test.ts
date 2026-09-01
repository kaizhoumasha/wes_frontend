import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const indexHtml = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8')

describe('index.html assets', () => {
  it('uses an inline icon instead of requesting an unshipped file', () => {
    const iconHref = indexHtml.match(/<link\s+rel="icon"\s+href="([^"]+)"/u)?.[1]

    expect(iconHref).toMatch(/^data:image\/svg\+xml,/u)
    expect(indexHtml).not.toContain('/vite.svg')
  })
})

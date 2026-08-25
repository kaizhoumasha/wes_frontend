import { describe, expect, it } from 'vitest'
import { hasRouteAccess } from '@/router/route-access'

describe('hasRouteAccess', () => {
  it('allows authenticated routes with no required permissions', () => {
    expect(hasRouteAccess({}, new Set(), false)).toBe(true)
  })

  it('requires the exact single permission', () => {
    expect(hasRouteAccess({ permission: 'biz:device:list' }, new Set(), false)).toBe(false)
    expect(
      hasRouteAccess({ permission: 'biz:device:list' }, new Set(['biz:device:list']), false)
    ).toBe(true)
  })

  it('allows any listed permission', () => {
    expect(hasRouteAccess({ permissions: ['a', 'b'] }, new Set(['b']), false)).toBe(true)
    expect(hasRouteAccess({ permissions: ['a', 'b'] }, new Set(['c']), false)).toBe(false)
  })

  it('requires both permission forms when both are present', () => {
    expect(
      hasRouteAccess({ permission: 'single', permissions: ['a', 'b'] }, new Set(['single']), false)
    ).toBe(false)
    expect(
      hasRouteAccess({ permission: 'single', permissions: ['a', 'b'] }, new Set(['a']), false)
    ).toBe(false)
    expect(
      hasRouteAccess(
        { permission: 'single', permissions: ['a', 'b'] },
        new Set(['single', 'b']),
        false
      )
    ).toBe(true)
  })

  it('treats an empty permissions array as authenticated-only', () => {
    expect(hasRouteAccess({ permissions: [] }, new Set(), false)).toBe(true)
  })

  it('lets a superuser bypass protected routes', () => {
    expect(hasRouteAccess({ permission: 'missing' }, new Set(), true)).toBe(true)
  })

  it('denies malformed runtime metadata', () => {
    expect(hasRouteAccess({ permission: ['biz:device:list'] } as never, new Set(), false)).toBe(
      false
    )
    expect(hasRouteAccess({ permissions: ['a', 1] } as never, new Set(['a']), false)).toBe(false)
  })
})

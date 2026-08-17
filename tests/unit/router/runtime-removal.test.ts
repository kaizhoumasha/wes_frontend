import type { RouteRecordRaw } from 'vue-router'
import { describe, expect, it } from 'vitest'
import { buildCurrentMenuManifest } from '@/router/menu-manifest'
import { createRoutes } from '@/router/routes'

function flatten(routes: readonly RouteRecordRaw[]): RouteRecordRaw[] {
  return routes.flatMap(route => [route, ...flatten(route.children ?? [])])
}

describe('legacy runtime removal', () => {
  it('does not publish legacy runtime routes or menu entries', () => {
    const routes = flatten(createRoutes())
    const menu = buildCurrentMenuManifest()

    expect(routes.some(route => route.name === 'RuntimeRoot')).toBe(false)
    expect(routes.some(route => route.path === 'runtime')).toBe(false)
    expect(menu.some(entry => entry.name.startsWith('runtime:'))).toBe(false)
    expect(menu.some(entry => entry.path.startsWith('/runtime'))).toBe(false)
  })
})

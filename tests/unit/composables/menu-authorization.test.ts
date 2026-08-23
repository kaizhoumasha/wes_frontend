import { describe, expect, it } from 'vitest'
import type { MenuItem } from '@/types/menu'
import { filterAuthorizedMenuTree } from '@/composables/useMenu'

function menu(id: number, path: string, children: MenuItem[] = []): MenuItem {
  return {
    id,
    name: `menu-${id}`,
    title: `Menu ${id}`,
    path,
    icon: null,
    parent_id: null,
    tree_path: '/',
    level: 0,
    sort_order: id,
    has_children: children.length > 0,
    component: null,
    permission: null,
    is_hidden: false,
    children
  } as MenuItem
}

const routeAccess = new Map([
  ['/ops', { permission: '*', navigable: false }],
  ['/ops/device-diagnostics', { permission: '*', navigable: true }],
  ['/biz', { permission: undefined, navigable: false }],
  ['/biz/devices', { permission: 'biz:device:list', navigable: true }]
])

describe('filterAuthorizedMenuTree', () => {
  const tree = [
    menu(1, '/ops', [menu(2, '/ops/device-diagnostics')]),
    menu(3, '/biz', [menu(4, '/biz/devices')])
  ]
  const resolveAccess = (path: string) => routeAccess.get(path) ?? { navigable: false }

  it('keeps ops parent and child for a superuser', () => {
    const filtered = filterAuthorizedMenuTree(tree, resolveAccess, permission => permission === '*')
    expect(filtered[0]?.path).toBe('/ops')
    expect(filtered[0]?.children[0]?.path).toBe('/ops/device-diagnostics')
  })

  it('removes unauthorized child and its empty non-navigable parent without harming existing menus', () => {
    const filtered = filterAuthorizedMenuTree(
      tree,
      resolveAccess,
      permission => permission === 'biz:device:list'
    )
    expect(filtered.map(item => item.path)).toEqual(['/biz'])
    expect(filtered[0]?.children.map(item => item.path)).toEqual(['/biz/devices'])
  })
})

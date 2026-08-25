import type { RouteRecordRaw } from 'vue-router'
import { describe, expect, it } from 'vitest'
import { buildAuthorizedMenuTree } from '@/router/menu-tree'
import { createRoutes } from '@/router/routes'

const routes: RouteRecordRaw[] = [
  {
    path: '/warehouse',
    meta: {
      requiresAuth: true,
      menu: { name: 'warehouse:menu', title: '仓库', sortOrder: 20 }
    },
    children: [
      {
        path: 'devices',
        meta: {
          permission: 'biz:device:list',
          menu: { name: 'warehouse:devices:menu', title: '设备', icon: 'ep:cpu', sortOrder: 2 }
        }
      },
      {
        path: '/warehouse/absolute',
        meta: {
          permission: 'biz:absolute:list',
          menu: { name: 'warehouse:absolute:menu', title: '绝对路径', sortOrder: 1 }
        }
      },
      {
        path: 'status',
        meta: {
          permission: 'biz:status:list',
          menu: { name: 'warehouse:status:menu', title: '状态', sortOrder: 1 }
        }
      },
      {
        path: 'hidden',
        meta: {
          menu: { name: 'warehouse:hidden:menu', title: '隐藏', hidden: true }
        }
      },
      {
        path: 'denied',
        meta: {
          permission: 'biz:denied:list',
          menu: { name: 'warehouse:denied:menu', title: '拒绝' }
        }
      }
    ]
  },
  {
    path: '/empty',
    meta: {
      requiresAuth: true,
      menu: { name: 'empty:menu', title: '空菜单', sortOrder: 10 }
    },
    children: [
      {
        path: 'denied',
        meta: {
          permission: 'biz:denied:list',
          menu: { name: 'empty:denied:menu', title: '拒绝' }
        }
      }
    ]
  },
  {
    path: '/public',
    meta: {
      requiresAuth: false,
      menu: { name: 'public:menu', title: '公开' }
    }
  },
  {
    path: '/debug',
    meta: {
      requiresAuth: false,
      menu: { name: 'debug:menu', title: '调试' }
    }
  }
]

describe('buildAuthorizedMenuTree', () => {
  it('projects authorized leaves, prunes hidden or unauthorized leaves, and orders siblings', () => {
    expect(
      buildAuthorizedMenuTree(
        routes,
        new Set(['biz:device:list', 'biz:absolute:list', 'biz:status:list']),
        false
      )
    ).toEqual([
      {
        name: 'warehouse:menu',
        title: '仓库',
        path: '/warehouse',
        children: [
          {
            name: 'warehouse:absolute:menu',
            title: '绝对路径',
            path: '/warehouse/absolute',
            children: []
          },
          {
            name: 'warehouse:status:menu',
            title: '状态',
            path: '/warehouse/status',
            children: []
          },
          {
            name: 'warehouse:devices:menu',
            title: '设备',
            path: '/warehouse/devices',
            icon: 'ep:cpu',
            children: []
          }
        ]
      }
    ])
  })

  it('keeps all non-hidden protected entries for a superuser', () => {
    const tree = buildAuthorizedMenuTree(routes, new Set(), true)

    expect(tree.map(item => item.name)).toEqual(['empty:menu', 'warehouse:menu'])
    expect(tree[1]?.children.map(item => item.name)).toEqual([
      'warehouse:absolute:menu',
      'warehouse:status:menu',
      'warehouse:devices:menu',
      'warehouse:denied:menu'
    ])
  })

  it('keeps an empty nested child path at its parent canonical path', () => {
    expect(
      buildAuthorizedMenuTree(
        [
          {
            path: '/parent',
            meta: {
              requiresAuth: true,
              menu: { name: 'parent:menu', title: '父级' }
            },
            children: [
              {
                path: '',
                meta: {
                  menu: { name: 'parent:default:menu', title: '默认页' }
                }
              }
            ]
          }
        ],
        new Set(),
        false
      )
    ).toEqual([
      {
        name: 'parent:menu',
        title: '父级',
        path: '/parent',
        children: [
          {
            name: 'parent:default:menu',
            title: '默认页',
            path: '/parent',
            children: []
          }
        ]
      }
    ])
  })

  it('uses explicit globally unique menu names for every protected titled route', () => {
    const names = collectProtectedTitledRouteMenuNames(createRoutes())

    expect(names).not.toContain(undefined)
    const explicitNames = names.filter((name): name is string => name !== undefined)
    expect(explicitNames).toHaveLength(new Set(explicitNames).size)
  })
})

function collectProtectedTitledRouteMenuNames(
  routeNodes: readonly RouteRecordRaw[],
  inheritedAuth = false
): Array<string | undefined> {
  return routeNodes.flatMap(route => {
    const requiresAuth = route.meta?.requiresAuth ?? inheritedAuth
    const title = route.meta?.menu?.title ?? route.meta?.title
    const name = requiresAuth && typeof title === 'string' ? route.meta?.menu?.name : undefined

    return [
      ...(requiresAuth && typeof title === 'string' ? [name] : []),
      ...collectProtectedTitledRouteMenuNames(route.children ?? [], requiresAuth)
    ]
  })
}

import type { RouteMeta, RouteRecordRaw } from 'vue-router'
import type { MenuItem } from '@/types/menu'
import { hasRouteAccess } from './route-access'

export function buildAuthorizedMenuTree(
  routes: readonly RouteRecordRaw[],
  permissionNames: ReadonlySet<string>,
  isSuperuser: boolean
): MenuItem[] {
  return projectRoutes(routes, '', false, permissionNames, isSuperuser)
}

function projectRoutes(
  routes: readonly RouteRecordRaw[],
  parentPath: string,
  inheritedAuth: boolean,
  permissionNames: ReadonlySet<string>,
  isSuperuser: boolean
): MenuItem[] {
  return routes
    .map((route, index) => ({ route, index }))
    .sort((left, right) => compareRoutes(left.route, right.route, left.index, right.index))
    .flatMap(({ route }) => {
      const meta = route.meta ?? {}
      const requiresAuth = meta.requiresAuth ?? inheritedAuth
      const path = resolvePath(parentPath, route.path)

      if (!requiresAuth || meta.menu?.hidden) {
        return []
      }

      const children = projectRoutes(
        route.children ?? [],
        path,
        requiresAuth,
        permissionNames,
        isSuperuser
      )
      const title = menuTitle(meta)

      if (!hasMenuMetadata(meta, title)) {
        return children
      }

      if (route.children?.length) {
        return children.length > 0 ? [toMenuItem(meta, title, path, children)] : []
      }

      return hasRouteAccess(meta, permissionNames, isSuperuser)
        ? [toMenuItem(meta, title, path, [])]
        : []
    })
}

function compareRoutes(
  left: RouteRecordRaw,
  right: RouteRecordRaw,
  leftIndex: number,
  rightIndex: number
): number {
  const leftOrder = left.meta?.menu?.sortOrder ?? Number.MAX_SAFE_INTEGER
  const rightOrder = right.meta?.menu?.sortOrder ?? Number.MAX_SAFE_INTEGER

  return leftOrder - rightOrder || leftIndex - rightIndex
}

function hasMenuMetadata(meta: RouteMeta, title: string | undefined): title is string {
  return (
    typeof meta.menu?.name === 'string' && meta.menu.name.length > 0 && typeof title === 'string'
  )
}

function menuTitle(meta: RouteMeta): string | undefined {
  return meta.menu?.title ?? meta.title
}

function toMenuItem(meta: RouteMeta, title: string, path: string, children: MenuItem[]): MenuItem {
  const icon = meta.menu?.icon

  return {
    name: meta.menu!.name,
    title,
    path,
    ...(icon ? { icon } : {}),
    children
  }
}

function resolvePath(parentPath: string, routePath: string): string {
  if (routePath.startsWith('/')) {
    return routePath
  }

  const normalizedRoutePath = routePath.replace(/^\/+/, '')
  if (!parentPath || parentPath === '/') {
    return `/${normalizedRoutePath}`
  }

  return `${parentPath.replace(/\/+$/, '')}/${normalizedRoutePath}`
}

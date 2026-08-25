import type { RouteMeta } from 'vue-router'

export function hasRouteAccess(
  meta: RouteMeta,
  permissionNames: ReadonlySet<string>,
  isSuperuser: boolean
): boolean {
  const permission = meta.permission
  const permissions = meta.permissions

  if (!isValidPermission(permission) || !isValidPermissions(permissions)) {
    return false
  }

  if (isSuperuser) {
    return true
  }

  return (
    (permission === undefined || permissionNames.has(permission)) &&
    (permissions === undefined ||
      permissions.length === 0 ||
      permissions.some(name => permissionNames.has(name)))
  )
}

function isValidPermission(value: unknown): value is string | undefined {
  return value === undefined || (typeof value === 'string' && value.length > 0)
}

function isValidPermissions(value: unknown): value is string[] | undefined {
  return value === undefined || (Array.isArray(value) && value.every(isNonEmptyString))
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0
}

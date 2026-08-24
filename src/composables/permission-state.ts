import { computed, ref } from 'vue'
import type { ApiPermissionInfo } from '@/api/modules/auth'
import { PERMISSION_CACHE, getCachedData, setCachedData, clearCachedData } from '@/constants/cache'

export const SUPERUSER_PERMISSION = '*'

export const permissionsState = ref<ApiPermissionInfo[]>([])
export const permissionNamesState = ref<Set<string>>(new Set())
export const permissionLoadingState = ref(false)
export const permissionLoadErrorState = ref<Error | null>(null)
export const permissionInitializedState = ref(false)

export const isSuperuserState = computed(() => permissionNamesState.value.has(SUPERUSER_PERMISSION))

export function checkPermissionState(permissionName: string): boolean {
  return isSuperuserState.value || permissionNamesState.value.has(permissionName)
}

export function setPermissionsState(perms: ApiPermissionInfo[]): void {
  permissionsState.value = perms
  permissionNamesState.value = new Set(perms.map(permission => permission.name))
  permissionInitializedState.value = true
}

export function getPermissionsFromCache(): ApiPermissionInfo[] | null {
  return getCachedData<ApiPermissionInfo[]>(
    PERMISSION_CACHE.KEY,
    PERMISSION_CACHE.TIME_KEY,
    PERMISSION_CACHE.TTL
  )
}

export function setPermissionsToCache(perms: ApiPermissionInfo[]): void {
  setCachedData(PERMISSION_CACHE.KEY, PERMISSION_CACHE.TIME_KEY, perms)
}

export function clearPermissionState(): void {
  permissionsState.value = []
  permissionNamesState.value = new Set()
  permissionLoadErrorState.value = null
  permissionInitializedState.value = false
  clearCachedData(PERMISSION_CACHE.KEY, PERMISSION_CACHE.TIME_KEY)
}

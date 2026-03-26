import { computed, ref } from 'vue'
import type { UserInfo } from '@/api/modules/auth'
import { CACHE_KEY_PREFIX } from '@/constants/cache'

const CURRENT_USER_KEY = `${CACHE_KEY_PREFIX}current_user`

const currentUser = ref<UserInfo | null>(null)

function readCurrentUserFromSession(): UserInfo | null {
  try {
    const cached = sessionStorage.getItem(CURRENT_USER_KEY)
    if (!cached) {
      return null
    }

    const user = JSON.parse(cached) as UserInfo
    if (typeof user?.full_name !== 'string') {
      return null
    }

    return user
  } catch {
    return null
  }
}

function writeCurrentUserToSession(user: UserInfo): void {
  try {
    sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
  } catch (error) {
    console.error('写入当前用户缓存失败:', error)
  }
}

function restoreCurrentUser(): void {
  if (currentUser.value) {
    return
  }

  currentUser.value = readCurrentUserFromSession()
}

export function useCurrentUser() {
  restoreCurrentUser()

  const hydrateCurrentUser = (user: UserInfo, persist = true): void => {
    currentUser.value = user
    if (persist) {
      writeCurrentUserToSession(user)
    }
  }

  const clearCurrentUser = (): void => {
    currentUser.value = null
    sessionStorage.removeItem(CURRENT_USER_KEY)
  }

  return {
    currentUser: computed(() => currentUser.value),
    hydrateCurrentUser,
    clearCurrentUser
  }
}

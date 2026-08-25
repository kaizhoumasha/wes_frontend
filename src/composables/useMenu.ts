import { computed, ref } from 'vue'
import {
  isSuperuserState,
  permissionInitializedState,
  permissionNamesState
} from '@/composables/permission-state'
import { buildAuthorizedMenuTree } from '@/router/menu-tree'
import { createRoutes } from '@/router/routes'
import { getMenuBreadcrumb } from '@/types/menu'
import type { MenuItem } from '@/types/menu'

const selectedPath = ref('')
const openedPaths = ref<string[]>([])

const menuTree = computed<MenuItem[]>(() => {
  if (!permissionInitializedState.value) {
    return []
  }

  return buildAuthorizedMenuTree(
    createRoutes(),
    permissionNamesState.value,
    isSuperuserState.value
  )
})

export function useMenu() {
  const selectMenu = (path: string): void => {
    selectedPath.value = path
    openedPaths.value = getMenuBreadcrumb(menuTree.value, path)
      .slice(0, -1)
      .map(item => item.path)
  }

  const toggleMenu = (path: string): void => {
    const index = openedPaths.value.indexOf(path)
    if (index > -1) {
      openedPaths.value.splice(index, 1)
    } else {
      openedPaths.value.push(path)
    }
  }

  const getBreadcrumb = (path: string): MenuItem[] => getMenuBreadcrumb(menuTree.value, path)

  const findMenuItem = (
    path: string,
    menus: readonly MenuItem[] = menuTree.value
  ): MenuItem | undefined => {
    for (const menu of menus) {
      if (menu.path === path) {
        return menu
      }

      const found = findMenuItem(path, menu.children)
      if (found) {
        return found
      }
    }
  }

  const isMenuOpened = (path: string): boolean => openedPaths.value.includes(path)
  const isMenuSelected = (path: string): boolean => selectedPath.value === path

  return {
    menuTree,
    selectedPath: computed(() => selectedPath.value),
    openedPaths: computed(() => openedPaths.value),
    selectMenu,
    toggleMenu,
    getBreadcrumb,
    findMenuItem,
    isMenuOpened,
    isMenuSelected
  }
}

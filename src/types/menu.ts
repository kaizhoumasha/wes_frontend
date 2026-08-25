/**
 * 本地路由投影的导航菜单
 */
export interface MenuItem {
  name: string
  title: string
  path: string
  icon?: string
  children: MenuItem[]
}

export function getMenuBreadcrumb(menuTree: readonly MenuItem[], path: string): MenuItem[] {
  return findMenuBreadcrumb(menuTree, path) ?? []
}

function findMenuBreadcrumb(
  menus: readonly MenuItem[],
  targetPath: string,
  currentPath: MenuItem[] = []
): MenuItem[] | undefined {
  for (const menu of menus) {
    const nextPath = [...currentPath, menu]

    if (menu.path === targetPath) {
      return nextPath
    }

    const childBreadcrumb = findMenuBreadcrumb(menu.children, targetPath, nextPath)
    if (childBreadcrumb) {
      return childBreadcrumb
    }
  }
}

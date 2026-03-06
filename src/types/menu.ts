/**
 * 菜单类型定义
 *
 * 与后端菜单系统对接，支持多级菜单、权限控制、图标显示
 * 对应后端: src/app/admin/v1/menu.py
 */

// ==================== 菜单项类型 ====================

/**
 * 菜单项接口
 *
 * 表示一个菜单节点，可以是叶子节点或包含子菜单的父节点
 */
export interface MenuItem {
  /** 菜单 ID */
  id: number
  /** 菜单标识（如 system:users, device:monitor） */
  name: string
  /** 显示标题 */
  title: string
  /** 路由路径 */
  path: string
  /** 组件路径（可选，外部链接无需组件） */
  component?: string
  /** Element Plus 图标名称（可选） */
  icon?: string
  /** 是否隐藏（后端已根据权限过滤） */
  is_hidden: boolean
  /** 排序序号 */
  sort_order?: number
  /** 子菜单 */
  children: MenuItem[]
}

/**
 * 菜单树响应（后端返回格式）
 *
 * 后端直接返回树形结构，前端无需手动构建
 */
export interface MenuTreeResponse {
  /** 菜单 ID */
  id: number
  /** 菜单标识 */
  name: string
  /** 显示标题 */
  title: string
  /** 路由路径 */
  path: string
  /** 组件路径 */
  component?: string
  /** 图标名称 */
  icon?: string
  /** 是否隐藏 */
  is_hidden: boolean
  /** 排序序号 */
  sort_order?: number
  /** 子菜单 */
  children: MenuTreeResponse[]
}

/**
 * 扁平化菜单项（用于面包屑导航）
 */
export interface FlatMenuItem {
  /** 菜单 ID */
  id: number
  /** 菜单标识 */
  name: string
  /** 显示标题 */
  title: string
  /** 路由路径 */
  path: string
  /** 图标名称 */
  icon?: string
  /** 父菜单 ID */
  parent_id?: number
  /** 层级深度 */
  level: number
}

/**
 * 活动菜单状态
 */
export interface ActiveMenuState {
  /** 当前选中的菜单路径 */
  selectedPath: string
  /** 当前展开的菜单路径数组 */
  openedPaths: string[]
}

// ==================== 类型辅助函数 ====================

/**
 * 将后端菜单树转换为前端菜单项
 *
 * @param response 后端菜单树响应
 * @returns 前端菜单项
 */
export function toMenuItem(response: MenuTreeResponse): MenuItem {
  const children = Array.isArray(response.children) ? response.children : []

  return {
    id: response.id,
    name: response.name,
    title: response.title,
    path: response.path,
    component: response.component,
    icon: response.icon,
    is_hidden: response.is_hidden ?? false,
    sort_order: response.sort_order,
    children: children.map(toMenuItem)
  }
}

/**
 * 扁平化菜单树（用于面包屑导航）
 *
 * @param menuTree 菜单树
 * @param parentId 父菜单 ID
 * @param level 层级深度
 * @returns 扁平化菜单项数组
 */
export function flattenMenuTree(
  menuTree: MenuItem[],
  parentId?: number,
  level = 0
): FlatMenuItem[] {
  const result: FlatMenuItem[] = []

  for (const menu of menuTree) {
    result.push({
      id: menu.id,
      name: menu.name,
      title: menu.title,
      path: menu.path,
      icon: menu.icon,
      parent_id: parentId,
      level
    })

    if (menu.children.length > 0) {
      result.push(...flattenMenuTree(menu.children, menu.id, level + 1))
    }
  }

  return result
}

/**
 * 根据路径查找菜单项
 *
 * @param menuTree 菜单树
 * @param path 路由路径
 * @returns 找到的菜单项，未找到时返回 undefined
 */
export function findMenuItemByPath(
  menuTree: MenuItem[],
  path: string
): MenuItem | undefined {
  for (const menu of menuTree) {
    if (menu.path === path) {
      return menu
    }

    if (menu.children.length > 0) {
      const found = findMenuItemByPath(menu.children, path)
      if (found) {
        return found
      }
    }
  }

  return undefined
}

/**
 * 获取菜单项的面包屑路径
 *
 * @param menuTree 菜单树
 * @param path 路由路径
 * @returns 面包屑菜单项数组（从根到当前菜单）
 */
export function getMenuBreadcrumb(
  menuTree: MenuItem[],
  path: string
): MenuItem[] {
  const breadcrumb: MenuItem[] = []

  function findPath(menus: MenuItem[], targetPath: string, currentPath: MenuItem[]): boolean {
    for (const menu of menus) {
      const newPath = [...currentPath, menu]

      if (menu.path === targetPath) {
        breadcrumb.push(...newPath)
        return true
      }

      if (menu.children.length > 0) {
        if (findPath(menu.children, targetPath, newPath)) {
          return true
        }
      }
    }

    return false
  }

  findPath(menuTree, path, [])
  return breadcrumb
}

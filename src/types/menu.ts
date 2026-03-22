/**
 * 菜单类型定义
 *
 * 与后端菜单系统对接，支持多级菜单、权限控制、图标显示
 * 对应后端: src/app/admin/v1/menu.py
 */

import { z } from 'zod'
import { MenuTreeResponseSchema } from './zod-extensions'

// ==================== 菜单项类型 ====================

/**
 * 菜单项类型（直接从后端 schema 推断）
 *
 * 表示一个菜单节点，可以是叶子节点或包含子菜单的父节点
 */
export type MenuTreeResponse = z.infer<typeof MenuTreeResponseSchema>

/**
 * 菜单项（前端使用，确保 children 是数组）
 */
export type MenuItem = Omit<MenuTreeResponse, 'children'> & {
  children: MenuItem[]
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
 * 主要处理 children 可能 undefined 的情况，确保 children 始终是数组
 *
 * @param response 后端菜单树响应
 * @returns 前端菜单项
 */
export function toMenuItem(response: MenuTreeResponse): MenuItem {
  const children = response.children ?? []

  return {
    ...response,
    is_hidden: response.is_hidden ?? false,
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
      icon: menu.icon ?? undefined,
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
  return findMenuBreadcrumb(menuTree, path) ?? []
}

function findMenuBreadcrumb(
  menus: MenuItem[],
  targetPath: string,
  currentPath: MenuItem[] = []
): MenuItem[] | undefined {
  for (const menu of menus) {
    const nextPath = [...currentPath, menu]

    if (menu.path === targetPath) {
      return nextPath
    }

    if (menu.children.length > 0) {
      const childBreadcrumb = findMenuBreadcrumb(menu.children, targetPath, nextPath)
      if (childBreadcrumb) {
        return childBreadcrumb
      }
    }
  }

  return undefined
}

import { computed, type ComputedRef, type Ref, type Component } from 'vue'
import { usePermission } from './usePermission'

/**
 * useToolbarActions Composable
 *
 * 通过配置对象定义操作按钮，自动处理权限过滤和条件显示.
 *
 * @example
 * ```typescript
 * import { Plus } from '@element-plus/icons-vue'
 * import { useToolbarActions } from '@/composables/useToolbarActions'
 * import { USER_PERMISSION } from './constants'
 *
 * const createLoading = ref(false)
 *
 * const { filteredActions } = useToolbarActions({
 *   actions: [
 *     {
 *       key: 'create',
 *       label: '新增用户',
 *       icon: Plus,
 *       type: 'primary',
 *       handler: openCreateDialog,
 *       permission: USER_PERMISSION.create,
 *       loading: createLoading
 *     }
 *   ]
 * })
 * ```
 */

// ============================================================================
// 类型定义
// ============================================================================

export interface ToolbarAction {
  /** 按钮唯一标识 */
  key: string
  /** 按钮文本 */
  label: string
  /** 按钮图标（Element Plus 图标组件） */
  icon?: Component
  /** 按钮类型 */
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  /** 点击处理函数 */
  handler: () => void | Promise<void>
  /** 权限代码（可选，如果提供则自动进行权限检查） */
  permission?: string
  /** 条件显示函数（可选，返回 false 则隐藏按钮） */
  showWhen?: () => boolean
  /** 是否加载中 */
  loading?: Ref<boolean> | boolean
}

export interface UseToolbarActionsOptions {
  /** 操作按钮配置数组 */
  actions: ToolbarAction[]
}

export interface UseToolbarActionsReturn {
  /**
   * 过滤后的操作按钮数组（computed）.
   * 自动根据权限和 showWhen 条件过滤.
   */
  filteredActions: ComputedRef<ToolbarAction[]>
}

// ============================================================================
// Composable 实现
// ============================================================================

export function useToolbarActions(options: UseToolbarActionsOptions): UseToolbarActionsReturn {
  const { actions } = options
  const { hasPermission } = usePermission()

  // 过滤后的操作按钮
  const filteredActions = computed(() => {
    return actions.filter(action => {
      // 1. 权限检查
      if (action.permission && !hasPermission(action.permission)) {
        return false
      }

      // 2. 条件显示检查
      if (action.showWhen && !action.showWhen()) {
        return false
      }

      return true
    })
  })

  return {
    filteredActions
  }
}

import { computed } from 'vue'
import { useStorage } from '@vueuse/core'

export interface ColumnConfig {
  key: string
  label: string
  visible: boolean
}

export const DEFAULT_COLUMN_CONFIG: ColumnConfig[] = [
  { key: 'username', label: '用户名', visible: true },
  { key: 'email', label: '邮箱', visible: true },
  { key: 'full_name', label: '姓名', visible: true },
  { key: 'is_superuser', label: '超级用户', visible: true },
  { key: 'is_multi_login', label: '多端登录', visible: true },
  { key: 'roles', label: '角色', visible: true },
  { key: 'updated_at', label: '更新时间', visible: true },
]

/**
 * 用户表格列配置 composable
 *
 * 管理列的显示/隐藏和排列顺序，持久化到 localStorage
 */
export function useUserTableColumns() {
  const columnConfig = useStorage<ColumnConfig[]>(
    'wes-user-table-columns',
    DEFAULT_COLUMN_CONFIG.map(c => ({ ...c }))
  )

  const visibleColumnKeys = computed(() =>
    columnConfig.value.filter(c => c.visible).map(c => c.key)
  )

  function updateConfig(newConfig: ColumnConfig[]) {
    columnConfig.value = newConfig
  }

  function resetConfig() {
    columnConfig.value = DEFAULT_COLUMN_CONFIG.map(c => ({ ...c }))
  }

  return {
    columnConfig,
    visibleColumnKeys,
    updateConfig,
    resetConfig,
  }
}

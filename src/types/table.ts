/**
 * 表格相关类型定义
 */

// 重新导出 table.types.ts 中的类型
export type { TableColumnConfig } from '@/components/ui/table/table.types'

/**
 * 表格密度类型
 *
 * - comfortable: 舒适模式（大行高）
 * - compact: 紧凑模式（默认行高）
 * - small: 迷你模式（小行高）
 */
export type TableDensity = 'comfortable' | 'compact' | 'small'

/**
 * Element Plus Table size 类型映射
 */
export type ElementTableSize = 'large' | 'default' | 'small'

/**
 * 表格密度配置
 */
export interface DensityConfig {
  /** 显示标签 */
  label: string
  /** Element Plus Table size */
  size: ElementTableSize
}

/**
 * 表格密度配置映射
 */
export const DENSITY_CONFIG: Record<TableDensity, DensityConfig> = {
  comfortable: { label: '舒适', size: 'large' },
  compact: { label: '紧凑', size: 'default' },
  small: { label: '迷你', size: 'small' }
} as const

/**
 * 默认表格密度
 */
export const DEFAULT_DENSITY: TableDensity = 'compact' as const

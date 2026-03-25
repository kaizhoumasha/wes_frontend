/**
 * CRUD Detail Panel Type Definitions
 *
 * @module crud-page/detail/types
 *
 * 设计文档: docs/design/CRUD_DETAIL_PANEL_DESIGN.md
 *
 * Eng Review 改进:
 * - FormatterFunction 支持泛型，item 参数获得完整类型推断
 * - CrudPageDetailField 支持泛型
 * - CrudPageDetailAction 添加 popconfirm 支持
 */

import type { VNode } from 'vue'
import type { CrudPageEntity } from '../types'

/**
 * 格式化器函数类型（泛型版本，支持类型推断）
 * @template TItem - 实体类型
 */
export type FormatterFunction<TItem extends CrudPageEntity = CrudPageEntity> =
  | 'datetime'
  | 'date'
  | 'boolean'
  | 'status'
  | 'json'
  | ((value: unknown, item: TItem) => VNode | string)

/**
 * 详情面板配置
 * @template TItem - 实体类型
 */
export interface CrudPageDetailConfig<TItem extends CrudPageEntity> {
  /** 展示模式 */
  mode?: 'drawer' | 'dialog'
  /** 宽度 (Drawer/Dialog) */
  width?: number | string
  /** 标题：静态文本或动态函数 */
  title?: string | ((item: TItem) => string)
  /** 分组配置 */
  sections?: CrudPageDetailSection<TItem>[]
  /** 底部操作按钮 */
  showActions?: boolean
  /** 自定义操作按钮 */
  actions?: CrudPageDetailAction<TItem>[]
  /** 空值显示配置 */
  emptyValue?: {
    text?: string
    icon?: string
    dash?: boolean
  }
  /** 响应式配置 */
  responsive?: {
    mobile?: {
      mode: 'drawer' | 'bottomSheet' | 'fullScreen'
      sections?: 'all' | 'primaryOnly'
    }
    tablet?: {
      width: number
    }
  }
}

/**
 * 详情分组
 * @template TItem - 实体类型
 */
export interface CrudPageDetailSection<TItem extends CrudPageEntity> {
  /** 分组标题 */
  title?: string
  /** 分组图标 */
  icon?: string
  /** 视觉权重 */
  weight?: 'primary' | 'secondary' | 'tertiary'
  /** 卡片风格 */
  variant?: 'card' | 'flat' | 'outlined' | 'filled'
  /** 折叠模式 */
  collapsible?: boolean
  /** 默认折叠状态 */
  defaultCollapsed?: boolean
  /** 字段列表（自动渲染） */
  fields?: CrudPageDetailField<TItem>[]
  /** 条件显示 */
  showWhen?: (item: TItem) => boolean
  /** 关联数据（懒加载） */
  relation?: {
    type: 'list' | 'tags' | 'table'
    data: (item: TItem) => unknown[] | Promise<unknown[]>
    columns?: Array<{ key: string; label: string }>
    emptyText?: string
    /** 关联数据加载失败回调 */
    onError?: (error: Error) => void
  }
}

/**
 * 详情字段
 * @template TItem - 实体类型
 */
export interface CrudPageDetailField<TItem extends CrudPageEntity = CrudPageEntity> {
  /** 字段名 */
  key: string
  /** 显示标签（默认使用字段名） */
  label?: string
  /** 格式化器（支持类型推断） */
  formatter?: FormatterFunction<TItem>
  /** 布局模式 */
  layout?: 'auto' | 'half' | 'full' | 'third'
  /** 标签位置 */
  labelPosition?: 'left' | 'top' | 'inline'
  /** 条件显示 */
  showWhen?: (value: unknown, item: TItem) => boolean
}

/**
 * 详情操作按钮
 * @template TItem - 实体类型
 */
export interface CrudPageDetailAction<TItem extends CrudPageEntity> {
  key: string
  label: string
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  icon?: string
  loading?: boolean
  disabled?: boolean | ((item: TItem) => boolean)
  /** 条件显示 */
  showWhen?: (item: TItem) => boolean
  /** 操作执行函数 */
  onClick: (item: TItem) => void | Promise<void>
  /** 确认弹窗配置（用于破坏性操作） */
  popconfirm?: {
    title: string
    message?: string
    confirmButtonText?: string
    cancelButtonText?: string
    confirmButtonType?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
    width?: number
  }
  /** 操作成功后的行为 */
  success?: {
    message?: string
    autoClose?: boolean
    autoCloseDelay?: number
  }
}

/**
 * 详情面板状态
 */
export interface CrudDetailState<TItem extends CrudPageEntity> {
  /** 是否打开 */
  open: boolean
  /** 当前查看的实体 */
  item: TItem | null
  /** 加载状态 */
  loading: boolean
  /** 错误信息 */
  error: Error | null
}

/**
 * 默认空值显示配置
 */
export const DEFAULT_EMPTY_VALUE = {
  dash: true,
  text: '—'
} as const

/**
 * 默认响应式配置
 */
export const DEFAULT_RESPONSIVE = {
  mobile: {
    mode: 'fullScreen' as const,
    sections: 'all' as const
  },
  tablet: {
    width: 400
  }
} as const

/**
 * 断点宽度配置
 */
export const DETAIL_WIDTH = {
  desktop: 520,
  tablet: 400,
  mobile: '100%'
} as const

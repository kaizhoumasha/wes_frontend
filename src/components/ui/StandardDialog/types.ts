/**
 * StandardDialog 组件类型定义
 * @version 1.1
 * @date 2026-03-19
 */

/** 对话框尺寸预设 */
export type DialogSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full'

/** 确认按钮类型 */
export type ConfirmButtonType = 'primary' | 'success' | 'warning' | 'danger'

/** 动画方向 */
export type DialogDirection = 'rtl' | 'ltr' | 'ttb' | 'btt'

/** 尺寸配置 */
export interface SizeConfig {
  /** 固定宽度 */
  width: number
  /** 最大宽度 (vw) */
  maxWidth: number
}

/** 标题图标类型 */
export type TitleIconType = 'warning' | 'danger' | 'info' | 'success'

/** StandardDialog Props 接口 */
export interface StandardDialogProps {
  // ==================== 基础属性 ====================

  /** 控制显示状态 */
  modelValue: boolean

  /** 对话框标题 */
  title?: string

  /** 标题图标类型 */
  titleIcon?: TitleIconType

  /** 尺寸预设 */
  size?: DialogSize

  /** 自定义宽度（覆盖 size 预设） */
  width?: string | number

  // ==================== 行为属性 ====================

  /** 是否显示关闭按钮 */
  closable?: boolean

  /** 点击遮罩是否关闭 */
  closeOnClickModal?: boolean

  /** 关闭时销毁内容 */
  destroyOnClose?: boolean

  /** 内容区滚动模式 */
  scrollable?: boolean

  // ==================== Footer 属性 ====================

  /** 是否显示底部区域 */
  showFooter?: boolean

  /** 确认按钮文本 */
  confirmText?: string

  /** 取消按钮文本 */
  cancelText?: string

  /** 确认按钮类型 */
  confirmType?: ConfirmButtonType

  /** 确认按钮加载状态 */
  confirmLoading?: boolean

  /** 确认按钮禁用状态 */
  confirmDisabled?: boolean

  /** 是否隐藏取消按钮 */
  hideCancel?: boolean

  // ==================== 高级属性 ====================

  /** 自定义类名 */
  customClass?: string

  /** 是否居中显示 */
  center?: boolean

  /** 打开时的动画方向 */
  direction?: DialogDirection

  /** 内容区最小高度（防止内容切换时高度闪烁） */
  minHeight?: string | number

  /** 自动记忆内容区最大高度（切换内容时保持稳定） */
  autoHeight?: boolean
}

/** StandardDialog Emits 接口 */
export interface StandardDialogEmits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm'): void
  (e: 'cancel'): void
  (e: 'close'): void
  (e: 'open'): void
}

/** StandardDialog Expose 接口 */
export interface StandardDialogExpose {
  open: () => void
  close: () => void
  getBodyElement: () => HTMLElement | null
}
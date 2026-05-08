/**
 * 表格通用格式化器工厂
 *
 * 提供常用的表格列格式化器，支持：
 * - 布尔值标签（是/否 + Element Plus Tag）
 * - 日期时间格式化（多时区支持）
 * - 数组标签（多对多关系显示）
 * - 状态标签（枚举映射）
 * - 操作按钮组
 *
 * @example
 * ```typescript
 * import {
 *   createBooleanTagFormatter,
 *   createDateTimeFormatter,
 *   createArrayTagFormatter,
 *   createStatusTagFormatter,
 *   createActionsFormatter
 * } from '@/components/common/table/formatters'
 *
 * // 布尔值标签
 * const isSuperUserCol = {
 *   field: 'is_superuser',
 *   title: '超级用户',
 *   formatter: createBooleanTagFormatter({ trueType: 'danger' })
 * }
 *
 * // 日期时间
 * const updatedAtCol = {
 *   field: 'updated_at',
 *   title: '更新时间',
 *   formatter: createDateTimeFormatter()
 * }
 *
 * // 数组标签
 * const rolesCol = {
 *   field: 'roles',
 *   title: '角色',
 *   slots: { default: createArrayTagFormatter({ labelField: 'name', emptyLabel: '无角色' }) }
 * }
 *
 * // 状态标签
 * const statusCol = {
 *   field: 'status',
 *   title: '状态',
 *   formatter: createStatusTagFormatter({
 *     active: { type: 'success', label: '启用' },
 *     inactive: { type: 'info', label: '禁用' }
 *   })
 * }
 * ```
 */

import { computed, defineComponent, h, nextTick, onMounted, onUnmounted, ref } from 'vue'
import type { PropType } from 'vue'
import { ElTag, ElPopconfirm, ElDropdown, ElDropdownMenu, ElDropdownItem, ElMessageBox } from 'element-plus'
import AppButton from '@/components/ui/AppButton.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { parseApiTime } from '@/utils/timezone'
import { useTimezoneStore } from '@/stores/timezone'
import { usePermission } from '@/composables/usePermission'
import type { ColumnFormatter, ColumnSlotRender, TableColumnConfig } from '@/components/ui/table/table.types'

// ============================================================================
// 布尔值格式化器
// ============================================================================

export interface BooleanTagFormatterOptions {
  /** 是标签文本 */
  trueLabel?: string
  /** 否标签文本 */
  falseLabel?: string
  /** true 时 Tag 类型 */
  trueType?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  /** false 时 Tag 类型 */
  falseType?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  /** Tag 尺寸 */
  size?: 'small' | 'default' | 'large'
}

/**
 * 创建布尔值标签格式化器
 *
 * @example
 * ```ts
 * // 简单用法
 * formatter: createBooleanTagFormatter()
 *
 * // 自定义
 * formatter: createBooleanTagFormatter({
 *   trueLabel: '启用',
 *   falseLabel: '禁用',
 *   trueType: 'success',
 *   falseType: 'info'
 * })
 * ```
 */
export function createBooleanTagFormatter(
  options: BooleanTagFormatterOptions = {}
): ColumnFormatter {
  const {
    trueLabel = '是',
    falseLabel = '否',
    trueType = 'success',
    falseType = 'info',
    size = 'small'
  } = options

  return (value: unknown) => {
    const isTrue = Boolean(value)
    return h(
      ElTag,
      {
        type: isTrue ? trueType : falseType,
        size
      },
      { default: () => isTrue ? trueLabel : falseLabel }
    )
  }
}

// ============================================================================
// 日期时间格式化器
// ============================================================================

export interface DateTimeFormatterOptions {
  /** 日期时间格式（默认 'yyyy-MM-dd HH:mm:ss'） */
  format?: string
  /** 是否显示为相对时间（如 "3 小时前"） */
  relative?: boolean
  /** 空值显示文本 */
  emptyLabel?: string
}

/**
 * 创建日期时间格式化器（多时区支持）
 *
 * @example
 * ```ts
 * // 默认用法
 * formatter: createDateTimeFormatter()
 *
 * // 自定义格式
 * formatter: createDateTimeFormatter({ format: 'yyyy/MM/dd HH:mm' })
 *
 * // 相对时间
 * formatter: createDateTimeFormatter({ relative: true })
 * ```
 */
export function createDateTimeFormatter(
  options: DateTimeFormatterOptions = {}
): ColumnFormatter {
  const {
    format = 'yyyy-MM-dd HH:mm:ss',
    relative = false,
    emptyLabel = '-'
  } = options

  return (value: unknown) => {
    if (!value) return emptyLabel

    try {
      const date = parseApiTime(String(value))
      const timezoneStore = useTimezoneStore()

      if (relative) {
        // 相对时间格式化：使用简单的相对时间逻辑
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMins / 60)
        const diffDays = Math.floor(diffHours / 24)

        if (diffMins < 1) return '刚刚'
        if (diffMins < 60) return `${diffMins}分钟前`
        if (diffHours < 24) return `${diffHours}小时前`
        if (diffDays < 30) return `${diffDays}天前`
        if (diffDays < 365) return `${Math.floor(diffDays / 30)}个月前`
        return `${Math.floor(diffDays / 365)}年前`
      }

      return timezoneStore.formatInCurrentTimezone(date, format)
    } catch {
      return emptyLabel
    }
  }
}

/**
 * 创建纯日期格式化器（不含时间）
 */
export function createDateFormatter(
  options: Omit<DateTimeFormatterOptions, 'format'> = {}
): ColumnFormatter {
  return createDateTimeFormatter({ ...options, format: 'yyyy-MM-dd' })
}

// ============================================================================
// 数组标签格式化器
// ============================================================================

export interface ArrayTagFormatterOptions<T = unknown> {
  /** 标签字段名 */
  labelField: string
  /** 空值显示文本 */
  emptyLabel?: string
  /** Tag 尺寸 */
  size?: 'small' | 'default' | 'large'
  /** Tag 类型（统一或按 item 映射） */
  tagType?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | ((item: T) => 'primary' | 'success' | 'warning' | 'danger' | 'info')
  /** 是否显示数量（超过 N 个后显示 "+N"） */
  maxVisible?: number
}

/**
 * 创建数组标签格式化器
 *
 * @example
 * ```ts
 * // 简单用法
 * slots: { default: createArrayTagFormatter({ labelField: 'name' }) }
 *
 * // 自定义
 * slots: { default: createArrayTagFormatter({
 *   labelField: 'name',
 *   emptyLabel: '无角色',
 *   size: 'small',
 *   maxVisible: 3
 * }) }
 * ```
 */
export function createArrayTagFormatter<T = unknown>(
  options: ArrayTagFormatterOptions<T>
): ColumnSlotRender {
  const {
    labelField,
    emptyLabel = '-',
    size = 'small',
    tagType = 'info',
    maxVisible
  } = options

  return ({ row, column }) => {
    const propertyKey = (column.property ?? column.field) as string | undefined
    const value = propertyKey ? row[propertyKey] : undefined

    if (!value || !Array.isArray(value) || value.length === 0) {
      return h('span', { class: 'text-muted' }, emptyLabel)
    }

    // 处理 maxVisible
    let displayItems = value
    let overflowCount = 0

    if (maxVisible && value.length > maxVisible) {
      displayItems = value.slice(0, maxVisible)
      overflowCount = value.length - maxVisible
    }

    const tagNodes = displayItems.map((item: T) => {
      const resolvedType = typeof tagType === 'function' ? tagType(item) : tagType
      const label = (item as Record<string, unknown>)[labelField] ?? item

      return h(
        ElTag,
        {
          key: String((item as Record<string, unknown>).id ?? item),
          type: resolvedType,
          size
        },
        { default: () => String(label) }
      )
    })

    // 添加溢出计数
    if (overflowCount > 0) {
      tagNodes.push(
        h(
          ElTag,
          {
            key: 'overflow',
            type: 'info',
            size
          },
          { default: () => `+${overflowCount}` }
        )
      )
    }

    return h('div', { class: 'flex gap-1 flex-wrap' }, tagNodes)
  }
}

// ============================================================================
// 状态标签格式化器
// ============================================================================

export interface StatusTagConfig {
  /** 标签文本 */
  label: string
  /** Tag 类型 */
  type: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  /** 是否显示圆点 */
  dot?: boolean
}

export type StatusTagMap = Record<string, string | StatusTagConfig>

export interface StatusTagFormatterOptions {
  /** 空值/未知状态显示文本 */
  emptyLabel?: string
  /** Tag 尺寸 */
  size?: 'small' | 'default' | 'large'
}

/**
 * 创建状态标签格式化器
 *
 * @example
 * ```ts
 * formatter: createStatusTagFormatter({
 *   active: { type: 'success', label: '启用' },
 *   inactive: { type: 'info', label: '禁用' },
 *   pending: { type: 'warning', label: '待审核' }
 * })
 *
 * // 简单形式（统一 type）
 * formatter: createStatusTagFormatter({
 *   active: '启用',
 *   inactive: '禁用'
 * })
 * ```
 */
export function createStatusTagFormatter(
  statusMap: StatusTagMap,
  options: StatusTagFormatterOptions = {}
): ColumnFormatter {
  const {
    emptyLabel = '-',
    size = 'small'
  } = options

  return (value: unknown) => {
    const config = statusMap[String(value)]
    if (!config) {
      return h('span', { class: 'text-muted' }, emptyLabel)
    }

    if (typeof config === 'string') {
      return h(ElTag, { type: 'info', size }, { default: () => config })
    }

    const { label, type, dot = false } = config

    if (dot) {
      return h('div', { class: 'flex items-center gap-1' }, [
        h('span', {
          class: 'inline-block w-2 h-2 rounded-full',
          style: {
            backgroundColor: `var(--el-color-${type}-light-3)`
          }
        }),
        h(ElTag, { type, size }, { default: () => label })
      ])
    }

    return h(ElTag, { type, size }, { default: () => label })
  }
}

// ============================================================================
// 操作按钮格式化器
// ============================================================================

/**
 * 操作按钮配置
 */
export interface ActionButtonConfig {
  /** 按钮文本（支持函数） */
  label: ActionValue<string>
  /** 按钮类型 */
  type?: ActionValue<'primary' | 'success' | 'warning' | 'danger' | 'info'>
  /** 按钮图标 */
  icon?: string
  /** 按钮提示文案 */
  tooltip?: ActionValue<string>
  /** 是否链接样式 */
  link?: boolean
  /** 按钮尺寸 */
  size?: 'small' | 'default' | 'large'
  /**
   * 操作优先级
   * - 'primary': 主要操作，直接显示（默认）
   * - 'secondary': 次要操作，收起到下拉菜单
   */
  priority?: 'primary' | 'secondary'
  /** 是否仅显示图标（用于空间紧张时的自适应） */
  iconOnly?: boolean
  /** 显示条件 */
  show?: ActionValue<boolean>
  /** 禁用条件 */
  disabled?: ActionValue<boolean>
  /** 加载中条件 */
  loading?: ActionValue<boolean>
  /** 权限码（如果提供则自动进行权限检查） */
  permission?: string
  /** 点击回调 */
  onClick: (row: Record<string, unknown>, index: number) => void | Promise<void>
  /** 确认框配置（如果提供则显示确认框） */
  popconfirm?: {
    title: ActionValue<string>
    confirmButtonText?: string
    cancelButtonText?: string
    confirmButtonType?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
    width?: number
  }
}

export interface ActionsFormatterOptions {
  /** 按钮间距，默认 4px */
  gap?: number
  /** 是否显示为块级 */
  block?: boolean
  /** 列宽（用于动态自适应布局） */
  colWidth?: number
}

/**
 * 解析可能为函数的配置值
 */
type ActionValue<T> = T | ((row: Record<string, unknown>, index: number) => T)

function resolveActionValue<T>(
  value: ActionValue<T> | undefined,
  row: Record<string, unknown>,
  index: number
): T | undefined {
  if (typeof value === 'function') {
    return (value as (row: Record<string, unknown>, index: number) => T)(row, index)
  }
  return value
}

/**
 * 解析布尔值配置
 */
function resolveActionBoolean(
  value: ActionValue<boolean> | undefined,
  row: Record<string, unknown>,
  index: number,
  fallback: boolean
): boolean {
  const resolved = resolveActionValue(value, row, index)
  return typeof resolved === 'boolean' ? resolved : fallback
}

/**
 * 渲染单个操作按钮
 */
function renderActionButton(
  button: ActionButtonConfig,
  row: Record<string, unknown>,
  index: number,
  options: { isDropdownItem?: boolean } = {}
): ReturnType<typeof h> {
  const label = resolveActionValue(button.label, row, index) ?? ''
  const disabled = resolveActionBoolean(button.disabled, row, index, false)
  const loading = resolveActionBoolean(button.loading, row, index, false)
  const type = resolveActionValue(button.type, row, index) ?? 'primary'
  const tooltip = resolveActionValue(button.tooltip, row, index)
  const { isDropdownItem = false } = options

  // 下拉菜单项渲染
  if (isDropdownItem) {
    // 下拉菜单项需要确认时，使用 ElMessageBox.confirm
    const handleClick = () => {
      if (button.popconfirm) {
        const confirmType = button.popconfirm.confirmButtonType ?? 'warning'
        // 映射 type：danger -> error, primary -> warning
        const messageType: '' | 'success' | 'warning' | 'info' | 'error' =
          confirmType === 'danger' ? 'error' :
          confirmType === 'primary' ? 'warning' :
          confirmType === 'success' ? 'success' :
          confirmType === 'info' ? 'info' :
          'warning'

        ElMessageBox.confirm(
          resolveActionValue(button.popconfirm.title, row, index) ?? '确认执行此操作？',
          '提示',
          {
            confirmButtonText: button.popconfirm.confirmButtonText ?? '确认',
            cancelButtonText: button.popconfirm.cancelButtonText ?? '取消',
            type: messageType,
            closeOnClickModal: false
          }
        )
          .then(() => {
            button.onClick(row, index)
          })
          .catch(() => {
            // 用户取消，不做任何处理
          })
      } else {
        button.onClick(row, index)
      }
    }

    // 下拉菜单项：危险操作用红色文字
    const itemClass = type === 'danger' ? 'action-dropdown-item--danger' : ''

    return h(
      ElDropdownItem,
      {
        disabled,
        onClick: handleClick,
        class: itemClass
      },
      {
        default: () => [
          button.icon ? h(
            'span',
            { class: 'action-dropdown-item__icon' },
            [h(AppIcon, { icon: button.icon, size: 14 })]
          ) : null,
          String(label)
        ]
      }
    )
  }

  // 直接显示的按钮：统一使用 link 样式，通过 type 色调区分
  // iconOnly 模式：隐藏文本，仅保留图标
  const isIconOnly = button.iconOnly === true && !!button.icon
  const buttonNode = h(
    AppButton,
    {
      type,
      size: button.size ?? 'small',
      icon: button.icon,
      tooltip: isIconOnly ? (tooltip ?? label) : tooltip,
      link: true,
      text: isIconOnly,
      disabled,
      loading,
      preserveIconSpace: true,
      onClick: button.popconfirm ? undefined : () => button.onClick(row, index)
    },
    isIconOnly ? undefined : { default: () => String(label) }
  )

  if (!button.popconfirm) {
    return buttonNode
  }

  return h(
    ElPopconfirm,
    {
      title: resolveActionValue(button.popconfirm.title, row, index),
      confirmButtonText: button.popconfirm.confirmButtonText,
      cancelButtonText: button.popconfirm.cancelButtonText,
      confirmButtonType: button.popconfirm.confirmButtonType,
      width: button.popconfirm.width,
      onConfirm: () => button.onClick(row, index)
    },
    {
      reference: () => buttonNode
    }
  )
}

// ============================================================================
// 操作按钮单元格组件（动态自适应布局）
// ============================================================================

const DROPDOWN_TRIGGER_WIDTH = 48
// Element Plus 表格单元格默认 padding 左右各 12px
const CELL_HORIZONTAL_PADDING = 24
const DEFAULT_GAP = 4

/**
 * 操作按钮单元格组件
 *
 * 根据列宽动态决定按钮显示模式：
 * 1. 空间充足 → 全部 icon+text 平铺
 * 2. 空间紧张 → 有图标的按钮变为 icon-only
 * 3. 空间不足 → 超出按钮收入"更多"下拉
 *
 * 首帧使用 visibility: hidden 防止闪动，测量完成后立即展示最终布局。
 */
const ActionsCell = defineComponent({
  name: 'ActionsCell',
  props: {
    buttons: { type: Array as PropType<ActionButtonConfig[]>, required: true },
    colWidth: { type: Number, default: 0 },
    gap: { type: Number, default: DEFAULT_GAP },
    block: { type: Boolean, default: false },
    row: { type: Object as PropType<Record<string, unknown>>, required: true },
    index: { type: Number, required: true }
  },
  setup(props) {
    const { hasPermission } = usePermission()
    const containerRef = ref<HTMLElement | null>(null)
    const buttonRefs = ref<HTMLElement[]>([])
    const buttonWidths = ref<number[]>([])
    const layoutReady = ref(false)
    const containerWidth = ref(0)
    const widthObserved = ref(false)

    // 过滤可见按钮
    const visibleButtons = computed(() =>
      props.buttons.filter(
        button =>
          (!button.permission || hasPermission(button.permission)) &&
          resolveActionBoolean(button.show, props.row, props.index, true)
      )
    )

    // 测量阶段：渲染全部按钮到隐藏容器，记录宽度
    async function measureButtons(): Promise<void> {
      await nextTick()
      const widths = buttonRefs.value
        .filter(el => el !== null)
        .map(el => el.offsetWidth)
      buttonWidths.value = widths
    }

    // 布局计算：基于容器宽度和按钮宽度决定显示模式
    const layoutResult = computed(() => {
      const btns = visibleButtons.value
      const widths = buttonWidths.value

      if (btns.length === 0 || widths.length !== btns.length) {
        return { mode: 'none', displayButtons: [], dropdownButtons: [] } as const
      }

      // 列宽来源有两种：
      // 1. props.colWidth：页面配置的初始值（border-box），需要减去单元格 padding
      // 2. containerWidth：ResizeObserver 读取的实际渲染宽度（content-box），已经是可用宽度
      const fallbackWidth = 200
      const effectiveWidth = widthObserved.value
        ? containerWidth.value
        : (props.colWidth || fallbackWidth)
      const availableWidth = widthObserved.value
        ? effectiveWidth
        : effectiveWidth - CELL_HORIZONTAL_PADDING

      // === 第一步：尝试全部 icon+text ===
      const inlineTotal = widths.reduce((s, w) => s + w, 0) + (btns.length - 1) * props.gap
      if (inlineTotal <= availableWidth) {
        return {
          mode: 'inline',
          displayButtons: btns.map(b => ({ ...b, iconOnly: false })),
          dropdownButtons: []
        } as const
      }

      // === 第二步：逐按钮降级（icon+text → icon-only），直到放下 ===
      // 从后往前逐个压缩，累积节省的宽度
      let totalSavings = 0
      let downgradeCount = 0

      for (let i = btns.length - 1; i >= 0; i--) {
        const btn = btns[i]
        if (!btn.icon) continue
        totalSavings += widths[i] - 32
        if (inlineTotal - totalSavings <= availableWidth) {
          downgradeCount = btns.length - i
          break
        }
      }

      if (downgradeCount > 0) {
        // 部分按钮降级成功，无需下拉
        const displayButtons = btns.map((b, i) => ({
          ...b,
          iconOnly: i >= btns.length - downgradeCount && !!b.icon
        }))
        return {
          mode: 'mixed',
          displayButtons,
          dropdownButtons: []
        } as const
      }

      // === 第三步：即使全部 icon-only 也放不下 → 使用"更多"下拉 ===
      const displayButtons: (ActionButtonConfig & { iconOnly?: boolean })[] = []
      const dropdownButtons: ActionButtonConfig[] = []
      // 第一个按钮前面无 gap，从第二个开始每个按钮多一个 gap
      let displayWidth = -props.gap

      for (let i = 0; i < btns.length; i++) {
        const btn = btns[i]
        const btnWidth = btn.icon ? 32 : widths[i]
        displayWidth += btnWidth + props.gap

        if (displayWidth + DROPDOWN_TRIGGER_WIDTH <= availableWidth) {
          displayButtons.push({ ...btn, iconOnly: !!btn.icon })
        } else {
          dropdownButtons.push(btn)
        }
      }

      // 下拉中只有一个按钮 → 弹出显示，避免单按钮触发"更多"
      if (dropdownButtons.length === 1) {
        const lastBtn = dropdownButtons.pop()!
        displayButtons.push({ ...lastBtn, iconOnly: !!lastBtn.icon })
      }

      return { mode: 'dropdown', displayButtons, dropdownButtons } as const
    })

    let resizeObserver: ResizeObserver | null = null
    let rafId: number | null = null

    onMounted(async () => {
      // 首帧隐藏，测量按钮宽度
      await measureButtons()

      // 首帧使用 props.colWidth 作为列宽参考值
      // 用户拖拽列宽后由 ResizeObserver 更新为真实宽度
      if (props.colWidth > 0) {
        containerWidth.value = props.colWidth
      }

      // 切换为最终可见容器
      layoutReady.value = true

      // 等待 DOM 切换到最终容器后再绑定 ResizeObserver
      await nextTick()
      if (!containerRef.value) return

      resizeObserver = new ResizeObserver(entries => {
        if (rafId !== null) cancelAnimationFrame(rafId)
        rafId = requestAnimationFrame(() => {
          const entry = entries[0]
          if (entry) {
            containerWidth.value = Math.round(entry.contentRect.width)
            widthObserved.value = true
          }
          rafId = null
        })
      })
      resizeObserver.observe(containerRef.value)
    })

    onUnmounted(() => {
      resizeObserver?.disconnect()
      if (rafId !== null) cancelAnimationFrame(rafId)
    })

    return () => {
      const btns = visibleButtons.value

      // 无可见按钮
      if (btns.length === 0) {
        return h('span', { class: 'text-muted' }, '-')
      }

      // 测量阶段：渲染隐藏容器用于测量
      if (!layoutReady.value) {
        return h(
          'div',
          {
            ref: containerRef,
            style: { visibility: 'hidden', position: 'absolute', whiteSpace: 'nowrap' },
            class: 'flex items-center gap-1'
          },
          btns.map((button, i) =>
            h('span', { ref: el => { if (el instanceof HTMLElement) buttonRefs.value[i] = el } }, [
              renderActionButton(button, props.row, props.index)
            ])
          )
        )
      }

      // 最终渲染：基于布局结果渲染
      const layout = layoutResult.value
      const containerClass = props.block
        ? 'flex flex-col gap-1 items-center'
        : 'flex items-center gap-1'

      const displayNodes = layout.displayButtons.map((button, i) =>
        h('span', { ref: el => { if (el instanceof HTMLElement) buttonRefs.value[i] = el } }, [
          renderActionButton(button, props.row, props.index)
        ])
      )

      // "更多"下拉触发器
      const dropdownNode =
        layout.dropdownButtons.length > 0
          ? h(
              ElDropdown,
              { trigger: 'click', placement: 'bottom-end' },
              {
                default: () =>
                  h('span', { class: 'action-more-trigger' }, [
                    h('span', { class: 'action-more-trigger__text' }, '更多'),
                    h('i', { class: 'i-ep-arrow-down action-more-trigger__arrow' })
                  ]),
                dropdown: () =>
                  h(
                    ElDropdownMenu,
                    { class: 'action-dropdown-menu' },
                    {
                      default: () =>
                        layout.dropdownButtons.map(button =>
                          renderActionButton(button, props.row, props.index, { isDropdownItem: true })
                        )
                    }
                  )
              }
            )
          : null

      const allNodes = [...displayNodes, dropdownNode].filter(Boolean)

      return h(
        'div',
        {
          ref: containerRef,
          class: containerClass,
          style: { gap: `${props.gap}px`, width: '100%', overflow: 'hidden' }
        },
        allNodes
      )
    }
  }
})

/**
 * 创建操作按钮组格式化器（支持列宽自适应）
 *
 * @example
 * ```ts
 * slots: { default: createActionsFormatter([
 *   {
 *     label: '编辑',
 *     type: 'primary',
 *     icon: 'lucide:edit',
 *     tooltip: '编辑',
 *     onClick: (row) => handleEdit(row)
 *   }
 * ], { colWidth: 200 }) }
 * ```
 */
export function createActionsFormatter(
  buttons: ActionButtonConfig[],
  options: ActionsFormatterOptions = {}
): ColumnSlotRender {
  const {
    gap = DEFAULT_GAP,
    block = false,
    colWidth
  } = options

  return ({ row, $index }) =>
    h(ActionsCell, { buttons, gap, block, colWidth, row, index: $index })
}

// ============================================================================
// 工具函数：构建操作列
// ============================================================================

export type BuildActionsColumnOptions = Pick<
  TableColumnConfig,
  'field' | 'title' | 'width' | 'minWidth' | 'fixed' | 'reorderLocked' | 'hideable'
>

/**
 * 构建操作列配置
 *
 * @example
 * ```ts
 * const actionsCol = buildActionsColumn([
 *   { label: '编辑', type: 'primary', onClick: handleEdit },
 *   { label: '删除', type: 'danger', popconfirm: { title: '确认？' }, onClick: handleDelete }
 * ], {
 *   width: 200,
 *   fixed: 'right'
 * })
 * ```
 */
export function buildActionsColumn(
  buttons: ActionButtonConfig[],
  options: BuildActionsColumnOptions = {}
): TableColumnConfig {
  const {
    field = '__actions__',
    title = '操作',
    width,
    minWidth,
    fixed = 'right',
    reorderLocked = true,
    hideable = false
  } = options

  // 同时设置 width 和 minWidth：
  // - width 控制初始宽度（页面配置的 width 或兜底 200）
  // - minWidth 限制拖拽下限（页面配置的 minWidth 或兜底 88）
  const effectiveWidth = width ?? 200
  const effectiveMinWidth = minWidth ?? 88

  return {
    field,
    title,
    slots: { default: createActionsFormatter(buttons, { colWidth: effectiveWidth }) },
    align: 'center',
    width: effectiveWidth,
    minWidth: effectiveMinWidth,
    className: 'actions-column',
    fixed,
    reorderLocked,
    hideable,
    configurable: false
  }
}

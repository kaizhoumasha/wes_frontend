import { ref, computed, provide, inject, type InjectionKey, type Ref, type ComputedRef } from 'vue'
import { BREAKPOINTS } from '@/constants/breakpoints'
import { useEventListener } from '@vueuse/core'

/**
 * 断点类型定义
 */
export type Breakpoint = 'mobile' | 'tablet' | 'desktop'

/**
 * 断点上下文接口
 */
export interface BreakpointContext {
  /** 当前窗口宽度 */
  width: Readonly<Ref<number>>
  /** 当前断点类型 */
  current: ComputedRef<Breakpoint>
  /** 是否匹配指定断点 */
  matches: (breakpoint: Breakpoint) => ComputedRef<boolean>
  /** 是否匹配断点范围 */
  matchesRange: (min: Breakpoint, max: Breakpoint) => ComputedRef<boolean>
}

/**
 * 断点上下文注入键
 */
export const BREAKPOINT_KEY: InjectionKey<BreakpointContext> = Symbol('breakpoint')

/**
 * 提供断点上下文（通常在根组件或布局组件中使用）
 *
 * @example
 * ```vue
 * <script setup>
 * import { provideBreakpointContext } from '@/composables/useBreakpointContext'
 *
 * provideBreakpointContext()
 * </script>
 * ```
 */
export function provideBreakpointContext(): BreakpointContext {
  const width = ref(window.innerWidth)

  // 监听窗口大小变化
  useEventListener(window, 'resize', () => {
    width.value = window.innerWidth
  })

  // 计算当前断点
  const current = computed((): Breakpoint => {
    if (width.value < BREAKPOINTS.MOBILE) return 'mobile'
    if (width.value < BREAKPOINTS.DESKTOP) return 'tablet'
    return 'desktop'
  })

  // 判断是否匹配指定断点
  const matches = (breakpoint: Breakpoint): ComputedRef<boolean> => {
    return computed(() => current.value === breakpoint)
  }

  // 判断是否匹配断点范围
  const matchesRange = (min: Breakpoint, max: Breakpoint): ComputedRef<boolean> => {
    return computed(() => {
      const breakpointOrder: Breakpoint[] = ['mobile', 'tablet', 'desktop']
      const currentIndex = breakpointOrder.indexOf(current.value)
      const minIndex = breakpointOrder.indexOf(min)
      const maxIndex = breakpointOrder.indexOf(max)
      return currentIndex >= minIndex && currentIndex <= maxIndex
    })
  }

  const context: BreakpointContext = {
    width: width as Readonly<Ref<number>>,
    current,
    matches,
    matchesRange
  }

  provide(BREAKPOINT_KEY, context)

  return context
}

/**
 * 使用断点上下文（在子组件中使用）
 *
 * @example
 * ```vue
 * <script setup>
 * import { useBreakpoint } from '@/composables/useBreakpointContext'
 *
 * const { current, width, matches } = useBreakpoint()
 *
 * const isMobile = matches('mobile')
 * const isTabletOrDesktop = matchesRange('tablet', 'desktop')
 * </script>
 *
 * <template>
 *   <div v-if="isMobile">移动端布局</div>
 *   <div v-else>桌面端布局</div>
 * </template>
 * ```
 *
 * @throws {Error} 如果未找到断点上下文
 */
export function useBreakpoint(): BreakpointContext {
  const context = inject(BREAKPOINT_KEY)

  if (!context) {
    throw new Error(
      'Breakpoint context not found. ' +
      'Make sure to call provideBreakpointContext() in a parent component. ' +
      'Typically this should be called in CrudPageLayout or the root layout component.'
    )
  }

  return context
}

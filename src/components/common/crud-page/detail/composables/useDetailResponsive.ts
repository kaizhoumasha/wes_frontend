/**
 * CRUD Detail Panel Responsive Adaptation
 *
 * @module crud-page/detail/composables/useDetailResponsive
 *
 * Handles responsive behavior for detail panel:
 * - Drawer vs Dialog mode switching
 * - Width calculation based on viewport
 * - Mobile-specific features
 */

import { computed } from 'vue'
import { useResponsiveLayout } from '@/composables/useResponsiveLayout'
import { DETAIL_WIDTH, type CrudPageDetailConfig } from '../types'
import type { CrudPageEntity } from '../../types'

/**
 * Responsive mode type
 */
export type DetailResponsiveMode = 'drawer' | 'dialog' | 'fullScreen'

/**
 * Responsive adaptation composable for detail panel
 * @template TItem - Entity type
 */
export function useDetailResponsive<TItem extends CrudPageEntity>(
  config: CrudPageDetailConfig<TItem> | undefined
) {
  const { isMobile, isTablet } = useResponsiveLayout()

  /**
   * Resolve display mode based on viewport and config
   */
  const resolvedMode = computed<DetailResponsiveMode>(() => {
    // Explicit mode override
    const configMode = config?.mode

    // Mobile: use responsive config or default to fullscreen
    if (isMobile.value) {
      const mobileMode = config?.responsive?.mobile?.mode ?? 'fullScreen'
      // Map 'bottomSheet' to dialog (not supported by Element Plus)
      return mobileMode === 'bottomSheet' ? 'fullScreen' : mobileMode
    }

    // Tablet/Desktop: use drawer unless explicitly set to dialog
    if (configMode === 'dialog') {
      return 'dialog'
    }

    return 'drawer'
  })

  /**
   * Resolve panel width based on viewport and config
   */
  const resolvedWidth = computed<number | string>(() => {
    // Explicit width override
    if (config?.width !== undefined) {
      return config.width
    }

    // Responsive width from config
    if (isMobile.value) {
      return DETAIL_WIDTH.mobile
    }

    if (isTablet.value) {
      return config?.responsive?.tablet?.width ?? DETAIL_WIDTH.tablet
    }

    return DETAIL_WIDTH.desktop
  })

  /**
   * Whether to use fullscreen dialog
   */
  const isFullscreen = computed(() => {
    return resolvedMode.value === 'fullScreen' || (isMobile.value && resolvedMode.value === 'dialog')
  })

  return {
    isMobile,
    resolvedMode,
    resolvedWidth,
    isFullscreen
  }
}

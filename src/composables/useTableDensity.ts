/**
 * 表格密度状态管理 Composable
 *
 * 提供表格密度切换功能，支持 localStorage 持久化
 *
 * @example
 * ```ts
 * const { density, setDensity, cycleDensity } = useTableDensity()
 *
 * // 设置密度
 * setDensity('comfortable')
 *
 * // 循环切换密度
 * cycleDensity()
 * ```
 */

import { ref, watch } from 'vue'
import type { TableDensity } from '@/types/table'
import { DEFAULT_DENSITY, DENSITY_CONFIG } from '@/types/table'

const STORAGE_KEY = 'table-density'

/**
 * 从 localStorage 读取密度设置
 */
function loadDensity(): TableDensity {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && stored in DENSITY_CONFIG) {
      return stored as TableDensity
    }
  } catch (error) {
    console.warn('Failed to load table density from localStorage:', error)
  }
  return DEFAULT_DENSITY
}

/**
 * 表格密度状态管理
 */
export function useTableDensity() {
  /**
   * 当前表格密度
   */
  const density = ref<TableDensity>(loadDensity())

  /**
   * 设置表格密度
   */
  function setDensity(newDensity: TableDensity) {
    density.value = newDensity
  }

  /**
   * 循环切换密度
   *
   * 按顺序：comfortable → compact → small → comfortable
   */
  function cycleDensity() {
    const densities: TableDensity[] = ['comfortable', 'compact', 'small']
    const currentIndex = densities.indexOf(density.value)
    const nextIndex = (currentIndex + 1) % densities.length
    density.value = densities[nextIndex]
  }

  // 持久化到 localStorage
  watch(
    density,
    (newDensity) => {
      try {
        localStorage.setItem(STORAGE_KEY, newDensity)
      } catch (error) {
        console.warn('Failed to save table density to localStorage:', error)
      }
    },
    { immediate: false }
  )

  return {
    density,
    setDensity,
    cycleDensity
  }
}

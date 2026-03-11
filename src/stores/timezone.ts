/**
 * 时区设置 Store
 *
 * 支持多时区部署场景：
 * - 用户可以选择自己的时区
 * - 可选使用浏览器自动检测
 * - 持久化到 LocalStorage
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { formatInTimezone } from '@/utils/timezone'

export const useTimezoneStore = defineStore(
  'timezone',
  () => {
    // ==================== 状态 ====================

    /**
     * 用户选择的时区（如 'Asia/Shanghai', 'America/New_York'）
     */
    const userTimezone = ref<string | null>(null)

    /**
     * 是否使用浏览器时区（自动检测）
     */
    const useBrowserTimezone = ref(false)

    /**
     * 服务器/应用默认时区（与后端 DATETIME_TIMEZONE 对齐）
     */
    const APP_TIMEZONE = 'Asia/Shanghai'

    // ==================== 计算属性 ====================

    /**
     * 浏览器本地时区
     */
    const browserTimezone = ref(
      Intl.DateTimeFormat().resolvedOptions().timeZone
    )

    /**
     * 当前有效时区（优先级: 用户 > 浏览器 > 应用默认）
     */
    const currentTimezone = computed(() => {
      if (useBrowserTimezone.value) {
        return browserTimezone.value
      }
      return userTimezone.value || APP_TIMEZONE
    })

    /**
     * 时区显示名称（用于 UI 显示）
     */
    const timezoneDisplayName = computed(() => {
      const tz = currentTimezone.value
      if (tz === APP_TIMEZONE) {
        return `服务器时区 (${tz})`
      }
      if (useBrowserTimezone.value) {
        return `浏览器时区 (${tz})`
      }
      return tz
    })

    // ==================== 操作 ====================

    /**
     * 设置用户时区
     */
    function setUserTimezone(timezone: string) {
      userTimezone.value = timezone
      useBrowserTimezone.value = false
    }

    /**
     * 启用浏览器时区自动检测
     */
    function enableBrowserTimezone() {
      useBrowserTimezone.value = true
    }

    /**
     * 重置为应用默认时区
     */
    function resetToAppTimezone() {
      userTimezone.value = null
      useBrowserTimezone.value = false
    }

    /**
     * 格式化时间为当前有效时区
     *
     * @param date - Date 对象
     * @param formatStr - 格式字符串
     * @returns 当前时区的格式化时间
     */
    function formatInCurrentTimezone(
      date: Date,
      formatStr: string = 'yyyy-MM-dd HH:mm:ss'
    ): string {
      // 委托给 utils/timezone.ts 的 formatInTimezone 函数
      // 避免重复实现，确保格式化逻辑一致
      return formatInTimezone(date, currentTimezone.value, formatStr)
    }

    // ==================== 持久化配置 ====================

    return {
      // 状态
      userTimezone,
      useBrowserTimezone,
      browserTimezone,
      // 计算属性
      APP_TIMEZONE,
      currentTimezone,
      timezoneDisplayName,
      // 操作
      setUserTimezone,
      enableBrowserTimezone,
      resetToAppTimezone,
      formatInCurrentTimezone
    }
  },
  {
    // 持久化配置（使用 pinia-plugin-persistedstate）
    persist: {
      key: 'wes-timezone-store',
      storage: localStorage
    }
  }
)

// ==================== 时区常量 ====================

/**
 * 常用时区列表（用于时区选择器）
 */
export const COMMON_TIMEZONES = [
  {
    value: 'Asia/Shanghai',
    label: '中国标准时间 (北京/上海)',
    offset: 'UTC+8'
  },
  {
    value: 'Asia/Taipei',
    label: '台湾标准时间 (台北)',
    offset: 'UTC+8'
  },
  {
    value: 'Asia/Hong_Kong',
    label: '香港时间',
    offset: 'UTC+8'
  },
  {
    value: 'Asia/Tokyo',
    label: '日本标准时间 (东京)',
    offset: 'UTC+9'
  },
  {
    value: 'Asia/Seoul',
    label: '韩国标准时间 (首尔)',
    offset: 'UTC+9'
  },
  {
    value: 'Asia/Singapore',
    label: '新加坡时间',
    offset: 'UTC+8'
  },
  {
    value: 'America/New_York',
    label: '美国东部时间 (纽约)',
    offset: 'UTC-5/-4'
  },
  {
    value: 'America/Chicago',
    label: '美国中部时间 (芝加哥)',
    offset: 'UTC-6/-5'
  },
  {
    value: 'America/Denver',
    label: '美国山地时间 (丹佛)',
    offset: 'UTC-7/-6'
  },
  {
    value: 'America/Los_Angeles',
    label: '美国太平洋时间 (洛杉矶)',
    offset: 'UTC-8/-7'
  },
  {
    value: 'America/Phoenix',
    label: '美国山地时间 (凤凰城，无夏令时)',
    offset: 'UTC-7'
  },
  {
    value: 'Europe/London',
    label: '英国时间 (伦敦)',
    offset: 'UTC+0/+1'
  },
  {
    value: 'Europe/Paris',
    label: '中欧时间 (巴黎/柏林)',
    offset: 'UTC+1/+2'
  },
  {
    value: 'Europe/Moscow',
    label: '莫斯科时间',
    offset: 'UTC+3'
  },
  {
    value: 'Australia/Sydney',
    label: '澳大利亚东部时间 (悉尼)',
    offset: 'UTC+10/+11'
  },
  {
    value: 'Pacific/Auckland',
    label: '新西兰时间 (奥克兰)',
    offset: 'UTC+12/+13'
  },
  {
    value: 'UTC',
    label: '协调世界时 (UTC)',
    offset: 'UTC+0'
  }
]

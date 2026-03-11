# WES 前端时区处理指南

> **项目**: P9 WES 前端项目
> **版本**: 1.0
> **创建日期**: 2026-03-04
> **后端对应**: `/Users/kaizhou/SynologyDrive/works/wes_backend/src/utils/timezone.py`

---

## 目录

- [1. 概述](#1-概述)
- [2. 后端时区方案](#2-后端时区方案)
- [3. 前端时区方案](#3-前端时区方案)
- [4. 使用指南](#4-使用指南)
- [5. 组件集成](#5-组件集成)
- [6. 常见问题](#6-常见问题)
- [7. 最佳实践](#7-最佳实践)

---

## 1. 概述

### 1.1 为什么需要时区处理？

WES 系统是一个仓储执行控制系统，可能部署在全球不同地区。为了确保时间数据的一致性和准确性，需要统一的时区处理方案。

**常见时区问题**：

- ❌ 用户在 Asia/Shanghai 看到的时间与数据库存储不一致
- ❌ 跨时区部署时，时间显示混乱
- ❌ 夏令时切换导致时间计算错误
- ❌ 前后端时间格式不匹配

### 1.2 设计原则

| 原则         | 说明                                 |
| ------------ | ------------------------------------ |
| **统一存储** | 数据库统一使用 UTC 时间存储          |
| **明确传输** | API 传输使用 ISO 8601 格式，明确时区 |
| **本地显示** | 前端显示时转换为用户本地时区         |
| **无损转换** | 避免时间精度丢失                     |

### 1.3 时区数据流

```
┌─────────────────────────────────────────────────────────────────┐
│                        数据流转过程                              │
└─────────────────────────────────────────────────────────────────┘

数据库 (PostgreSQL)
┌─────────────────────────────────────────────────────────────────┐
│ created_at TIMESTAMP WITHOUT TIME ZONE                          │
│ 值: 2024-01-01 12:00:00  ← naive datetime，默认 UTC             │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼ 后端序列化
API 响应 (FastAPI)
┌─────────────────────────────────────────────────────────────────┐
│ "created_at": "2024-01-01T12:00:00Z"  ← ISO 8601, 明确 UTC     │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼ HTTP 传输
前端接收 (Vue 3)
┌─────────────────────────────────────────────────────────────────┐
│ parseApiTime("2024-01-01T12:00:00Z")  → Date 对象              │
│ 内部: UTC timestamp (1704067200000)                            │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼ 显示转换
用户界面
┌─────────────────────────────────────────────────────────────────┐
│ formatAppTime(date) → "2024-01-01 20:00:00" (Asia/Shanghai)   │
└─────────────────────────────────────────────────────────────────┘

反向流程（表单提交）
用户界面 → formatLocalTime → toApiTime → API → 后端 → 数据库
```

---

## 2. 后端时区方案

### 2.1 后端时区工具

后端使用 `src/utils/timezone.py` 提供时区处理能力：

```python
# 后端时区工具
from src.utils.timezone import timezone

# 1. 数据库存储：naive UTC datetime
timezone.now_for_db()
# 返回: datetime(2024, 1, 1, 12, 0, 0) - naive

# 2. API 响应：aware UTC datetime（ISO 8601）
timezone.now_utc().isoformat()
# 返回: "2024-01-01T12:00:00+00:00"

# 或简化格式（推荐）
timezone.now_utc().isoformat().replace("+00:00", "Z")
# 返回: "2024-01-01T12:00:00Z"

# 3. 应用本地时区
timezone.now()
# 返回: Asia/Shanghai 时区的 aware datetime
```

### 2.2 后端配置

```python
# src/core/conf.py
class Settings(BaseSettings):
    # 应用时区配置
    DATETIME_TIMEZONE: str = "Asia/Shanghai"

    # 日期时间格式
    DATETIME_FORMAT: str = "%Y-%m-%d %H:%M:%S"
    DATE_FORMAT: str = "%Y-%m-%d"
```

### 2.3 后端响应格式

```python
# 统一响应格式
{
    "code": 1000,
    "message": "success",
    "data": {
        "id": 1,
        "name": "Device-001",
        "created_at": "2024-01-01T12:00:00Z",  # ISO 8601 UTC
        "updated_at": "2024-01-01T12:00:00Z"
    },
    "timestamp": "2024-01-01T12:00:00Z"
}
```

---

## 3. 前端时区方案

### 3.1 核心工具库

```typescript
// src/utils/timezone.ts
/**
 * 时区工具模块
 *
 * 与后端 timezone.py 对齐的时区处理方案
 *
 * 后端方案:
 * - 存储: naive UTC datetime (TIMESTAMP WITHOUT TIME ZONE)
 * - API响应: aware UTC datetime (ISO 8601: "2024-01-01T12:00:00Z")
 * - 应用时区: Asia/Shanghai (可配置)
 *
 * 前端方案:
 * - 接收: 解析后端 ISO 8601 格式 (aware UTC)
 * - 显示: 转换为用户本地时区 (Asia/Shanghai 或浏览器时区)
 * - 提交: 转换为 aware UTC datetime
 * - 防御性处理: 自动处理缺少时区标识符的时间字符串
 */

import { format, fromZonedTime, toZonedTime } from 'date-fns-tz'
import { format as formatFn, parseISO, isValid } from 'date-fns'

/**
 * 应用时区配置（与后端 DATETIME_TIMEZONE 对齐）
 */
export const APP_TIMEZONE = 'Asia/Shanghai'

/**
 * 浏览器本地时区
 */
export const BROWSER_TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone

/**
 * 解析后端 API 返回的时间字符串
 *
 * 后端标准格式: "2024-01-01T12:00:00Z" 或 "2024-01-01T12:00:00+00:00"
 * 兼容格式: "2024-01-01T12:00:00.123456" (自动视为 UTC)
 *
 * 防御性处理:
 * - 如果时间字符串缺少时区标识符，自动添加 'Z' (UTC)
 * - 这是为了兼容后端可能返回的 naive datetime 格式
 *
 * @param isoString - 后端返回的 ISO 8601 时间字符串
 * @returns Date 对象（内部使用 UTC timestamp）
 * @throws {Error} 如果解析失败
 *
 * @example
 * parseApiTime("2024-01-01T12:00:00Z") // → Date 对象
 * parseApiTime("2024-01-01T12:00:00.123456") // → Date 对象 (自动视为 UTC)
 */
export function parseApiTime(isoString: string): Date {
  // 防御性处理：如果时间字符串不包含时区标识符，自动添加 'Z' (UTC)
  let normalizedString = isoString.trim()

  // 检查是否已经有时区标识符
  const hasTimezone =
    normalizedString.endsWith('Z') ||
    normalizedString.includes('+') ||
    normalizedString.includes('-', 10) // 避免匹配日期中的 '-'

  if (!hasTimezone) {
    // 没有时区标识符，默认视为 UTC 时间
    normalizedString = normalizedString + 'Z'
    console.debug(`[parseApiTime] 添加 UTC 标识符: ${isoString} → ${normalizedString}`)
  }

  const date = new Date(normalizedString)
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid API time format: ${isoString}`)
  }
  return date
}

/**
 * 格式化时间为应用时区字符串（用于显示）
 *
 * 示例: "2024-01-01 20:00:00" (Asia/Shanghai)
 *
 * @param date - Date 对象（从 parseApiTime 解析得到）
 * @param formatStr - 格式字符串，默认 "yyyy-MM-dd HH:mm:ss"
 * @returns 应用时区的格式化时间字符串
 *
 * @example
 * const date = parseApiTime("2024-01-01T12:00:00Z")
 * formatAppTime(date) // "2024-01-01 20:00:00"
 */
export function formatAppTime(date: Date, formatStr: string = 'yyyy-MM-dd HH:mm:ss'): string {
  return formatFn(date, formatStr, {
    timeZone: APP_TIMEZONE
  })
}

/**
 * 格式化时间为浏览器本地时区字符串（用于显示）
 *
 * 示例: "2024-01-01 20:00:00" (浏览器本地时区)
 *
 * @param date - Date 对象
 * @param formatStr - 格式字符串
 * @returns 浏览器本地时区的格式化时间字符串
 *
 * @example
 * formatLocalTime(date) // 浏览器本地时区的时间
 */
export function formatLocalTime(date: Date, formatStr: string = 'yyyy-MM-dd HH:mm:ss'): string {
  return formatFn(date, formatStr, {
    timeZone: BROWSER_TIMEZONE
  })
}

/**
 * 将应用时区时间转换为 UTC ISO 8601 字符串（用于提交给后端）
 *
 * 场景: 用户在表单中选择本地时间 "2024-01-01 20:00:00" (Asia/Shanghai)
 *       需要转换为 "2024-01-01T12:00:00Z" 提交给后端
 *
 * @param localDateTime - 应用时区的本地时间字符串 "2024-01-01 20:00:00"
 * @param formatStr - 输入格式，默认 "yyyy-MM-dd HH:mm:ss"
 * @returns ISO 8601 UTC 字符串 "2024-01-01T12:00:00Z"
 *
 * @example
 * toApiTime("2024-01-01 20:00:00") // "2024-01-01T12:00:00Z"
 */
export function toApiTime(
  localDateTime: string,
  formatStr: string = 'yyyy-MM-dd HH:mm:ss'
): string {
  // 1. 解析为应用时区时间
  const zonedTime = toZonedTime(localDateTime, APP_TIMEZONE)
  // 2. 转换为 UTC 时间
  const utcTime = fromZonedTime(zonedTime, 'UTC')
  // 3. 格式化为 ISO 8601 字符串
  return utcTime.toISOString()
}

/**
 * 获取当前 UTC 时间（ISO 8601 格式）
 *
 * 用于: 请求参数、对比查询等
 *
 * @returns ISO 8601 UTC 字符串 "2024-01-01T12:00:00Z"
 *
 * @example
 * nowUtc() // "2024-01-01T12:00:00.123Z"
 */
export function nowUtc(): string {
  return new Date().toISOString()
}

/**
 * 时间比较（UTC timestamp 比较）
 *
 * @param date1 - 时间1
 * @param date2 - 时间2
 * @returns -1: date1 < date2, 0: date1 === date2, 1: date1 > date2
 *
 * @example
 * compareTime(date1, date2) // -1 | 0 | 1
 */
export function compareTime(date1: Date, date2: Date): number {
  const t1 = date1.getTime()
  const t2 = date2.getTime()
  return t1 < t2 ? -1 : t1 > t2 ? 1 : 0
}

/**
 * 判断时间是否过期（与当前 UTC 时间比较）
 *
 * @param apiTime - 后端返回的时间字符串
 * @returns true: 已过期, false: 未过期
 *
 * @example
 * isExpired("2024-01-01T12:00:00Z") // true | false
 */
export function isExpired(apiTime: string): boolean {
  const date = parseApiTime(apiTime)
  const now = new Date()
  return compareTime(date, now) < 0
}

/**
 * 格式化相对时间（用于显示 "刚刚"、"5分钟前" 等）
 *
 * @param apiTime - 后端返回的时间字符串
 * @returns 相对时间字符串
 *
 * @example
 * formatRelativeTime("2024-01-01T12:00:00Z") // "5分钟前"
 */
export function formatRelativeTime(apiTime: string): string {
  const date = parseApiTime(apiTime)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 7) {
    return formatAppTime(date, 'yyyy-MM-dd')
  } else if (days > 0) {
    return `${days}天前`
  } else if (hours > 0) {
    return `${hours}小时前`
  } else if (minutes > 0) {
    return `${minutes}分钟前`
  } else {
    return '刚刚'
  }
}

/**
 * 时间格式化配置（供 Element Plus DatePicker 使用）
 */
export const TIME_FORMAT_CONFIG = {
  // 日期时间选择器格式
  datetimeFormat: 'YYYY-MM-DD HH:mm:ss',
  // 日期格式
  dateFormat: 'YYYY-MM-DD',
  // 时间格式
  timeFormat: 'HH:mm:ss'
}
```

### 3.2 Element Plus 集成

```typescript
// src/utils/element-plus-config.ts
/**
 * Element Plus DatePicker 时区配置
 *
 * Element Plus DatePicker 返回的是浏览器本地时区时间
 * 需要在提交时转换为 UTC 时间
 */
import { toApiTime } from './timezone'

export const datePickerConfig = {
  // 日期时间选择器
  datetime: {
    format: 'YYYY-MM-DD HH:mm:ss',
    valueFormat: 'YYYY-MM-DD HH:mm:ss',
    placeholder: '请选择日期时间'
  },

  // 日期范围选择器
  daterange: {
    format: 'YYYY-MM-DD HH:mm:ss',
    valueFormat: 'YYYY-MM-DD HH:mm:ss',
    startPlaceholder: '开始时间',
    endPlaceholder: '结束时间'
  }
}

/**
 * 转换 DatePicker 值为 API 时间
 */
export function datePickerToApi(value: string | string[]): string | string[] {
  if (Array.isArray(value)) {
    return value.map(v => toApiTime(v))
  }
  return toApiTime(value)
}
```

### 3.3 Composable

```typescript
// src/composables/useTimezone.ts
/**
 * 时区处理 Composable
 *
 * 提供响应式的时区处理能力
 */
import { computed } from 'vue'
import { parseApiTime, formatAppTime, formatRelativeTime, toApiTime } from '@/utils/timezone'

export function useTimezone() {
  /**
   * 解析并格式化 API 时间
   */
  const formatTime = (apiTime: string, formatStr?: string) => {
    return computed(() => {
      const date = parseApiTime(apiTime)
      return formatAppTime(date, formatStr)
    })
  }

  /**
   * 格式化相对时间
   */
  const relativeTime = (apiTime: string) => {
    return computed(() => formatRelativeTime(apiTime))
  }

  /**
   * 检查是否过期
   */
  const checkExpired = (apiTime: string) => {
    return computed(() => {
      const date = parseApiTime(apiTime)
      return date.getTime() < Date.now()
    })
  }

  return {
    formatTime,
    relativeTime,
    checkExpired,
    parseApiTime,
    formatAppTime,
    toApiTime
  }
}
```

---

## 4. 使用指南

### 4.1 安装依赖

```bash
pnpm add date-fns date-fns-tz
```

### 4.2 基础使用

```vue
<template>
  <div>
    <h3>设备详情</h3>
    <p>设备名称: {{ device.name }}</p>
    <p>创建时间: {{ formattedCreateTime }}</p>
    <p>相对时间: {{ relativeCreateTime }}</p>
    <p>更新时间: {{ formatAppTime(parseApiTime(device.updated_at)) }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { parseApiTime, formatAppTime, formatRelativeTime } from '@/utils/timezone'

const device = ref({
  id: 1,
  name: 'AGV-001',
  created_at: '2024-01-01T12:00:00Z',
  updated_at: '2024-01-01T14:30:00Z'
})

// 使用 computed 缓存格式化结果
const formattedCreateTime = computed(() => {
  return formatAppTime(parseApiTime(device.value.created_at))
})

const relativeCreateTime = computed(() => {
  return formatRelativeTime(device.value.created_at)
})
</script>
```

### 4.3 表单提交

```vue
<template>
  <el-form
    :model="form"
    @submit.prevent="handleSubmit"
  >
    <el-form-item label="任务名称">
      <el-input v-model="form.name" />
    </el-form-item>

    <el-form-item label="计划开始时间">
      <el-date-picker
        v-model="form.plannedStartTime"
        type="datetime"
        format="YYYY-MM-DD HH:mm:ss"
        value-format="YYYY-MM-DD HH:mm:ss"
        placeholder="请选择计划开始时间"
      />
    </el-form-item>

    <el-form-item label="计划结束时间">
      <el-date-picker
        v-model="form.plannedEndTime"
        type="datetime"
        format="YYYY-MM-DD HH:mm:ss"
        value-format="YYYY-MM-DD HH:mm:ss"
        placeholder="请选择计划结束时间"
      />
    </el-form-item>

    <el-form-item>
      <el-button
        type="primary"
        @click="handleSubmit"
      >
        提交
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { toApiTime } from '@/utils/timezone'

const form = ref({
  name: '',
  plannedStartTime: '',
  plannedEndTime: ''
})

const handleSubmit = async () => {
  // 转换为 UTC 时间提交给后端
  const payload = {
    name: form.value.name,
    planned_start_time: toApiTime(form.value.plannedStartTime),
    planned_end_time: toApiTime(form.value.plannedEndTime)
  }

  await apiClient.post('/api/v1/device/tasks', payload)

  ElMessage.success('任务创建成功')
}
</script>
```

### 4.4 时间范围查询

```vue
<template>
  <div class="time-range-filter">
    <el-date-picker
      v-model="timeRange"
      type="datetimerange"
      range-separator="至"
      start-placeholder="开始时间"
      end-placeholder="结束时间"
      format="YYYY-MM-DD HH:mm:ss"
      value-format="YYYY-MM-DD HH:mm:ss"
    />
    <el-button @click="handleSearch">查询</el-button>
  </div>
</template>

<script setup lang="ts">
import { datePickerToApi } from '@/utils/element-plus-config'

const timeRange = ref<[string, string]>([])

const handleSearch = async () => {
  if (!timeRange.value || timeRange.value.length !== 2) {
    ElMessage.warning('请选择时间范围')
    return
  }

  // 转换为 UTC 时间
  const params = {
    start_time: datePickerToApi(timeRange.value[0]),
    end_time: datePickerToApi(timeRange.value[1])
  }

  const data = await apiClient.get('/api/v1/callback/logs', { params })
  // 处理查询结果...
}
</script>
```

---

## 5. 组件集成

### 5.1 时间显示组件

```vue
<!-- src/components/common/TimeDisplay.vue -->
<template>
  <span
    class="time-display"
    :title="fullTime"
  >
    {{ displayTime }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { parseApiTime, formatAppTime, formatRelativeTime } from '@/utils/timezone'

interface Props {
  time: string // API 返回的时间字符串
  format?: string // 格式字符串
  relative?: boolean // 是否显示相对时间
}

const props = withDefaults(defineProps<Props>(), {
  format: 'yyyy-MM-dd HH:mm:ss',
  relative: false
})

const displayTime = computed(() => {
  const date = parseApiTime(props.time)
  if (props.relative) {
    return formatRelativeTime(props.time)
  }
  return formatAppTime(date, props.format)
})

const fullTime = computed(() => {
  const date = parseApiTime(props.time)
  return formatAppTime(date, 'yyyy-MM-dd HH:mm:ss (zzz)')
})
</script>

<!-- 使用示例 -->
<!-- <TimeDisplay :time="device.created_at" /> -->
<!-- <TimeDisplay :time="device.created_at" relative /> -->
```

### 5.2 时间选择组件

```vue
<!-- src/components/common/TimePicker.vue -->
<template>
  <el-date-picker
    :model-value="modelValue"
    @update:model-value="handleChange"
    :type="type"
    :format="TIME_FORMAT_CONFIG.datetimeFormat"
    :value-format="TIME_FORMAT_CONFIG.datetimeFormat"
    :placeholder="placeholder"
  />
</template>

<script setup lang="ts">
import { TIME_FORMAT_CONFIG } from '@/utils/timezone'

interface Props {
  modelValue: string
  type?: 'datetime' | 'datetimerange'
  placeholder?: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  type: 'datetime',
  placeholder: '请选择时间'
})

const emit = defineEmits<Emits>()

const handleChange = (value: string) => {
  emit('update:modelValue', value)
}
</script>
```

---

## 6. 常见问题

### 6.1 后端返回的时间缺少时区标识符怎么办？

**问题**: 后端返回 `"2026-03-11T05:50:32.713481"` 而不是 `"2026-03-11T05:50:32.713481Z"`

**解决方案**: 前端已实现防御性处理，自动将缺少时区标识符的时间字符串视为 UTC 时间。

```typescript
// ✅ 前端自动处理
parseApiTime('2026-03-11T05:50:32.713481')
// 内部自动添加 'Z': "2026-03-11T05:50:32.713481Z"
// 结果: Date 对象 (UTC)

// 显示时自动转换为 Asia/Shanghai
formatAppTime(date) // "2026-03-11 13:50:32" (UTC+8)
```

**工作原理**:

1. `parseApiTime` 检测时间字符串是否有时区标识符 (`Z`, `+`, `-`)
2. 如果没有，自动添加 `Z` 后缀，将其视为 UTC 时间
3. 在开发环境会输出 debug 日志，提示自动添加了时区标识符

**最佳实践**:

- ✅ 前端防御性处理：兼容各种格式
- ✅ 后端修复：在 Pydantic 模型中配置 `json_encoders`，确保所有 datetime 字段都包含 `Z`

### 6.2 为什么不使用 moment.js？

| 问题                           | 答案                                                  |
| ------------------------------ | ----------------------------------------------------- |
| moment.js 已经不推荐使用了吗？ | ✅ 是的，moment.js 已进入维护模式，不再推荐新项目使用 |
| date-fns 有什么优势？          | ✅ 模块化、Tree-shaking 友好、体积小、Immutable       |
| date-fns-tz 是什么？           | ✅ date-fns 的时区扩展，基于 IANA 时区数据库          |

### 6.2 时区选择

```typescript
// 应用时区配置（与后端一致）
export const APP_TIMEZONE = 'Asia/Shanghai'

// 其他可选时区
// 'UTC' - 协调世界时
// 'Asia/Shanghai' - 中国标准时间
// 'Asia/Tokyo' - 日本标准时间
// 'America/New_York' - 美国东部时间
// 'Europe/London' - 英国时间
```

### 6.3 夏令时处理

```typescript
// date-fns-tz 自动处理夏令时
// 无需额外配置

// 示例: 美国东部时间（包含夏令时）
import { format, toZonedTime } from 'date-fns-tz'

const timeZone = 'America/New_York'
const date = toZonedTime('2024-07-01 12:00:00', timeZone)
// 自动处理夏令时
```

### 6.4 时间戳处理

```typescript
// ❌ 错误: 对 naive datetime 调用 .timestamp()
const dt = new Date('2024-01-01T12:00:00') // naive
const ts = dt.getTime() // ✅ 正确: 使用 .getTime()
// 避免使用任何会将 naive 当作本地时区的操作

// ✅ 正确: 统一使用 UTC timestamp
const date = parseApiTime('2024-01-01T12:00:00Z')
const timestamp = date.getTime() // UTC timestamp
```

---

## 7. 最佳实践

### 7.1 显示时间

```typescript
// ✅ 推荐: 使用 computed 缓存格式化结果
const formattedTime = computed(() => {
  return formatAppTime(parseApiTime(props.time))
})

// ❌ 不推荐: 每次渲染都重新格式化
<template>
  {{ formatAppTime(parseApiTime(props.time)) }}
</template>
```

### 7.2 表单验证

```typescript
// ✅ 推荐: 验证时转换为 UTC 后比较
const validateTimeRange = () => {
  const startTime = toApiTime(form.value.startTime)
  const endTime = toApiTime(form.value.endTime)

  const start = new Date(startTime).getTime()
  const end = new Date(endTime).getTime()

  return start < end
}

// ❌ 不推荐: 直接比较字符串
const validateTimeRange = () => {
  return form.value.startTime < form.value.endTime
}
```

### 7.3 时间比较

```typescript
// ✅ 推荐: 使用 UTC timestamp 比较
const isBefore = (time1: string, time2: string) => {
  const t1 = parseApiTime(time1).getTime()
  const t2 = parseApiTime(time2).getTime()
  return t1 < t2
}

// ❌ 不推荐: 直接比较字符串
const isBefore = (time1: string, time2: string) => {
  return time1 < time2
}
```

### 7.4 API 请求

```typescript
// ✅ 推荐: 请求参数使用 UTC 时间
const params = {
  start_time: toApiTime(range.value.start),
  end_time: toApiTime(range.value.end)
}

// ❌ 不推荐: 直接发送本地时间
const params = {
  start_time: range.value.start,
  end_time: range.value.end
}
```

---

## 附录 A: 时区速查表

| 操作          | 函数                   | 示例                                         |
| ------------- | ---------------------- | -------------------------------------------- |
| 解析 API 时间 | `parseApiTime()`       | `parseApiTime("2024-01-01T12:00:00Z")`       |
| 格式化显示    | `formatAppTime()`      | `formatAppTime(date, "yyyy-MM-dd HH:mm:ss")` |
| 相对时间      | `formatRelativeTime()` | `formatRelativeTime("2024-01-01T12:00:00Z")` |
| 提交转换      | `toApiTime()`          | `toApiTime("2024-01-01 20:00:00")`           |
| 当前 UTC      | `nowUtc()`             | `nowUtc()`                                   |
| 时间比较      | `compareTime()`        | `compareTime(date1, date2)`                  |
| 检查过期      | `isExpired()`          | `isExpired("2024-01-01T12:00:00Z")`          |

---

## 附录 B: 格式化字符串速查表

| 格式                   | 说明         | 示例                   |
| ---------------------- | ------------ | ---------------------- |
| `yyyy-MM-dd HH:mm:ss`  | 完整日期时间 | `2024-01-01 20:00:00`  |
| `yyyy-MM-dd`           | 日期         | `2024-01-01`           |
| `HH:mm:ss`             | 时间         | `20:00:00`             |
| `yyyy年MM月dd日 HH:mm` | 中文格式     | `2024年01月01日 20:00` |
| `MM-dd HH:mm`          | 简短格式     | `01-01 20:00`          |

---

**文档结束**

相关文档:

- [技术选型文档](./WES_FRONTEND_TECH_STACK.md)
- [后端时区处理](../wes_backend/src/utils/timezone.py)

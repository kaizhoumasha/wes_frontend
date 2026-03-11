# 多时区用户指南

> **项目**: P9 WES 前端项目
> **版本**: 1.0
> **更新日期**: 2026-03-11

---

## 概述

WES 系统支持多时区部署，不同地区的用户可以设置自己的时区偏好。

### 应用场景

| 角色   | 地点     | 时区             | 显示时间                    |
| ------ | -------- | ---------------- | --------------------------- |
| 服务器 | 中国     | Asia/Shanghai    | 数据库 UTC 存储             |
| 工厂 A | 台湾     | Asia/Taipei      | 2024-01-01 20:00:00 (UTC+8) |
| 工厂 B | 美国东部 | America/New_York | 2024-01-01 07:00:00 (UTC-5) |
| 浏览者 | 任何地方 | Browser Timezone | 自动检测浏览器时区          |

---

## 功能特性

### 1. 三层时区策略

```
优先级: 用户选择 > 浏览器检测 > 应用默认

1. 用户选择时区: 用户在设置中手动选择
2. 浏览器时区: 自动检测浏览器时区
3. 应用默认: Asia/Shanghai (服务器时区)
```

### 2. 持久化存储

- 时区设置保存在 `localStorage` (key: `wes-timezone-store`)
- 下次访问自动恢复用户偏好

### 3. 实时预览

- 设置时区时可以实时预览时间显示效果
- UTC 时间与本地时区对比显示

---

## 使用方法

### 方式 1: 用户设置界面（推荐）

在用户设置页面添加时区选择器：

```vue
<template>
  <el-dialog
    v-model="open"
    title="时区设置"
    width="600px"
  >
    <TimezoneSettings />
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TimezoneSettings from '@/components/common/TimezoneSettings.vue'

const open = ref(true)
</script>
```

### 方式 2: 编程方式设置

```typescript
import { useTimezoneStore } from '@/stores/timezone'

const timezoneStore = useTimezoneStore()

// 1. 设置用户时区
timezoneStore.setUserTimezone('America/New_York')

// 2. 启用浏览器时区自动检测
timezoneStore.enableBrowserTimezone()

// 3. 重置为应用默认时区
timezoneStore.resetToAppTimezone()
```

---

## 组件集成

### 显示时间（自动使用用户时区）

```vue
<template>
  <div>
    <!-- 使用 Composable -->
    <p>创建时间: {{ formattedTime }}</p>

    <!-- 或者直接使用 Store -->
    <p>更新时间: {{ updateTimeInUserTimezone }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTimezoneStore } from '@/stores/timezone'
import { parseApiTime, formatInTimezone } from '@/utils/timezone'

const props = defineProps<{
  created_at: string
  updated_at: string
}>()

const timezoneStore = useTimezoneStore()

// 方式 1: 使用 Composable（推荐）
const formattedTime = computed(() => {
  const date = parseApiTime(props.created_at)
  return timezoneStore.formatInCurrentTimezone(date)
})

// 方式 2: 直接使用工具函数
const updateTimeInUserTimezone = computed(() => {
  const date = parseApiTime(props.updated_at)
  return formatInTimezone(date, timezoneStore.currentTimezone)
})
</script>
```

### 表单提交（使用用户时区）

```vue
<template>
  <el-form @submit.prevent="handleSubmit">
    <el-form-item label="计划开始时间">
      <el-date-picker
        v-model="form.startTime"
        type="datetime"
        format="YYYY-MM-DD HH:mm:ss"
        value-format="YYYY-MM-DD HH:mm:ss"
        placeholder="请选择计划开始时间"
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
import { reactive } from 'vue'
import { useTimezoneStore } from '@/stores/timezone'
import { toApiTimeFromTimezone } from '@/utils/timezone'

const timezoneStore = useTimezoneStore()

const form = reactive({
  startTime: ''
})

function handleSubmit() {
  // 将用户选择的本地时间转换为 UTC
  const utcTime = toApiTimeFromTimezone(form.startTime, timezoneStore.currentTimezone)

  // 提交到后端
  await api.createTask({
    planned_start_time: utcTime
  })
}
</script>
```

---

## 常用时区列表

### 中国及港澳台

| 时区           | 描述                     | UTC 偏移 |
| -------------- | ------------------------ | -------- |
| Asia/Shanghai  | 中国标准时间 (北京/上海) | UTC+8    |
| Asia/Taipei    | 台湾标准时间 (台北)      | UTC+8    |
| Asia/Hong_Kong | 香港时间                 | UTC+8    |

### 亚洲主要城市

| 时区           | 描述                | UTC 偏移 |
| -------------- | ------------------- | -------- |
| Asia/Tokyo     | 日本标准时间 (东京) | UTC+9    |
| Asia/Seoul     | 韩国标准时间 (首尔) | UTC+9    |
| Asia/Singapore | 新加坡时间          | UTC+8    |

### 美洲时区

| 时区                | 描述                            | UTC 偏移 |
| ------------------- | ------------------------------- | -------- |
| America/New_York    | 美国东部时间 (纽约)             | UTC-5/-4 |
| America/Chicago     | 美国中部时间 (芝加哥)           | UTC-6/-5 |
| America/Denver      | 美国山地时间 (丹佛)             | UTC-7/-6 |
| America/Los_Angeles | 美国太平洋时间 (洛杉矶)         | UTC-8/-7 |
| America/Phoenix     | 美国山地时间 (凤凰城，无夏令时) | UTC-7    |

### 欧洲时区

| 时区          | 描述                 | UTC 偏移 |
| ------------- | -------------------- | -------- |
| Europe/London | 英国时间 (伦敦)      | UTC+0/+1 |
| Europe/Paris  | 中欧时间 (巴黎/柏林) | UTC+1/+2 |
| Europe/Moscow | 莫斯科时间           | UTC+3    |

### 大洋洲时区

| 时区             | 描述                    | UTC 偏移   |
| ---------------- | ----------------------- | ---------- |
| Australia/Sydney | 澳大利亚东部时间 (悉尼) | UTC+10/+11 |
| Pacific/Auckland | 新西兰时间 (奥克兰)     | UTC+12/+13 |

---

## API 参考

### useTimezoneStore

```typescript
import { useTimezoneStore } from '@/stores/timezone'

const store = useTimezoneStore()

// 状态
store.userTimezone        // 用户选择的时区 (string | null)
store.useBrowserTimezone  // 是否使用浏览器时区 (boolean)
store.browserTimezone     // 浏览器时区 (string)
store.APP_TIMEZONE        // 应用默认时区 ('Asia/Shanghai')

// 计算属性
store.currentTimezone     // 当前有效时区
store.timezoneDisplayName // 时区显示名称

// 方法
store.setUserTimezone(timezone: string)              // 设置用户时区
store.enableBrowserTimezone()                        // 启用浏览器时区
store.resetToAppTimezone()                           // 重置为应用默认
store.formatInCurrentTimezone(date, formatStr?)      // 格式化时间
```

### 工具函数

```typescript
import {
  formatInTimezone, // 格式化到指定时区
  toApiTimeFromTimezone // 从指定时区转换为 UTC
} from '@/utils/timezone'

// 格式化时间到指定时区
formatInTimezone(date, 'America/New_York') // "2024-01-01 07:00:00"

// 从指定时区转换为 UTC
toApiTimeFromTimezone('2024-01-01 12:00:00', 'America/New_York')
// "2024-01-01T17:00:00Z"
```

---

## 故障排查

### 问题 1: 时间显示不正确

**原因**: 可能使用了旧的 `formatAppTime()` 函数，它总是使用 Asia/Shanghai 时区。

**解决方案**: 改用 Store 或 `formatInTimezone()` 函数。

```typescript
// ❌ 错误: 总是显示 Asia/Shanghai 时间
import { formatAppTime } from '@/utils/timezone'
formatAppTime(date)

// ✅ 正确: 显示用户选择的时区
import { useTimezoneStore } from '@/stores/timezone'
const store = useTimezoneStore()
store.formatInCurrentTimezone(date)
```

### 问题 2: 表单提交时间不正确

**原因**: `toApiTime()` 假设输入是 Asia/Shanghai 时间。

**解决方案**: 使用 `toApiTimeFromTimezone()` 指定源时区。

```typescript
// ❌ 错误: 假设用户输入的是 Asia/Shanghai 时间
const utcTime = toApiTime(userInput)

// ✅ 正确: 指定用户的实际时区
const utcTime = toApiTimeFromTimezone(userInput, store.currentTimezone)
```

### 问题 3: 时区设置没有保存

**原因**: LocalStorage 被清除或浏览器隐私模式。

**解决方案**: 提示用户启用 LocalStorage 或使用浏览器时区模式。

---

## 最佳实践

### 1. 提供时区设置入口

在用户设置页面中添加时区设置选项：

```vue
<template>
  <el-menu>
    <el-menu-item index="timezone">
      <el-icon><Clock /></el-icon>
      <span>时区设置</span>
    </el-menu-item>
  </el-menu>
</template>
```

### 2. 显示时区信息

在时间显示旁边标注当前时区：

```vue
<template>
  <div class="time-display">
    <span>{{ formattedTime }}</span>
    <el-tag
      size="small"
      type="info"
    >
      {{ timezoneStore.currentTimezone }}
    </el-tag>
  </div>
</template>
```

### 3. 表单验证

使用 UTC 时间进行表单验证：

```typescript
// 验证时间范围
const validateTimeRange = () => {
  const startTime = toApiTimeFromTimezone(form.startTime, store.currentTimezone)
  const endTime = toApiTimeFromTimezone(form.endTime, store.currentTimezone)

  return new Date(startTime) < new Date(endTime)
}
```

---

## 总结

多时区支持让 WES 系统能够服务全球用户：

- ✅ 用户可以选择自己的时区
- ✅ 设置持久化保存
- ✅ 实时预览时间显示
- ✅ 自动浏览器时区检测
- ✅ 完整的工具函数和组件支持

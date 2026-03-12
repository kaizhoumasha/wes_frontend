<!--
时区设置组件

允许用户选择自己的时区偏好
支持：
1. 选择常用时区
2. 使用浏览器时区自动检测
3. 重置为应用默认时区
-->
<template>
  <div class="timezone-settings">
    <el-form
      label-width="120px"
      class="timezone-form"
    >
      <!-- 时区模式选择 -->
      <el-form-item label="时区模式">
        <el-radio-group
          v-model="editingTimezoneMode"
          @change="handleModeChange as any"
        >
          <el-radio value="custom">自定义时区</el-radio>
          <el-radio value="browser">浏览器时区（自动检测）</el-radio>
          <el-radio value="app">应用默认时区</el-radio>
        </el-radio-group>
      </el-form-item>

      <!-- 自定义时区选择 -->
      <el-form-item
        v-if="editingTimezoneMode === 'custom'"
        label="选择时区"
      >
        <el-select
          v-model="editingTimezone"
          filterable
          placeholder="请选择时区"
          style="width: 100%"
        >
          <el-option-group
            v-for="group in timezoneGroups"
            :key="group.label"
            :label="group.label"
          >
            <el-option
              v-for="tz in group.options"
              :key="tz.value"
              :label="`${tz.label} (${tz.offset})`"
              :value="tz.value"
            />
          </el-option-group>
        </el-select>
      </el-form-item>

      <!-- 当前时区信息 -->
      <el-form-item label="当前时区">
        <el-tag type="info">
          {{ currentTimezoneLabel }}
        </el-tag>
      </el-form-item>

      <!-- 浏览器时区信息 -->
      <el-form-item
        v-if="editingTimezoneMode === 'browser'"
        label="检测到"
      >
        <el-text type="info">
          {{ timezoneStore.browserTimezone }}
        </el-text>
      </el-form-item>

      <!-- 时间预览 -->
      <el-form-item label="时间预览">
        <div class="timezone-preview">
          <div class="preview-item">
            <el-text size="small">UTC 时间:</el-text>
            <el-text>{{ utcPreview }}</el-text>
          </div>
          <div class="preview-item">
            <el-text size="small">当前时区:</el-text>
            <el-text type="primary">{{ localPreview }}</el-text>
          </div>
        </div>
      </el-form-item>

      <!-- 提示信息 -->
      <el-alert
        type="warning"
        :closable="false"
        show-icon
        class="timezone-hint"
      >
        <template #title>
          <div>修改后需要点击"确定"按钮才能生效，点击"取消"将放弃修改</div>
        </template>
      </el-alert>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useTimezoneStore, COMMON_TIMEZONES } from '@/stores/timezone'
import { formatInTimezone } from '@/utils/timezone'

// ==================== Store ====================

const timezoneStore = useTimezoneStore()

// ==================== 临时状态（编辑中） ====================

/**
 * 编辑中的时区模式
 */
const editingTimezoneMode = ref<'custom' | 'browser' | 'app'>('custom')

/**
 * 编辑中的自定义时区
 */
const editingTimezone = ref<string>(timezoneStore.userTimezone || timezoneStore.APP_TIMEZONE)

/**
 * 是否有修改（用于提示用户）
 */
const hasChanges = computed(() => {
  if (editingTimezoneMode.value === 'browser') {
    return !timezoneStore.useBrowserTimezone
  }
  if (editingTimezoneMode.value === 'app') {
    return timezoneStore.userTimezone !== null || timezoneStore.useBrowserTimezone
  }
  if (editingTimezoneMode.value === 'custom') {
    return (
      timezoneStore.userTimezone !== editingTimezone.value ||
      timezoneStore.useBrowserTimezone
    )
  }
  return false
})

// ==================== 时区分组 ====================

const timezoneGroups = computed(() => {
  const groups: Record<string, { label: string; options: typeof COMMON_TIMEZONES }> = {
    中国及港澳台: {
      label: '中国及港澳台',
      options: COMMON_TIMEZONES.filter(
        tz =>
          tz.value.startsWith('Asia/') &&
          (tz.value.includes('Shanghai') ||
            tz.value.includes('Taipei') ||
            tz.value.includes('Hong_Kong'))
      )
    },
    亚洲主要城市: {
      label: '亚洲主要城市',
      options: COMMON_TIMEZONES.filter(
        tz =>
          tz.value.startsWith('Asia/') &&
          !tz.value.includes('Shanghai') &&
          !tz.value.includes('Taipei') &&
          !tz.value.includes('Hong_Kong')
      )
    },
    美洲时区: {
      label: '美洲时区',
      options: COMMON_TIMEZONES.filter(tz => tz.value.startsWith('America/'))
    },
    欧洲时区: {
      label: '欧洲时区',
      options: COMMON_TIMEZONES.filter(tz => tz.value.startsWith('Europe/'))
    },
    大洋洲时区: {
      label: '大洋洲时区',
      options: COMMON_TIMEZONES.filter(
        tz => tz.value.startsWith('Australia/') || tz.value.startsWith('Pacific/')
      )
    },
    其他: {
      label: '其他',
      options: COMMON_TIMEZONES.filter(tz => tz.value === 'UTC')
    }
  }
  return groups
})

// ==================== 计算属性 ====================

/**
 * 当前预览时区（用于显示预览效果）
 */
const previewTimezone = computed(() => {
  if (editingTimezoneMode.value === 'browser') {
    return timezoneStore.browserTimezone
  }
  if (editingTimezoneMode.value === 'app') {
    return timezoneStore.APP_TIMEZONE
  }
  return editingTimezone.value
})

/**
 * 预览时间（使用定时器更新，避免每次响应式更新都创建新 Date）
 */
const previewTime = ref(new Date())
let previewTimer: number | null = null

/**
 * 当前预览时间（UTC）
 */
const utcPreview = computed(() => {
  // 使用缓存的预览时间，避免重复创建 Date 对象
  return previewTime.value.toISOString().replace('T', ' ').replace('.000Z', ' UTC')
})

/**
 * 本地时区预览
 */
const localPreview = computed(() => {
  // 使用缓存的预览时间
  return formatInTimezone(previewTime.value, previewTimezone.value)
})

/**
 * 当前时区显示名称
 */
const currentTimezoneLabel = computed(() => {
  if (editingTimezoneMode.value === 'browser') {
    return '浏览器时区 (自动检测)'
  }
  if (editingTimezoneMode.value === 'app') {
    return `应用默认 (${timezoneStore.APP_TIMEZONE})`
  }
  const tz = editingTimezone.value
  if (tz.includes('/')) {
    const city = tz.split('/').pop()?.replace('_', ' ')
    return city || tz
  }
  return tz
})

// ==================== 方法 ====================

/**
 * 处理时区模式变化
 */
function handleModeChange(mode: 'custom' | 'browser' | 'app') {
  editingTimezoneMode.value = mode
}

/**
 * 监听自定义时区变化
 */
watch(editingTimezone, newTimezone => {
  if (editingTimezoneMode.value === 'custom') {
    editingTimezone.value = newTimezone
  }
})

// ==================== 生命周期 ====================

onMounted(() => {
  // 初始化编辑状态（从 Store 读取当前值）
  if (timezoneStore.useBrowserTimezone) {
    editingTimezoneMode.value = 'browser'
  } else if (timezoneStore.userTimezone) {
    editingTimezoneMode.value = 'custom'
    editingTimezone.value = timezoneStore.userTimezone
  } else {
    editingTimezoneMode.value = 'app'
  }

  // 启动预览时间定时器（每秒更新一次）
  previewTimer = window.setInterval(() => {
    previewTime.value = new Date()
  }, 1000)
})

onUnmounted(() => {
  // 清理定时器
  if (previewTimer !== null) {
    clearInterval(previewTimer)
    previewTimer = null
  }
})

// ==================== 暴露方法 ====================

/**
 * 应用时区设置并保存到 Store
 * 由父组件调用
 */
function applyTimezoneSettings() {
  switch (editingTimezoneMode.value) {
    case 'custom':
      timezoneStore.setUserTimezone(editingTimezone.value)
      break
    case 'browser':
      timezoneStore.enableBrowserTimezone()
      break
    case 'app':
      timezoneStore.resetToAppTimezone()
      break
  }
}

/**
 * 重置编辑状态为 Store 中的值
 * 由父组件调用（取消时）
 */
function resetTimezoneSettings() {
  if (timezoneStore.useBrowserTimezone) {
    editingTimezoneMode.value = 'browser'
  } else if (timezoneStore.userTimezone) {
    editingTimezoneMode.value = 'custom'
    editingTimezone.value = timezoneStore.userTimezone
  } else {
    editingTimezoneMode.value = 'app'
  }
}

// 暴露给父组件
defineExpose({
  hasChanges,
  currentTimezoneLabel,
  applyTimezoneSettings,
  resetTimezoneSettings
})
</script>

<script lang="ts">
/**
 * TimezoneSettings 组件实例类型
 */
export interface TimezoneSettingsInstance {
  hasChanges: boolean
  currentTimezoneLabel: string
  applyTimezoneSettings: () => void
  resetTimezoneSettings: () => void
}
</script>

<style scoped>
.timezone-settings {
  padding: 16px;

  /* 固定最大高度，避免弹窗闪动 */
  max-height: 500px;
  overflow-y: auto;
}

.timezone-form {
  /* 确保表单内容不会因为动态变化导致布局跳动 */
  min-height: 400px;
}

/* 自定义滚动条样式 */
.timezone-settings::-webkit-scrollbar {
  width: 6px;
}

.timezone-settings::-webkit-scrollbar-track {
  background: transparent;
}

.timezone-settings::-webkit-scrollbar-thumb {
  background: var(--el-border-color-darker);
  border-radius: 3px;
}

.timezone-settings::-webkit-scrollbar-thumb:hover {
  background: var(--el-border-color);
}

.timezone-preview {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: var(--el-fill-color-lighter);
  padding: 12px;
  border-radius: 4px;
}

.preview-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.preview-item .el-text {
  font-family: 'Courier New', monospace;
  font-size: 13px;
}

.timezone-hint {
  margin-top: 16px;
}
</style>

<!-- 全局样式：修复 dialog 弹窗闪动问题 -->
<style>
/* 确保 dialog body 有固定高度，避免内容变化时闪动 */
.timezone-dialog .el-dialog__body {
  min-height: 450px;
  max-height: 550px;
  overflow-y: auto;
}

/* 自定义 dialog 滚动条 */
.timezone-dialog .el-dialog__body::-webkit-scrollbar {
  width: 6px;
}

.timezone-dialog .el-dialog__body::-webkit-scrollbar-track {
  background: transparent;
}

.timezone-dialog .el-dialog__body::-webkit-scrollbar-thumb {
  background: var(--el-border-color-darker);
  border-radius: 3px;
}

.timezone-dialog .el-dialog__body::-webkit-scrollbar-thumb:hover {
  background: var(--el-border-color);
}

/* Dialog Footer 按钮样式 */
.timezone-dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 提示信息样式 */
.timezone-hint {
  margin-top: 16px;
}

.timezone-hint :deep(.el-alert__title) {
  font-size: 13px;
  line-height: 1.5;
}
</style>

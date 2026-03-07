<script setup lang="ts">
import { Moon, Sunny } from '@element-plus/icons-vue'
import { useDarkMode } from '@/composables/useDarkMode'

const { isDark, toggle } = useDarkMode()

const handleToggle = () => toggle()
</script>

<template>
  <el-tooltip
    :content="isDark ? '切换到明亮模式' : '切换到暗黑模式'"
    placement="bottom"
  >
    <el-button
      circle
      :aria-label="isDark ? '切换到明亮模式' : '切换到暗黑模式'"
      :class="[
        'theme-toggle-btn',
        'transition-all duration-300',
        isDark
          ? 'bg-primary/10 text-primary border-primary/30 hover:bg-primary/20'
          : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
      ]"
      @click="handleToggle"
    >
      <el-icon>
        <component :is="isDark ? Sunny : Moon" />
      </el-icon>
    </el-button>
  </el-tooltip>
</template>

<style scoped>
.theme-toggle-btn {
  width: 36px;
  height: 36px;
  border: 1px solid;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.theme-toggle-btn:hover {
  transform: scale(1.05);
}

.theme-toggle-btn:active {
  transform: scale(0.95);
}

/* 键盘焦点样式 - 可访问性增强 */
.theme-toggle-btn:focus-visible {
  outline: 2px solid var(--el-color-primary);
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgb(var(--el-color-primary-rgb) / 0.2);
}
</style>

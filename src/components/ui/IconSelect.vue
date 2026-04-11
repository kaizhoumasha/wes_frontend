<script setup lang="ts">
import { ref, computed, shallowRef } from 'vue'
import { icons as epIcons } from '@iconify-json/ep'
import { icons as lucideIcons } from '@iconify-json/lucide'
import { Search } from '@element-plus/icons-vue'
import AppIcon from './AppIcon.vue'

// Iconify 图标集（按类别分组）
const CATEGORIES = [
  {
    label: '常用',
    prefix: '常用',
    icons: [
      'ep:menu',
      'ep:house',
      'ep:user',
      'ep:setting',
      'ep:grid',
      'ep:document',
      'ep:folder',
      'ep:delete',
      'ep:edit',
      'ep:search',
      'ep:bell',
      'ep:lock'
    ]
  },
  {
    label: '操作',
    prefix: 'ep:',
    icons: [
      'ep:plus',
      'ep:minus',
      'ep:check',
      'ep:close',
      'ep:edit',
      'ep:delete',
      'ep:search',
      'ep:view',
      'ep:hide',
      'ep:refresh',
      'ep:upload',
      'ep:download',
      'ep:link',
      'ep:copy',
      'ep:cut'
    ]
  },
  {
    label: '导航',
    prefix: 'ep:',
    icons: [
      'ep:menu',
      'ep:house',
      'ep:back',
      'ep:right',
      'ep:top',
      'ep:bottom',
      'ep:d-arrow-left',
      'ep:d-arrow-right',
      'ep:arrow-left',
      'ep:arrow-right',
      'ep:arrow-up',
      'ep:arrow-down',
      'ep:caret-left',
      'ep:caret-right',
      'ep:caret-top',
      'ep:caret-bottom'
    ]
  },
  {
    label: '用户',
    prefix: 'ep:',
    icons: [
      'ep:user',
      'ep:user-filled',
      'ep:avatar',
      'ep:postcard',
      'ep:phone',
      'ep:message',
      'ep:chat-line-square',
      'ep:bell',
      'ep:bell-filled'
    ]
  },
  {
    label: '文件',
    prefix: 'ep:',
    icons: [
      'ep:document',
      'ep:folder',
      'ep:folder-opened',
      'ep:files',
      'ep:folder-add',
      'ep:document-delete',
      'ep:edit-pen',
      'ep:document-checked',
      'ep:document-copy',
      'ep:document-add',
      'ep:document-remove'
    ]
  },
  {
    label: '系统',
    prefix: 'ep:',
    icons: [
      'ep:setting',
      'ep:tools',
      'ep:house',
      'ep:monitor',
      'ep:cellphone',
      'ep:connection',
      'ep:wallet',
      'ep:credit-card',
      'ep:shopping-cart',
      'ep:shopping-cart-full'
    ]
  },
  {
    label: '数据',
    prefix: 'ep:',
    icons: [
      'ep:data-line',
      'ep:data-analysis',
      'ep:pie-chart',
      'ep:trend-charts',
      'ep:histogram',
      'ep:grid',
      'ep:calendar',
      'ep:clock',
      'ep:timer',
      'ep:stopwatch',
      'ep:money'
    ]
  },
  {
    label: '提示',
    prefix: 'ep:',
    icons: [
      'ep:warning',
      'ep:warning-filled',
      'ep:question-filled',
      'ep:info-filled',
      'ep:circle-check',
      'ep:circle-close',
      'ep:help',
      'ep:chat-dot-round',
      'ep:close',
      'ep:check'
    ]
  }
]

interface Props {
  modelValue?: string | null
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  placeholder: '选择图标'
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | null): void
}>()

// Popover 引用
const popoverRef = shallowRef()

// 搜索关键词
const searchQuery = ref('')

// 当前选中的分类（null 表示全部）
const activeCategory = ref('常用')
const showMoreExpanded = ref(false)
const INITIAL_ICON_COUNT = 8

// 获取所有图标列表（按前缀分组）
const epIconList = Object.keys(epIcons.icons || {})
const lucideIconList = Object.keys(lucideIcons.icons || {})

const allIcons = computed(() => [
  { label: 'Element Plus', prefix: 'ep:', icons: epIconList },
  { label: 'Lucide', prefix: 'lucide:', icons: lucideIconList }
])

// 过滤后的图标（根据搜索词或分类）
const filteredIcons = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  // 搜索模式
  if (query) {
    const results: string[] = []
    for (const group of allIcons.value) {
      const matched = group.icons.filter(icon => icon.includes(query)).slice(0, 50)
      results.push(...matched.map(i => `${group.prefix}${i}`))
    }
    return results.slice(0, 100)
  }

  // 分类模式
  if (activeCategory.value && activeCategory.value !== '常用') {
    const category = CATEGORIES.find(c => c.label === activeCategory.value)
    if (category) {
      return category.icons
    }
  }

  // 常用分类：支持展开/收起
  const allCommonIcons = CATEGORIES[0].icons
  if (showMoreExpanded.value) {
    return allCommonIcons
  }
  return allCommonIcons.slice(0, INITIAL_ICON_COUNT)
})

// 当前选中值
const selectedValue = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val)
})

// 选中图标
function selectIcon(icon: string) {
  selectedValue.value = icon
  popoverRef.value?.hide()
}

// 清除选择
function clearSelection() {
  selectedValue.value = null
}

// 格式化图标名称（去掉前缀）
function formatIconName(icon: string): string {
  return icon.replace(/^(ep:|lucide:)/, '')
}
</script>

<template>
  <div class="icon-select">
    <el-popover
      ref="popoverRef"
      placement="bottom-start"
      :teleported="true"
      :width="360"
      trigger="click"
      :show-after="0"
      popper-class="icon-select-popover"
    >
      <template #reference>
        <div class="icon-select-trigger">
          <div
            v-if="selectedValue"
            class="icon-selected"
          >
            <AppIcon
              :icon="selectedValue"
              :size="20"
            />
            <span class="icon-name">{{ formatIconName(selectedValue) }}</span>
          </div>
          <span
            v-else
            class="icon-placeholder"
          >
            {{ placeholder }}
          </span>
          <el-icon
            class="icon-clear"
            @click.stop="clearSelection"
          >
            <Close />
          </el-icon>
        </div>
      </template>

      <!-- 搜索框 -->
      <div class="icon-search">
        <el-input
          v-model="searchQuery"
          placeholder="搜索图标..."
          clearable
          :prefix-icon="Search"
          size="default"
        />
      </div>

      <!-- 分类标签 -->
      <el-tabs
        v-if="!searchQuery"
        v-model="activeCategory"
        class="icon-tabs"
        @tab-change="searchQuery = ''"
      >
        <el-tab-pane
          v-for="cat in CATEGORIES"
          :key="cat.label"
          :label="cat.label"
          :name="cat.label"
        />
      </el-tabs>

      <!-- 图标网格 -->
      <div class="icon-grid">
        <div
          v-for="icon in filteredIcons"
          :key="icon"
          class="icon-item"
          :class="{ 'is-selected': selectedValue === icon }"
          :title="icon"
          @click="selectIcon(icon)"
        >
          <AppIcon
            :icon="icon"
            :size="22"
          />
        </div>

        <el-empty
          v-if="filteredIcons.length === 0"
          description="未找到图标"
          :image-size="60"
          class="mt-4"
        />
      </div>

      <!-- 展开/收起按钮 -->
      <div
        v-if="activeCategory === '常用' && CATEGORIES[0].icons.length > 12"
        class="expand-btn"
      >
        <el-button
          link
          type="primary"
          size="small"
          @click="showMoreExpanded = !showMoreExpanded"
        >
          {{ showMoreExpanded ? '收起' : `展开更多 (${CATEGORIES[0].icons.length - 12})` }}
        </el-button>
      </div>
    </el-popover>
  </div>
</template>

<style scoped>
.icon-select {
  width: 100%;
}

.icon-select-trigger {
  display: flex;
  align-items: center;
  min-height: 32px;
  padding: 0 8px;
  border: 1px solid var(--el-border-color);
  border-radius: var(--el-border-radius-base);
  cursor: pointer;
  transition: border-color 0.2s;
}

.icon-select-trigger:hover {
  border-color: var(--el-color-primary);
}

.icon-selected {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.icon-name {
  font-size: 13px;
  color: var(--el-text-color-primary);
}

.icon-placeholder {
  color: var(--el-text-color-placeholder);
  font-size: 13px;
}

.icon-clear {
  color: var(--el-text-color-placeholder);
  cursor: pointer;
  padding: 2px;
  border-radius: 4px;
  transition: all 0.2s;
}

.icon-clear:hover {
  color: var(--el-color-danger);
  background-color: var(--el-color-danger-light-9);
}

.icon-search {
  margin-bottom: 12px;
}

.icon-tabs {
  margin-bottom: 8px;
}

.expand-btn {
  text-align: center;
  padding: 4px 0;
  border-bottom: 1px solid var(--el-border-color-light);
  margin-bottom: 8px;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 4px;
  max-height: 280px;
  overflow-y: auto;
  padding: 4px;
}

.icon-item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
  border: 2px solid transparent;
}

.icon-item:hover {
  background-color: var(--el-fill-color-light);
}

.icon-item.is-selected {
  background-color: var(--el-color-primary-light-9);
  border-color: var(--el-color-primary);
}
</style>

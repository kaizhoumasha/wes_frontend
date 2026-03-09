# 用户管理页智能搜索集成指南

> **模块**: 用户管理 (`/admin/users`)
> **能力**: 智能搜索（Smart Search）
> **文档版本**: v1.0
> **创建日期**: 2026-03-08

---

## 1. 快速开始

### 1.1 基本集成

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useCrudApi } from '@/composables/useCrudApi'
import { useSmartSearch } from '@/composables/useSmartSearch'
import SmartSearchBar from '@/components/search/SmartSearchBar.vue'
import AdvancedSearchDialog from '@/components/search/AdvancedSearchDialog.vue'
import { userSearchFields, userSearchFavorites, userQuickPresets } from './search-config'
import { userApi } from '@/api/modules/user'

// ==================== 智能搜索状态 ====================

const smartSearch = useSmartSearch({
  fields: userSearchFields,
  favorites: userSearchFavorites,
  quickPresets: userQuickPresets
})

// ==================== 列表数据 ====================

const { data, loading, pagination, fetchList } = useCrudApi(userApi)

// ==================== 搜索应用 ====================

async function applySmartSearch() {
  await fetchList({
    page: 1,
    filters: smartSearch.compileToFilterGroup(),
    sort: [{ field: 'updated_at', order: 'desc' }]
  })
}

async function handleSearchApply() {
  await applySmartSearch()
}

function handleRemoveCondition(id: string) {
  smartSearch.removeCondition(id)
  handleSearchApply()
}

function handleClear() {
  smartSearch.clearConditions()
  smartSearch.clearKeyword()
  handleSearchApply()
}

// ==================== 键盘导航处理 ====================

function handleKeydownNext() {
  smartSearch.getNextActiveField('next')
}

function handleKeydownPrev() {
  smartSearch.getNextActiveField('prev')
}

function handleKeydownEnter() {
  smartSearch.buildConditionFromActiveField()
  handleSearchApply()
}

// ==================== 初始化加载 ====================

fetchList()
</script>

<template>
  <div class="user-management-page">
    <!-- 搜索区域 -->
    <div class="search-section">
      <SmartSearchBar
        :conditions="smartSearch.conditions.value"
        :keyword="smartSearch.state.value.keyword"
        :active-field="smartSearch.state.value.activeField"
        :fields="userSearchFields"
        :favorites="userSearchFavorites"
        :quick-presets="userQuickPresets"
        :loading="loading.value"
        @update:keyword="smartSearch.setKeyword"
        @remove-condition="handleRemoveCondition"
        @open-popover="smartSearch.openPopover"
        @close-popover="smartSearch.closePopover"
        @open-advanced="smartSearch.openAdvancedDialog"
        @clear="handleClear"
        @select-field="smartSearch.setActiveField"
        @apply-condition="smartSearch.addCondition"
        @apply-favorite="smartSearch.applyFavorite"
        @keydown-next="handleKeydownNext"
        @keydown-prev="handleKeydownPrev"
        @keydown-enter="handleKeydownEnter"
      />
    </div>

    <!-- 数据表格 -->
    <el-table
      :data="data"
      :loading="loading"
      stripe
    >
      <!-- 表格列 -->
    </el-table>

    <!-- 分页 -->
    <el-pagination
      v-model:current-page="pagination.page"
      v-model:page-size="pagination.size"
      :total="pagination.total"
      @current-change="fetchList"
      @size-change="fetchList"
    />

    <!-- 高级搜索弹窗 -->
    <AdvancedSearchDialog
      v-model="smartSearch.state.value.advancedDialogOpen"
      :conditions="smartSearch.conditions.value"
      :fields="userSearchFields"
      :favorites="userSearchFavorites"
      @add-condition="smartSearch.addCondition"
      @update-condition="(_, payload) => smartSearch.replaceCondition(payload.id, payload)"
      @remove-condition="smartSearch.removeCondition"
      @clear-all="handleClear"
      @apply-favorite="smartSearch.applyFavorite"
      @apply="handleSearchApply"
    />
  </div>
</template>
```

---

## 2. 组件 Props 说明

### 2.1 SmartSearchBar

| Prop           | 类型                  | 说明             |
| -------------- | --------------------- | ---------------- |
| `conditions`   | `SearchCondition[]`   | 已应用的条件列表 |
| `keyword`      | `string`              | 当前关键字       |
| `activeField`  | `string \| undefined` | 当前高亮字段     |
| `fields`       | `SearchFieldDef[]`    | 可搜索字段列表   |
| `favorites`    | `SearchFavorite[]`    | 收藏夹列表       |
| `quickPresets` | `QuickSearchPreset[]` | 快速预设列表     |
| `placeholder`  | `string`              | 输入框占位符     |
| `loading`      | `boolean`             | 是否加载中       |

### 2.2 SmartSearchBar Events

| Event              | Payload                | 说明         |
| ------------------ | ---------------------- | ------------ |
| `update:keyword`   | `string`               | 关键字变化   |
| `remove-condition` | `string` (id)          | 删除条件     |
| `open-popover`     | -                      | 打开 Popover |
| `close-popover`    | -                      | 关闭 Popover |
| `open-advanced`    | -                      | 打开高级搜索 |
| `clear`            | -                      | 清空所有     |
| `select-field`     | `string` (fieldKey)    | 选择字段     |
| `apply-condition`  | `SearchConditionDraft` | 应用条件     |
| `apply-favorite`   | `string` (favoriteId)  | 应用收藏夹   |
| `keydown-next`     | -                      | 键盘向下导航 |
| `keydown-prev`     | -                      | 键盘向上导航 |
| `keydown-enter`    | -                      | 键盘确认     |

### 2.3 AdvancedSearchDialog

| Prop         | 类型                | 说明         |
| ------------ | ------------------- | ------------ |
| `modelValue` | `boolean`           | 是否显示弹窗 |
| `conditions` | `SearchCondition[]` | 条件列表     |
| `fields`     | `SearchFieldDef[]`  | 字段列表     |
| `favorites`  | `SearchFavorite[]`  | 收藏夹列表   |

---

## 3. API 集成说明

### 3.1 查询参数

```typescript
// 智能搜索编译输出
const filterGroup = smartSearch.compileToFilterGroup()
// {
//   couple: 'and',
//   conditions: [
//     { field: 'username', op: 'ilike', value: '%admin%' },
//     { field: 'is_superuser', op: 'eq', value: true },
//   ],
// }

// 传入 CrudApi.query()
await userApi.query({
  page: 1,
  filters: filterGroup, // ✅ 类型兼容
  sort: [{ field: 'updated_at', order: 'desc' }]
})
```

### 3.2 与现有分页集成

```typescript
// 搜索应用：重置到第一页
async function applySmartSearch() {
  await fetchList({
    page: 1, // ✅ 搜索后重置页码
    filters: smartSearch.compileToFilterGroup()
  })
}

// 普通分页：保持当前页
async function handlePageChange(page: number) {
  await fetchList({
    page, // ✅ 不重置页码
    filters: smartSearch.compileToFilterGroup() // 保持当前搜索条件
  })
}
```

---

## 4. 样式定制

### 4.1 全局样式变量

```scss
// 在你的样式文件中覆盖
.smart-search-bar {
  --search-bar-height: 40px;
  --search-bar-border-radius: 4px;
}

.search-condition-tag {
  --tag-max-width: 200px;
}
```

### 4.2 主题适配

智能搜索组件使用 Element Plus 的 CSS 变量，自动适配暗色模式。

---

## 5. 调试技巧

### 5.1 查看编译输出

```typescript
console.log('FilterGroup:', smartSearch.compileToFilterGroup())
```

### 5.2 查看当前状态

```typescript
console.log('Search State:', smartSearch.state.value)
```

---

## 6. 常见问题

### Q1: 条件标签不显示？

**A**: 确保 `conditions` 是响应式的：

```typescript
// ✅ 正确
:conditions="smartSearch.conditions.value"

// ❌ 错误
:conditions="smartSearch.conditions"
```

### Q2: 键盘导航不工作？

**A**: 确保 SmartSearchBar 挂载时聚焦：

```typescript
onMounted(() => {
  searchBarRef.value?.focus()
})
```

### Q3: 搜索结果不正确？

**A**: 检查编译输出是否正确：

```typescript
const filterGroup = smartSearch.compileToFilterGroup()
console.log(JSON.stringify(filterGroup, null, 2))
```

---

## 7. 完整示例

参考 `src/views/admin/users/index.vue` 获取完整集成示例。

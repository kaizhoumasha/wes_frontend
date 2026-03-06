# 图标使用指南

项目已集成 **Iconify** 图标系统，支持 200,000+ 图标，同时保持对 Element Plus 图标的完全兼容。

---

## 📦 安装状态

| 包名                    | 状态      | 版本  |
| ----------------------- | --------- | ----- |
| @iconify/vue            | ✅ 已安装 | 4.3.0 |
| @element-plus/icons-vue | ✅ 已安装 | 2.3.2 |
| lucide-vue-next         | ❌ 未安装 | -     |

---

## 🎯 使用场景

### 1️⃣ 动态图标（从后端获取）

**使用 `AppIcon` 组件** - 适用于菜单、按钮等图标名称来自数据库的场景。

```vue
<script setup lang="ts">
import AppIcon from '@/components/ui/AppIcon.vue'

// 后端返回的菜单数据
const menuItem = {
  title: '示例页面',
  icon: 'Grid' // 或 'ep:grid', 'mdi:warehouse'
}
</script>

<template>
  <!-- 自动识别并渲染正确的图标 -->
  <AppIcon :icon="menuItem.icon" :size="20" />
</template>
```

### 2️⃣ 静态图标（UI 组件）

**直接使用 Element Plus 图标组件** - 适用于固定的 UI 元素。

```vue
<script setup lang="ts">
import { Fold, Expand, Search } from '@element-plus/icons-vue'
</script>

<template>
  <el-icon :size="20">
    <Fold />
  </el-icon>
</template>
```

---

## 🎨 图标命名规范

### Iconify 格式（推荐）

```
<图标集>:<图标名>
```

| 图标集                | 前缀      | 示例                         | 图标数量 |
| --------------------- | --------- | ---------------------------- | -------- |
| Element Plus          | `ep:`     | `ep:grid`, `ep:user`         | ~200     |
| Material Design Icons | `mdi:`    | `mdi:home`, `mdi:warehouse`  | ~7,000   |
| Phosphor Icons        | `ph:`     | `ph:package`, `ph:truck`     | ~7,000   |
| Lucide                | `lucide:` | `lucide:home`, `lucide:menu` | ~1,000   |

### Element Plus 兼容格式（向后兼容）

直接使用组件名（PascalCase），自动转换为 `ep:` 前缀：

```
"Grid"      → ep:grid
"EditPen"   → ep:edit-pen
"User"      → ep:user
```

---

## 📋 常用图标集

### 仓储业务相关

```vue
<!-- Material Design Icons - 仓储/物流 -->
<AppIcon icon="mdi:warehouse" />
<AppIcon icon="mdi:package" />
<AppIcon icon="mdi:truck" />
<AppIcon icon="mdi:forklift" />
<AppIcon icon="mdi:barcode" />

<!-- Phosphor Icons - 现代风格 -->
<AppIcon icon="ph:package" />
<AppIcon icon="ph:truck" />
<AppIcon icon="ph:warehouse" />
```

### 系统管理相关

```vue
<!-- Element Plus 图标 -->
<AppIcon icon="ep:grid" />
<!-- 九宫格 -->
<AppIcon icon="ep:menu" />
<!-- 菜单 -->
<AppIcon icon="ep:setting" />
<!-- 设置 -->
<AppIcon icon="ep:user" />
<!-- 用户 -->
```

---

## 🔍 查找图标

访问 [Iconify 图标搜索](https://icon-sets.iconify.design/) 搜索所需图标。

**示例**：

1. 搜索 "warehouse" → 找到 `mdi:warehouse`
2. 在代码中使用：`<AppIcon icon="mdi:warehouse" />`

---

## 📊 后端数据示例

### 当前格式（继续支持）

```json
{
  "name": "examples",
  "title": "示例页面",
  "icon": "Grid"
}
```

### 推荐格式（Iconify）

```json
{
  "name": "device",
  "title": "设备管理",
  "icon": "mdi:warehouse"
}
```

### 混合格式（兼容）

```json
{
  "name": "user",
  "title": "用户管理",
  "icon": "ep:user"
}
```

---

## ⚙️ AppIcon API

### Props

| 属性     | 类型               | 默认值      | 说明                                          |
| -------- | ------------------ | ----------- | --------------------------------------------- |
| icon     | `string \| null`   | `null`      | 图标名称（支持 Iconify 和 Element Plus 格式） |
| size     | `number \| string` | `20`        | 图标大小（像素）                              |
| color    | `string`           | `'inherit'` | 图标颜色                                      |
| fallback | `string`           | `'Menu'`    | 未指定图标时使用的默认图标                    |

### 示例

```vue
<!-- 基础用法 -->
<AppIcon icon="ep:grid" />

<!-- 自定义大小和颜色 -->
<AppIcon icon="mdi:warehouse" :size="24" color="#00f3ff" />

<!-- 降级图标（icon 为空时使用） -->
<AppIcon :icon="null" fallback="Document" />
```

---

## 🚀 迁移指南

### 从 Element Plus 动态图标迁移

**之前**（不工作）：

```vue
<component :is="menuItem.icon || 'Menu'" />
```

**现在**（正常工作）：

```vue
<AppIcon :icon="menuItem.icon" fallback="Menu" />
```

---

## 📝 注意事项

1. **静态图标**：对于固定的 UI 图标（如折叠按钮、搜索图标），继续使用 Element Plus 原生组件

2. **动态图标**：对于从后端获取的图标名称，必须使用 `AppIcon` 组件

3. **性能**：Iconify 图标完全按需加载，不会增加包体积

4. **向后兼容**：现有的 Element Plus 图标名称（如 "Grid"）继续有效

---

## 🔗 相关链接

- [Iconify 官网](https://iconify.design/)
- [Iconify 图标搜索](https://icon-sets.iconify.design/)
- [Element Plus 图标文档](https://element-plus.org/zh-CN/component/icon.html)

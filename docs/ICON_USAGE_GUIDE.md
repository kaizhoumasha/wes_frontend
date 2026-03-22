# 图标使用指南

项目统一使用 **Iconify** 图标系统，所有动态图标都必须传完整的 Iconify 名称。

---

## 📦 安装状态

| 包名                    | 状态      | 版本    |
| ----------------------- | --------- | ------- |
| @iconify/vue            | ✅ 已安装 | 4.3.0   |
| @element-plus/icons-vue | ✅ 已安装 | 2.3.2   |
| lucide-vue-next         | ✅ 已安装 | 0.577.0 |

---

## 🎯 使用场景

### 1️⃣ 动态图标

使用 `AppIcon` 组件，适用于菜单、按钮等图标名称来自配置或后端数据的场景。

```vue
<script setup lang="ts">
import AppIcon from '@/components/ui/AppIcon.vue'

const menuItem = {
  title: '示例页面',
  icon: 'ep:grid' // 或 'lucide:package'
}
</script>

<template>
  <AppIcon :icon="menuItem.icon" :size="20" />
</template>
```

### 2️⃣ 静态图标

固定的 UI 图标仍然可以直接使用 Element Plus 原生组件。

```vue
<script setup lang="ts">
import { Fold } from '@element-plus/icons-vue'
</script>

<template>
  <el-icon :size="20">
    <Fold />
  </el-icon>
</template>
```

---

## 🎨 命名规范

统一格式：

```text
<图标集>:<图标名>
```

| 图标集       | 前缀      | 示例                            |
| ------------ | --------- | ------------------------------- |
| Element Plus | `ep:`     | `ep:grid`, `ep:user`            |
| Lucide       | `lucide:` | `lucide:package`, `lucide:info` |

不再支持旧格式：

```text
Grid
EditPen
User
```

这些值必须显式写成：

```text
ep:grid
ep:edit-pen
ep:user
```

---

## 📋 常用示例

```vue
<AppIcon icon="ep:grid" />
<AppIcon icon="ep:menu" />
<AppIcon icon="ep:setting" />
<AppIcon icon="lucide:circle-alert" />
```

---

## 📊 数据示例

```json
{
  "name": "device",
  "title": "设备管理",
  "icon": "ep:grid"
}
```

```json
{
  "name": "user",
  "title": "用户管理",
  "icon": "ep:user"
}
```

---

## ⚙️ AppIcon API

| 属性     | 类型               | 默认值      | 说明                           |
| -------- | ------------------ | ----------- | ------------------------------ |
| icon     | `string \| null`   | `null`      | 图标名称，仅支持 Iconify 格式  |
| size     | `number \| string` | `20`        | 图标大小（像素）               |
| fallback | `string`           | `'ep:menu'` | 未指定图标时使用的默认 Iconify |

示例：

```vue
<AppIcon icon="ep:grid" />
<AppIcon icon="lucide:package" :size="24" class="text-cyan-500" />
<AppIcon :icon="null" fallback="ep:document" />
```

---

## 📝 注意事项

1. `AppIcon` 只接受完整的 Iconify 名称。
2. 当前系统离线内置 `ep:*` 和 `lucide:*` 两套图标，后端和前端配置应使用这两类值。
3. 颜色通过外部 `class` 或 CSS 控制，不提供 `color` prop。
4. 运行时不会请求远程 Iconify，适合局域网无外网部署。
5. 如果要新增其他前缀，必须先把对应图标集打进前端并在 `src/components/ui/iconify.ts` 注册。

---

## 🔗 相关链接

- [Iconify 官网](https://iconify.design/)
- [Iconify 图标搜索](https://icon-sets.iconify.design/)
- [Element Plus 图标文档](https://element-plus.org/zh-CN/component/icon.html)

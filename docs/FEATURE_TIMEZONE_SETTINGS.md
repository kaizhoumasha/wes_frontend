# 时区设置功能集成指南

## 功能概述

在用户菜单中添加了时区设置入口，用户可以快速访问和切换时区偏好。

## 实现内容

### 1. AppHeader 用户菜单更新

**文件**: `src/components/common/AppHeader.vue`

**新增功能**:

- ✅ 时区设置菜单项（带时区标签显示）
- ✅ 时区设置对话框（弹窗形式）
- ✅ 实时时区标签显示（浏览器时区/用户时区/无标签）

### 2. 用户菜单结构

```
用户头像下拉菜单:
├── 🕐 时区设置 [New!]
│   └── 显示当前时区标签（如 "浏览器时区"、"New York"）
├── 👤 个人资料
├── 💻 会话管理
└── 🚪 退出登录
```

### 3. 时区标签显示逻辑

| 状态               | 显示标签                | 说明       |
| ------------------ | ----------------------- | ---------- |
| **浏览器时区模式** | "浏览器时区"            | 蓝色标签   |
| **用户自定义时区** | 城市名（如 "New York"） | 蓝色标签   |
| **应用默认时区**   | 无标签                  | 不显示标签 |

## 使用流程

### 步骤 1: 打开时区设置

1. 点击右上角用户头像
2. 选择 "🕐 时区设置"
3. 打开时区设置对话框

### 步骤 2: 选择时区

在对话框中有三种模式：

**模式 1: 自定义时区**

- 从下拉列表选择时区
- 17 个常用时区可选
- 支持搜索过滤

**模式 2: 浏览器时区**

- 自动检测浏览器时区
- 适合移动设备或旅行用户

**模式 3: 应用默认**

- 使用 Asia/Shanghai 时区
- 服务器默认时区

### 步骤 3: 查看效果

**时间预览**:

- UTC 时间: `2024-01-01 12:00:00 UTC`
- 本地时区: 实时显示转换后时间

**全局生效**:

- 所有表格时间列自动使用新时区
- 表单提交时间自动转换
- 设置持久化保存

## 代码示例

### 显示时区标签

```typescript
import { useTimezoneStore } from '@/stores/timezone'

const timezoneStore = useTimezoneStore()

// 获取时区标签
const timezoneLabel = computed(() => {
  if (timezoneStore.useBrowserTimezone) {
    return '浏览器时区'
  }
  if (timezoneStore.userTimezone) {
    const city = timezoneStore.userTimezone.split('/').pop()
    return city?.replace('_', ' ')
  }
  return null
})
```

### 打开时区设置对话框

```typescript
const dialogVisible = ref(false)

function handleTimezoneCommand() {
  dialogVisible.value = true
}
```

## 界面预览

### 用户菜单

```
┌─────────────────────────────┐
│  [头像] Admin  ▼            │
└─────────────────────────────┘
           ↓ 点击
┌─────────────────────────────┐
│ 🕐 时区设置      [New York] │
│ 👤 个人资料                  │
│ 💻 会话管理                  │
│ ─────────────────────────   │
│ 🚪 退出登录                  │
└─────────────────────────────┘
```

### 时区设置对话框

```
┌─────────────────────────────┐
│        时区设置              │
├─────────────────────────────┤
│ 时区模式:                   │
│ ○ 自定义时区                │
│ ○ 浏览器时区（自动检测）     │
│ ○ 应用默认时区               │
│                             │
│ 选择时区: [下拉选择器]       │
│                             │
│ 当前时区: America/New_York   │
│                             │
│ 时间预览:                   │
│ UTC 时间: 2024-01-01 12:00:00│
│ 本地时区: 2024-01-01 07:00:00│
│                             │
│            [确定] [取消]     │
└─────────────────────────────┘
```

## 多时区场景演示

### 场景: 全球工厂用户

**服务器**: 中国 (Asia/Shanghai UTC+8)

**台湾工厂用户**:

- 选择时区: `Asia/Taipei`
- 看到时间: `2024-01-01 20:00:00`
- 菜单显示: `[Taipei]`

**纽约工厂用户**:

- 选择时区: `America/New_York`
- 看到时间: `2024-01-01 07:00:00`
- 菜单显示: `[New York]`

**自动检测用户**:

- 选择模式: 浏览器时区
- 看到时间: 自动根据浏览器时区显示
- 菜单显示: `[浏览器时区]`

## 技术实现

### 组件依赖

```typescript
import { useTimezoneStore } from '@/stores/timezone'
import TimezoneSettings from './TimezoneSettings.vue'
```

### 状态管理

```typescript
// 对话框状态
const timezoneDialogVisible = ref(false)

// 时区标签
const currentTimezoneLabel = computed(() => {
  // 根据时区模式返回不同标签
})
```

### 事件处理

```typescript
const handleUserMenuCommand = (command: string) => {
  switch (command) {
    case 'timezone':
      timezoneDialogVisible.value = true
      break
    // ...
  }
}
```

## 样式定制

### 暗黑模式时区标签

```css
html.dark .timezone-tag {
  background: rgb(0 243 255 / 15%);
  border-color: rgb(0 243 255 / 30%);
  color: rgb(0 243 255 / 90%);
}
```

### 亮模式时区标签

```css
html:not(.dark) .timezone-tag {
  background: #ecf5ff;
  border-color: #409eff;
  color: #409eff;
}
```

## 测试清单

- [ ] 点击用户菜单，能看到 "时区设置" 选项
- [ ] 时区标签正确显示（浏览器时区/城市名）
- [ ] 点击 "时区设置" 打开对话框
- [ ] 对话框能正常关闭
- [ ] 切换时区后，表格时间列实时更新
- [ ] 刷新页面后，时区设置保持不变
- [ ] 时区标签样式在亮/暗模式下正常显示

## 后续优化建议

### 短期优化

1. 添加时区设置快捷键（如 `Ctrl + T`）
2. 在页面底部显示当前时区提示
3. 添加时区切换动画效果

### 长期优化

1. 支持后端用户时区存储（多设备同步）
2. 根据IP地址自动建议时区
3. 添加时区转换工具（计算不同时区时间）

## 相关文档

- [多时区用户指南](./TIMEZONE_MULTI_USER_GUIDE.md)
- [时区处理技术文档](./TIMEZONE_HANDLING.md)
- [时区工具 API](../src/utils/timezone.ts)
- [时区 Store](../src/stores/timezone.ts)

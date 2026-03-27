# 工业仓储风格迁移指南

本文档指导你如何将现有的科技青色设计迁移到新的工业仓储风格。

---

## 变更概述

| 项目   | 旧值             | 新值                    | 说明           |
| ------ | ---------------- | ----------------------- | -------------- |
| 主色   | `#00f3ff` (青色) | `#F59E0B` (琥珀/安全黄) | 更符合仓储行业 |
| 成功色 | `#0f8` (青绿)    | `#16A34A` (信号绿)      | 交通灯标准     |
| 危险色 | `#f56c6c` (浅红) | `#DC2626` (安全红)      | 更醒目         |
| 警告色 | `#e6a23c` (土黄) | `#EAB308` (警示黄)      | 更鲜明         |
| 字体   | System Default   | Inter + JetBrains Mono  | 现代+数据感    |

---

## CSS 变量映射

### 颜色变量

```css
/* 旧变量 → 新变量 */
#00f3ff (科技青)    →  var(--color-primary)      #F59E0B
#0f8 (青绿)         →  var(--color-success)      #16A34A
#f56c6c (浅红)      →  var(--color-danger)       #DC2626
#e6a23c (土黄)      →  var(--color-warning)      #EAB308
rgb(0 243 255 / x)  →  rgba(245, 158, 11, x)    琥珀透明
```

### 使用示例

```css
/* 旧写法 */
html.dark .login-page {
  background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%);
}

html.dark .stat-card {
  border: 1px solid rgb(0 243 255 / 10%);
}

/* 新写法 */
html.dark .login-page {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
}

html.dark .stat-card {
  border: 1px solid var(--border-color); /* rgba(245, 158, 11, 0.15) */
}
```

---

## Tailwind 类名映射

| 旧类名                | 新类名                                 | 说明     |
| --------------------- | -------------------------------------- | -------- |
| `text-primary`        | `text-primary-500` 或 `text-amber-500` | 主色文字 |
| `bg-primary`          | `bg-primary-500` 或 `bg-amber-500`     | 主色背景 |
| `shadow-glow`         | `shadow-amber-glow`                    | 琥珀发光 |
| `shadow-success-glow` | `shadow-green-glow`                    | 绿色发光 |
| `text-success`        | `text-success` 或 `text-green-600`     | 成功色   |
| `bg-surface`          | `bg-industrial-dark-surface`           | 深色表面 |

### 新的实用类

```html
<!-- 工业风格卡片 -->
<div class="industrial-card">
  <h3 class="text-heading-3">标题</h3>
  <p class="text-body text-secondary">内容</p>
</div>

<!-- 带状态条的卡片 -->
<div
  class="industrial-card-status"
  style="--status-color: var(--color-success)"
>
  <span class="industrial-badge industrial-badge-success">
    <span class="industrial-status-dot industrial-status-dot-success"></span>
    正常运行
  </span>
</div>

<!-- 工业按钮 -->
<button class="industrial-button">登录系统</button>

<!-- 工业输入框 -->
<input
  class="industrial-input"
  placeholder="请输入用户名"
/>

<!-- 数据字体 -->
<span class="font-data text-data-lg">48</span>
```

---

## 组件迁移示例

### 1. 统计卡片

**旧代码:**

```vue
<div class="stat-card">
  <div class="stat-icon" style="color: #00f3ff;">
    <Monitor />
  </div>
  <div class="stat-value" style="color: #fff;">48</div>
  <div class="stat-indicator up" style="color: #0f8;">+12%</div>
</div>
```

**新代码:**

```vue
<div class="industrial-card-status" style="--status-color: var(--color-success)">
  <div class="stat-icon text-primary">
    <Monitor />
  </div>
  <div class="stat-value text-data-lg font-data text-primary">48</div>
  <div class="industrial-badge industrial-badge-success">
    <ArrowUp class="w-3 h-3" />
    +12%
  </div>
</div>
```

### 2. 登录按钮

**旧代码:**

```vue
<button class="login-button" style="background: linear-gradient(135deg, #00f3ff 0%, #0f8 100%);">
  登录系统
</button>
```

**新代码:**

```vue
<button class="industrial-button">
  登录系统
</button>
```

### 3. 输入框

**旧代码:**

```vue
<input
  class="form-input"
  style="border: 1px solid rgb(0 243 255 / 20%); background: rgb(255 255 255 / 3%);"
/>
```

**新代码:**

```vue
<input class="industrial-input" />
```

### 4. 状态指示器

**旧代码:**

```vue
<div
  class="status-badge"
  style="background: rgb(0 255 136 / 8%); border: 1px solid rgb(0 255 136 / 20%); color: #0f8;"
>
  <span class="status-dot" style="background: #0f8;"></span>
  正常运行
</div>
```

**新代码:**

```vue
<span class="industrial-badge industrial-badge-success">
  <span class="industrial-status-dot industrial-status-dot-success industrial-status-dot-pulse"></span>
  正常运行
</span>
```

---

## 深色/浅色模式适配

新的 CSS 变量自动支持两种模式：

```css
/* 在组件中使用变量，自动适配 */
.my-component {
  background: var(--surface-bg);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

/* 无需再写两套样式 */
```

### 手动切换测试

```javascript
// 切换到暗黑模式
document.documentElement.classList.add('dark')

// 切换到亮色模式
document.documentElement.classList.remove('dark')
```

---

## 字体迁移

### 字体资源

字体资源已下载到本地 `src/assets/fonts/` 目录，支持内网环境无需外网访问。

**字体文件**:

- `Inter-*.woff2` - 正文和标题字体
- `JetBrainsMono-*.woff2` - 数据和等宽字体
- `fonts.css` - 字体加载配置

### 使用字体

字体通过 `globals.css` 自动加载，无需额外配置。

```vue
<!-- 正文 -->
<p class="font-sans text-body">普通文本</p>

<!-- 数据 -->
<span class="font-data text-data-lg">48</span>

<!-- 标签 -->
<label class="text-label">用户名</label>
```

### CSS 中使用

```css
/* 正文 */
font-family:
  'Inter',
  -apple-system,
  sans-serif;

/* 数据/等宽 */
font-family: 'JetBrains Mono', monospace;
font-variant-numeric: tabular-nums;
```

---

## Element Plus 主题覆盖

Element Plus 组件已自动应用新主题：

```javascript
// main.ts 中不需要额外配置
// 所有 Element Plus 组件会自动使用 CSS 变量
```

### 覆盖特定组件

如需覆盖特定组件的样式：

```vue
<style scoped>
/* 使用 CSS 变量覆盖 */
:deep(.el-button--primary) {
  --el-button-bg-color: var(--color-primary);
  --el-button-border-color: var(--color-primary);
}
</style>
```

---

## 快速迁移检查清单

- [ ] 更新 `tailwind.config.js`（已完成）
- [ ] 更新 `globals.css`（已完成）
- [ ] 在 `index.html` 添加字体链接
- [ ] 替换所有硬编码的 `#00f3ff` 为 `var(--color-primary)`
- [ ] 替换所有硬编码的 `#0f8` 为 `var(--color-success)`
- [ ] 替换所有硬编码的 `rgb(0 243 255 / x)` 为 `rgba(245, 158, 11, x)`
- [ ] 更新 Login.vue 中的样式
- [ ] 更新 Dashboard.vue 中的样式
- [ ] 测试深色/浅色模式切换
- [ ] 运行 `pnpm lint` 检查

---

## 兼容保留

为平滑迁移，以下旧变量仍然可用（但建议逐步替换）：

```javascript
// tailwind.config.js 中保留
'tech-cyan': {
  DEFAULT: '#00f3ff',  // 兼容旧代码
  // ...
}
```

---

## 迁移后的效果预览

运行以下命令查看效果：

```bash
pnpm dev
```

访问 `http://localhost:5173`，你应该看到：

1. 登录页背景变为深板岩色 (#0F172A)
2. 按钮和强调色变为工业琥珀色 (#F59E0B)
3. 成功状态使用信号绿色 (#16A34A)
4. 数据使用等宽字体 (JetBrains Mono)
5. 整体风格更具工业仓储感

---

## 故障排除

### 样式未生效

1. 检查是否正确导入 `globals.css`
2. 检查 `tailwind.config.js` 配置是否正确
3. 重启开发服务器 `pnpm dev`

### Element Plus 组件样式不对

确保在 `main.ts` 中正确导入样式：

```typescript
import 'element-plus/dist/index.css'
import '@/assets/styles/globals.css' // 确保在 Element Plus 之后导入
```

### 字体未加载

检查网络是否可访问 Google Fonts，或考虑使用本地字体文件。

---

## 设计系统文档

完整的设计规范请参考 `DESIGN.md`。

如有问题，请查阅 DESIGN.md 或联系开发团队。

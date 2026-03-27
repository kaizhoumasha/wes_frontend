# Design System — P9 WES 工业仓储风格

## Product Context

- **What this is:** P9 WES (休斯顿智能仓储执行系统) 前端界面
- **Who it's for:** 仓储管理人员、物流运营团队、仓库作业人员
- **Space/industry:** 智能仓储 / 物流执行 / 工业物联网 (IIoT)
- **Project type:** 企业级后台管理系统 / 仓储操作仪表盘

## Design Philosophy

### 美学方向: 工业精准风

融合仓储作业场景的视觉语言，强调**效率**、**可靠性**和**专业感**。设计语言借鉴：

- **安全标识系统**: 工业黄/警示色的功能性使用
- **仓储设备**: 货架网格、集装箱边框的结构性元素
- **作业流程**: 条形码、扫描线的信息传递隐喻
- **信号系统**: 红黄绿灯的状态指示传统

### 装饰层级: 有目的的表达

不同于极简主义的克制，也区别于科技风的繁复。工业仓储风格的装饰都有功能意义：

- 网格背景暗示货架结构
- 警示条纹强化安全意识
- 等宽字体强调数据属性

## Typography

### 字体选择

| 用途                | 字体            | 说明               |
| ------------------- | --------------- | ------------------ |
| **Display/Hero**    | Inter (700)     | 现代、清晰、专业   |
| **Body**            | Inter (400/500) | 良好的屏幕可读性   |
| **Data/Numbers**    | JetBrains Mono  | 等宽、对齐、技术感 |
| **Labels/Captions** | Inter (500)     | 统一性             |

### 字号层级

| 层级        | 大小    | 字重 | 用途                  |
| ----------- | ------- | ---- | --------------------- |
| **Display** | 48-64px | 700  | 品牌标题、登录页 Logo |
| **H1**      | 32px    | 700  | 页面主标题            |
| **H2**      | 24px    | 600  | 区块标题              |
| **H3**      | 18px    | 600  | 卡片标题              |
| **Body**    | 14-16px | 400  | 正文内容              |
| **Data**    | 14-32px | 600  | 统计数据、数值        |
| **Caption** | 12px    | 500  | 标签、辅助信息        |
| **Mono**    | 14px    | 400  | 代码、ID、版本号      |

### 字体规范

```css
/* 标题 */
font-family:
  'Inter',
  -apple-system,
  sans-serif;
letter-spacing: -0.02em;

/* 数据展示 */
font-family: 'JetBrains Mono', monospace;
font-variant-numeric: tabular-nums;

/* 标签/大写 */
text-transform: uppercase;
letter-spacing: 0.05em;
```

## Color System

### 主色调

| 颜色           | Hex       | 用途                     |
| -------------- | --------- | ------------------------ |
| **工业琥珀**   | `#F59E0B` | 主品牌色、主要按钮、强调 |
| **工业橙**     | `#EA580C` | 次要强调、悬停状态       |
| **工业琥珀深** | `#D97706` | 按钮激活、深色变体       |

### 语义色

| 颜色       | Hex       | 用途                     |
| ---------- | --------- | ------------------------ |
| **安全红** | `#DC2626` | 错误、紧急告警、危险状态 |
| **信号绿** | `#16A34A` | 成功、正常运行、安全状态 |
| **警示黄** | `#EAB308` | 警告、需要注意           |
| **信息蓝** | `#3B82F6` | 信息提示、链接           |

### 中性色

**深色模式:**
| 颜色 | Hex | 用途 |
|------|-----|------|
| **背景深** | `#0F172A` | 主背景 |
| **表面深** | `#1E293B` | 卡片、面板 |
| **边框深** | `#334155` | 分隔线、边框 |
| **文字主** | `#F8FAFC` | 主要文字 |
| **文字次** | `#94A3B8` | 次要文字 |
| **文字弱** | `#64748B` | 禁用、提示 |

**浅色模式:**
| 颜色 | Hex | 用途 |
|------|-----|------|
| **背景浅** | `#F8FAFC` | 主背景 |
| **表面浅** | `#FFFFFF` | 卡片、面板 |
| **边框浅** | `#E2E8F0` | 分隔线、边框 |
| **文字主** | `#0F172A` | 主要文字 |
| **文字次** | `#475569` | 次要文字 |
| **文字弱** | `#94A3B8` | 禁用、提示 |

### 色彩使用规则

1. **工业琥珀 (#F59E0B)** 用于:
   - 主要操作按钮
   - 关键数据高亮
   - 品牌标识
   - 当前激活状态

2. **语义色** 严格用于状态指示:
   - 绿色 = 正常/成功/安全
   - 黄色 = 警告/注意
   - 红色 = 错误/紧急

3. **边框颜色** 在深色模式使用琥珀色透明度:
   ```css
   border: 1px solid rgba(245, 158, 11, 0.2);
   ```

## Spacing

### 基础单位

以 **4px** 为基础单位，所有间距都是 4 的倍数。

### 间距刻度

| Token   | 值   | 用途                 |
| ------- | ---- | -------------------- |
| **xs**  | 4px  | 紧凑间距、图标间隙   |
| **sm**  | 8px  | 内联元素、小按钮     |
| **md**  | 16px | 默认间隙、卡片内边距 |
| **lg**  | 24px | 区块间距、表单组     |
| **xl**  | 32px | 大区块、卡片间距     |
| **2xl** | 48px | 页面边距、大区块分隔 |
| **3xl** | 64px | 英雄区、主要区块     |

### 布局规范

- **页面边距**: 24px (移动端) / 40px (桌面端)
- **最大宽度**: 1400px
- **卡片内边距**: 24px
- **表单组间距**: 24px
- **网格间隙**: 16-24px

## Layout

### 布局原则

**网格导向**: 布局借鉴货架网格结构，强调秩序和效率

### 布局模式

**登录页:**

```
┌─────────────────────────────────────────────────┐
│  [警示条纹]                                      │
├──────────────────┬──────────────────────────────┤
│                  │                              │
│   BRAND          │      LOGIN FORM              │
│   - Logo         │      - Username              │
│   - Title        │      - Password              │
│   - Features     │      - Submit Button         │
│                  │                              │
├──────────────────┴──────────────────────────────┤
│  [数据流动画]                                     │
└─────────────────────────────────────────────────┘
```

**仪表盘首页:**

```
┌─────────────────────────────────────────────────┐
│  WELCOME CARD                                   │
│  渐变标题 + 系统状态                              │
├───────┬───────┬───────┬─────────────────────────┤
│ STAT  │ STAT  │ STAT  │        STATUS           │
│ CARD  │ CARD  │ CARD  │        CARD             │
│       │       │       │                         │
├───────┴───────┴───────┴─────────────────────────┤
│  [其他内容区域]                                   │
└─────────────────────────────────────────────────┘
```

### 响应式断点

| 断点        | 宽度       | 调整               |
| ----------- | ---------- | ------------------ |
| **Mobile**  | < 768px    | 单列布局，简化装饰 |
| **Tablet**  | 768-1024px | 2列网格            |
| **Desktop** | > 1024px   | 完整布局           |

### 边框圆角

| Token    | 值     | 用途                     |
| -------- | ------ | ------------------------ |
| **sm**   | 4px    | 按钮、标签               |
| **md**   | 8px    | 输入框、小卡片           |
| **lg**   | 12px   | 卡片、面板               |
| **xl**   | 16px   | 大卡片、模态框           |
| **full** | 9999px | 完全圆形（头像、状态点） |

## Components

### 卡片

**统计卡片:**

- 顶部 3px 彩色边框条（语义色）
- 深色背景 (#1E293B) + 半透明
- 圆角 12px
- 内边距 24px
- 悬停：边框颜色加深

```css
.stat-card {
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(245, 158, 11, 0.15);
  border-radius: 12px;
  padding: 24px;
  position: relative;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--color-semantic); /* success/warning/danger/primary */
}
```

**欢迎卡片:**

- 渐变背景（琥珀色透明度渐变）
- 装饰性网格点

### 按钮

**主要按钮:**

- 背景：工业琥珀渐变
- 文字：深色 (#0F172A)
- 圆角：8px
- 高度：48px（标准）/ 40px（紧凑）
- 字体：大写、字间距 1px、字重 600
- 悬停：加深 + 阴影

```css
.btn-primary {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: #0f172a;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
}
```

**次要按钮:**

- 背景：透明
- 边框：1px solid 主色 20%
- 文字：主色

### 输入框

- 背景：rgba(255,255,255,0.03)（深色）/ #FFFFFF（浅色）
- 边框：1px solid 主色 20%
- 圆角：8px
- 高度：48px
- 聚焦：边框变为主色 + 发光阴影
- 标签：大写、等宽字体、小字号

```css
.input-group label {
  font-family: 'JetBrains Mono', monospace;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: 12px;
}
```

### 状态指示器

**状态徽章:**

- 圆角 6px
- 背景：语义色 10% 透明度
- 文字：语义色
- 包含状态点

```css
.badge-success {
  background: rgba(22, 163, 74, 0.1);
  color: #16a34a;
}
```

**状态点:**

- 大小：6-8px
- 圆形
- 带动画脉冲效果（关键状态）

## Motion

### 动画原则

**功能性优先**: 动画帮助理解，不分散注意力

### 动画时长

| 类型       | 时长      | 用途               |
| ---------- | --------- | ------------------ |
| **Micro**  | 50-100ms  | 按钮点击、颜色变化 |
| **Short**  | 150-250ms | 悬停效果、状态切换 |
| **Medium** | 250-400ms | 卡片展开、模态框   |
| **Long**   | 400-700ms | 页面过渡、复杂动画 |

### 缓动函数

```css
--ease-out: cubic-bezier(0, 0, 0.2, 1); /* 进入 */
--ease-in: cubic-bezier(0.4, 0, 1, 1); /* 退出 */
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1); /* 移动 */
```

### 具体动画

**卡片悬停:**

```css
transition:
  transform 0.3s ease-out,
  border-color 0.3s ease-out;
/* 悬停: translateY(-4px) + 边框高亮 */
```

**按钮悬停:**

```css
transition:
  transform 0.2s ease-out,
  box-shadow 0.2s ease-out;
/* 悬停: translateY(-2px) + 阴影 */
```

**状态点脉冲:**

```css
animation: pulse 2s ease-in-out infinite;
```

**输入框聚焦:**

```css
transition:
  border-color 0.2s ease-out,
  box-shadow 0.2s ease-out;
/* 聚焦: 边框变为主色 + glow shadow */
```

## Visual Elements

### 工业网格背景

```css
.industrial-grid {
  background-image:
    linear-gradient(rgba(245, 158, 11, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(245, 158, 11, 0.03) 1px, transparent 1px);
  background-size: 50px 50px;
}
```

### 警示条纹

顶部装饰条，用于重要区域标记：

```css
background: repeating-linear-gradient(90deg, #f59e0b 0px, #f59e0b 40px, #dc2626 40px, #dc2626 80px);
```

### 边框样式

**工业边框:**

- 1px solid 主色 20%
- 顶部可加 3px 彩色强调条

## Dark/Light Mode

### 切换策略

- 深色模式为默认（工业环境常用）
- 浅色模式作为备选
- 使用 `html.dark` 类名切换

### 关键差异

| 元素   | 深色模式             | 浅色模式           |
| ------ | -------------------- | ------------------ |
| 背景   | #0F172A              | #F8FAFC            |
| 卡片   | #1E293B              | #FFFFFF            |
| 主文字 | #F8FAFC              | #0F172A            |
| 边框   | rgba(245,158,11,0.2) | #E2E8F0            |
| 强调色 | 琥珀色               | 琥珀色（保持一致） |

## Implementation Notes

### Tailwind 配置

```javascript
// tailwind.config.js
colors: {
  industrial: {
    amber: '#F59E0B',
    orange: '#EA580C',
    'amber-dark': '#D97706',
  },
  safety: {
    red: '#DC2626',
    green: '#16A34A',
    yellow: '#EAB308',
  }
}
```

### Element Plus 主题覆盖

需要覆盖 Element Plus 的默认变量以匹配设计系统：

- `--el-color-primary`: #F59E0B
- `--el-color-success`: #16A34A
- `--el-color-warning`: #EAB308
- `--el-color-danger`: #DC2626

### 字体加载

```html
<link
  href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
  rel="stylesheet"
/>
```

## Decisions Log

| Date       | Decision                    | Rationale                                  |
| ---------- | --------------------------- | ------------------------------------------ |
| 2026-03-27 | 初始设计系统创建            | 从科技青色调转向工业仓储风格，强化行业属性 |
| 2026-03-27 | 工业琥珀 (#F59E0B) 作为主色 | 安全黄是仓储行业通用识别色，象征警示和效率 |
| 2026-03-27 | JetBrains Mono 用于数据     | 等宽字体便于数字对齐，强化工业数据感       |
| 2026-03-27 | 语义色采用交通灯系统        | 红黄绿是 universally understood 的状态指示 |
| 2026-03-27 | 深色模式为默认              | 工业环境多为室内/昏暗环境，深色更适合      |

---

_此设计系统由 /design-consultation 技能生成_
_基于工业仓储行业特点设计_

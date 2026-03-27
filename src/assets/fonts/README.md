# 本地字体资源

此目录包含工业仓储风格设计系统所需的字体文件，支持内网环境使用。

## 字体列表

### Inter

- **用途**: 正文、标题、UI 元素
- **字重**: Regular (400), Medium (500), SemiBold (600), Bold (700)
- **文件**:
  - `Inter-Regular.woff2`
  - `Inter-Medium.woff2`
  - `Inter-SemiBold.woff2`
  - `Inter-Bold.woff2`
  - `Inter-Italic.woff2`

### JetBrains Mono

- **用途**: 数据展示、代码、等宽内容
- **字重**: Regular (400), Medium (500), Bold (700)
- **文件**:
  - `JetBrainsMono-Regular.woff2`
  - `JetBrainsMono-Medium.woff2`
  - `JetBrainsMono-Bold.woff2`
  - `JetBrainsMono-Italic.woff2`

## 使用方式

字体通过 `fonts.css` 自动加载，无需额外配置。

在 CSS 中使用：

```css
/* 正文 */
font-family: 'Inter', sans-serif;

/* 数据/等宽 */
font-family: 'JetBrains Mono', monospace;
```

## 许可证

- **Inter**: SIL Open Font License 1.1
- **JetBrains Mono**: SIL Open Font License 1.1

## 来源

- Inter: https://github.com/rsms/inter
- JetBrains Mono: https://github.com/JetBrains/JetBrainsMono

## 内网部署说明

所有字体资源已打包在项目中，无需访问外网即可正常显示。
确保 `fonts.css` 和 `.woff2` 文件一同部署到内网环境。

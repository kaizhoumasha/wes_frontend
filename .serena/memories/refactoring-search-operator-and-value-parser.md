# 代码重构经验：SearchOperator 和值解析逻辑优化

## 背景

Gemini AI 对智能搜索代码进行了评审，提出了两个架构改进建议：

1. SearchOperator 相关定义集中管理
2. 值解析逻辑抽离为独立工具函数

## 实施过程

### 建议1: SearchOperator 集中管理

**问题**：`OPERATOR_MAP` 分散在 `search-compiler.ts` 中，与 `search.ts` 中的 `OPERATOR_LABELS` 分离，违反了高内聚原则。

**解决方案**：

- 将 `OPERATOR_MAP` 从 `search-compiler.ts` 移到 `search.ts`
- 重命名为 `OPERATOR_BACKEND_MAP`（更清晰的命名）
- 更新所有引用

**收益**：

- 所有 SearchOperator 相关定义集中在一个文件
- 添加/删除操作符时只需修改一个文件
- 防止类型定义和映射不一致

### 建议2: 值解析逻辑抽离

**问题**：`useSmartSearch.ts` 中的 `buildConditionFromField()` 函数包含了大量内联的值解析逻辑（布尔值、数值解析），违反了单一职责原则。

**解决方案**：

- 创建 `src/utils/search-value-parser.ts`
- 实现 `parseKeywordValue()` 主解析函数
- 实现 `parseBooleanValue()` 和 `parseNumberValue()` 专用函数
- 添加工具函数 `isBooleanString()` 和 `isNumericString()`

**收益**：

- 解析逻辑可被其他组件复用（如高级搜索表单）
- 纯函数更容易单元测试
- composable 更专注于状态管理
- 统一的错误处理格式

## 技术细节

### parseKeywordValue API

```typescript
interface ParsedValue {
  success: boolean
  value?: unknown
  error?: string
}

parseKeywordValue(keyword: string, dataType: SearchDataType): ParsedValue
```

**支持的布尔值格式**：

- 英文: true/false, yes/no, y/n
- 中文: 是/否
- 数字: 1/0

## 经验教训

### 1. 高内聚的重要性

- 相关的定义应该集中在同一个文件中
- 类型、常量、映射应该同步管理

### 2. 纯函数的价值

- 纯函数更容易测试和维护
- 解析逻辑应该独立于状态管理

### 3. 命名的清晰性

- `OPERATOR_BACKEND_MAP` 比 `OPERATOR_MAP` 更清晰
- 名字应该反映其用途和作用域

## 相关文件

- `src/types/search.ts` - SearchOperator 类型定义和常量
- `src/utils/search-value-parser.ts` - 值解析工具
- `src/composables/useSmartSearch.ts` - 搜索状态管理
- `src/utils/search-compiler.ts` - 搜索条件编译

## 后续优化方向

1. 为值解析器添加单元测试
2. 考虑支持更多数据类型（如日期范围解析）
3. 添加国际化支持（多语言布尔值）

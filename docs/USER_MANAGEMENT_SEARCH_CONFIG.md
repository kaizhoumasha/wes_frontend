# 用户管理模块搜索字段与收藏夹配置清单

> **项目**: P9 WES 前端项目  
> **模块**: 用户管理（`/admin/users`）  
> **能力主题**: 智能搜索首个业务试点  
> **文档版本**: v1.0  
> **创建日期**: 2026-03-07  
> **前置文档**: `docs/SMART_SEARCH_DESIGN_V1.md`、`docs/SMART_SEARCH_COMPONENT_ARCHITECTURE.md`、`docs/TASKS_SMART_SEARCH.md`

---

## 1. 文档目标

本文档用于定义“用户管理”页面接入智能搜索时所需的**业务级配置基线**，包括：

1. 搜索字段定义
2. 字段可用操作符
3. Popover 中栏快捷条件建议
4. 条件 Tag 文案规范
5. 收藏夹模板建议
6. 与后端查询协议的映射要求

该文档的定位是：

- 让智能搜索在用户管理页可以直接进入实现阶段
- 减少开发过程中反复讨论字段和交互细节的成本
- 作为后续角色管理、设备管理等模块的配置参考模板

---

## 2. 用户管理搜索目标

用户管理页的搜索目标，不是替代全部 CRUD 功能，而是帮助用户快速回答这些问题：

- 我想找到某个用户名或邮箱对应的账号
- 我想定位超级用户 / 多端登录用户
- 我想筛出一类特定账号集合
- 我想快速复用一些常见筛选场景

因此，本页搜索配置要优先支持：

- 文本字段快速模糊查找
- 布尔字段快速筛选
- 常见场景收藏夹
- 清晰可读的条件 Tag

---

## 3. 搜索字段范围

基于当前后端 `UserResponse` 与页面 P0 范围，用户管理首版搜索字段建议限定为以下 5 个：

| 字段 key         | 展示名称 | 类型      | 首版是否启用 | 说明         |
| ---------------- | -------- | --------- | ------------ | ------------ |
| `username`       | 用户名   | `text`    | ✅           | 核心标识字段 |
| `email`          | 邮箱     | `text`    | ✅           | 高频检索字段 |
| `full_name`      | 姓名     | `text`    | ✅           | 辅助检索字段 |
| `is_superuser`   | 超级用户 | `boolean` | ✅           | 高频状态筛选 |
| `is_multi_login` | 多端登录 | `boolean` | ✅           | 高频状态筛选 |

### 首版不纳入搜索字段

| 字段         | 原因                                                    |
| ------------ | ------------------------------------------------------- |
| `roles`      | 当前后端返回为数组对象，首版不适合直接做 Tag 级快速条件 |
| `created_at` | 首版先聚焦账号检索与状态筛选                            |
| `updated_at` | 可作为后续高级搜索扩展字段                              |
| `id`         | 对用户管理场景意义较低，不作为主搜索字段                |

---

## 4. 字段定义建议

## 4.1 推荐配置结构

```ts
const userSearchFields: SearchFieldDef[] = [
  {
    key: 'username',
    label: '用户名',
    dataType: 'text',
    searchable: true,
    defaultOperator: 'contains',
    quickOps: ['contains', 'equals', 'startsWith'],
    placeholder: '请输入用户名'
  },
  {
    key: 'email',
    label: '邮箱',
    dataType: 'text',
    searchable: true,
    defaultOperator: 'contains',
    quickOps: ['contains', 'equals', 'startsWith'],
    placeholder: '请输入邮箱地址'
  },
  {
    key: 'full_name',
    label: '姓名',
    dataType: 'text',
    searchable: true,
    defaultOperator: 'contains',
    quickOps: ['contains', 'equals', 'startsWith'],
    placeholder: '请输入姓名'
  },
  {
    key: 'is_superuser',
    label: '超级用户',
    dataType: 'boolean',
    searchable: true,
    defaultOperator: 'equals',
    quickOps: ['equals'],
    options: [
      { label: '是', value: true },
      { label: '否', value: false }
    ]
  },
  {
    key: 'is_multi_login',
    label: '多端登录',
    dataType: 'boolean',
    searchable: true,
    defaultOperator: 'equals',
    quickOps: ['equals'],
    options: [
      { label: '是', value: true },
      { label: '否', value: false }
    ]
  }
]
```

---

## 5. 各字段操作符规范

## 5.1 文本字段

适用字段：

- `username`
- `email`
- `full_name`

### 建议支持操作符

| 操作符       | 是否启用 | 用途                     |
| ------------ | -------- | ------------------------ |
| `contains`   | ✅       | 最常用模糊搜索           |
| `equals`     | ✅       | 精确匹配                 |
| `startsWith` | ✅       | 前缀匹配                 |
| `endsWith`   | ⏳ v2    | 次级能力，首版可不暴露   |
| `isEmpty`    | ⏳ v2    | 首版可以不对文本字段开放 |
| `notEmpty`   | ⏳ v2    | 首版可以不对文本字段开放 |
| `notEquals`  | ⏳ v2    | 低频，首版不优先         |

### 首版建议

主搜索的 Popover 中栏仅重点突出：

- 包含
- 等于
- 开头是

### 原因

- 这是最符合用户直觉的 3 个高频操作
- 足够覆盖用户名/邮箱检索场景
- 可以避免首版中栏候选项过多造成认知负担

---

## 5.2 布尔字段

适用字段：

- `is_superuser`
- `is_multi_login`

### 建议支持操作符

| 操作符      | 是否启用 | 用途               |
| ----------- | -------- | ------------------ |
| `equals`    | ✅       | 是 / 否            |
| `notEquals` | ⏳ v2    | 首版不需要单独暴露 |

### 首版建议

布尔字段在中栏不展示“操作符”概念，而直接展示语义化条件：

- 超级用户 = 是
- 超级用户 = 否
- 多端登录 = 是
- 多端登录 = 否

原因：

- 对业务用户更直观
- 避免展示抽象的运算符语言

---

## 6. Popover 左栏字段顺序建议

建议字段顺序如下：

1. 用户名
2. 邮箱
3. 姓名
4. 超级用户
5. 多端登录

### 排序依据

- 按使用频率优先
- 文本检索字段优先于状态字段
- 状态字段集中展示便于快速筛选

---

## 7. 主搜索框与 Popover 行为配置

## 7.1 主输入框键盘规则

- 输入焦点始终保留在主搜索框 input 内
- 用户输入任意 keyword 时，Popover 打开或保持打开
- `ArrowUp / ArrowDown`：切换左栏字段高亮，不移动输入焦点
- `Enter`：使用当前高亮字段的默认操作符生成条件
- `Escape`：关闭 Popover，不清空 keyword
- `Backspace`：当 keyword 为空时删除最后一个条件 Tag

### 关键约束

- 左栏承担“字段选择”职责
- 中栏承担“系统快捷预设”职责
- 中栏不与 keyword 发生联动

---

## 7.2 左栏字段可选规则

### 通用原则

- 文本字段：始终可选
- 布尔字段：当 keyword 可解析为布尔字面量时可选
- 数值字段：当 keyword 可解析为数值时可选
- 当前用户管理页无数值字段，因此数值 keyword 只会额外放开文本字段与布尔字段（若 keyword 同时命中布尔字面量）

### 布尔值解析建议

以下输入均应解析为布尔候选：

- `true` / `false`
- `1` / `0`
- `是` / `否`
- `y` / `n`（可选）

### 展示建议

- 左栏始终展示全部可搜索字段
- 对当前 keyword 不兼容的字段置灰
- 键盘高亮只在兼容字段中循环

---

## 7.3 用户输入示例

### 当 `keyword = 张` 时

可高亮字段：

- 用户名
- 邮箱
- 姓名

按 `Enter` 时的默认行为：

- `用户名` → 生成 `用户名包含 张`
- `邮箱` → 生成 `邮箱包含 张`
- `姓名` → 生成 `姓名包含 张`

### 当 `keyword = 张三` 时

用户可继续输入补全 keyword，左栏高亮规则保持不变。

### 当 `keyword = true` / `是` / `1` 时

可高亮字段：

- 用户名
- 邮箱
- 姓名
- 超级用户
- 多端登录

按 `Enter` 时的默认行为示例：

- `超级用户` → 生成 `超级用户 = 是`
- `多端登录` → 生成 `多端登录 = 是`

### 当 `keyword = false` / `否` / `0` 时

可高亮字段：

- 用户名
- 邮箱
- 姓名
- 超级用户
- 多端登录

按 `Enter` 时的默认行为示例：

- `超级用户` → 生成 `超级用户 = 否`
- `多端登录` → 生成 `多端登录 = 否`

### 当 `keyword = 123` 时

当前用户管理页首版由于没有独立数值字段，可高亮字段仍以文本字段为主；若后续页面增加数值字段，则应一并纳入键盘高亮候选集合。

---

## 7.4 中栏系统快捷预设建议

中栏必须由系统提供固定预设，不根据 keyword 动态生成。

### 首版推荐预设

1. 超级管理员
2. 可多端登录
3. 管理员账号
4. 企业邮箱用户
5. 最近 7 天登录（仅在确认后端与页面字段已支持时启用）

### 推荐配置结构

```ts
const userQuickPresets: QuickSearchPreset[] = [
  {
    id: 'superusers',
    label: '超级管理员',
    description: '快速筛出超级用户',
    conditions: [{ field: 'is_superuser', operator: 'equals', value: true, source: 'quick' }]
  },
  {
    id: 'multi-login-enabled',
    label: '可多端登录',
    description: '快速筛出允许多端登录的账号',
    conditions: [{ field: 'is_multi_login', operator: 'equals', value: true, source: 'quick' }]
  },
  {
    id: 'admin-accounts',
    label: '管理员账号',
    description: '快速定位常见管理员账号',
    conditions: [{ field: 'username', operator: 'contains', value: 'admin', source: 'quick' }]
  }
]
```

### 预设要求

- 预设名称必须业务化、可一眼理解
- 预设可生成 1 条或多条条件
- 预设条件应直接复用 `SearchCondition` 草稿协议

---

## 7.5 默认操作符映射

| 字段             | 默认操作符 | 说明               |
| ---------------- | ---------- | ------------------ |
| `username`       | `contains` | 最符合账号搜索直觉 |
| `email`          | `contains` | 兼容邮箱片段检索   |
| `full_name`      | `contains` | 兼容姓名模糊查找   |
| `is_superuser`   | `equals`   | 布尔字段固定走等于 |
| `is_multi_login` | `equals`   | 布尔字段固定走等于 |

### 默认操作符生成示例

| keyword | 字段             | 生成条件           |
| ------- | ---------------- | ------------------ |
| `张三`  | `full_name`      | `姓名包含 张三`    |
| `admin` | `username`       | `用户名包含 admin` |
| `true`  | `is_superuser`   | `超级用户 = 是`    |
| `0`     | `is_multi_login` | `多端登录 = 否`    |

---

## 8. 条件 Tag 文案规范

Tag 必须清晰、业务化、尽量避免技术术语。

## 8.1 文案模板

### 文本字段

| 操作符       | 文案模板               |
| ------------ | ---------------------- |
| `contains`   | `{字段名} 包含 {值}`   |
| `equals`     | `{字段名} 等于 {值}`   |
| `startsWith` | `{字段名} 开头是 {值}` |

### 布尔字段

| 操作符          | 文案模板        |
| --------------- | --------------- |
| `equals(true)`  | `{字段名} = 是` |
| `equals(false)` | `{字段名} = 否` |

## 8.2 用户管理页示例

- 用户名包含 `admin`
- 邮箱包含 `@corp.com`
- 姓名等于 `张三`
- 超级用户 = 是
- 多端登录 = 否

## 8.3 Tag 文案要求

- 不显示字段 key
- 不显示底层 operator 代码
- 不显示 `%value%` 这类协议细节
- 优先使用自然语言表达

---

## 9. 收藏夹模板建议

收藏夹的价值在于把高频查询场景直接产品化。

## 9.1 首版推荐收藏夹

### 收藏夹 1：管理员账号

**名称**: `管理员账号`

**建议条件**:

- 用户名包含 `admin`

**说明**:

- 这是最直观、最常见的账号查询场景

---

### 收藏夹 2：超级用户

**名称**: `超级用户`

**建议条件**:

- 超级用户 = 是

**说明**:

- 高频状态筛选场景

---

### 收藏夹 3：可多端登录用户

**名称**: `可多端登录用户`

**建议条件**:

- 多端登录 = 是

---

### 收藏夹 4：企业邮箱用户

**名称**: `企业邮箱用户`

**建议条件**:

- 邮箱包含 `@`

> 注：若后续确认公司统一域名，可替换为企业域名条件，例如 `@company.com`

---

## 9.2 收藏夹配置建议结构

```ts
const userSearchFavorites: SearchFavorite[] = [
  {
    id: 'admin_accounts',
    name: '管理员账号',
    conditions: [
      {
        id: 'preset_1',
        field: 'username',
        operator: 'contains',
        value: 'admin',
        label: '用户名包含 admin',
        source: 'favorite'
      }
    ]
  },
  {
    id: 'superusers',
    name: '超级用户',
    conditions: [
      {
        id: 'preset_2',
        field: 'is_superuser',
        operator: 'equals',
        value: true,
        label: '超级用户 = 是',
        source: 'favorite'
      }
    ]
  }
]
```

### 配置要求

- 收藏夹必须具备清晰业务语义
- 收藏夹名称优先面向业务用户，而不是开发者
- 条件数建议首版不超过 3 条，避免收藏夹过重

---

## 10. 高级搜索弹窗建议行为（用户管理场景）

在用户管理页中，高级搜索弹窗应支持以下新增条件方式：

### 文本字段新增

- 先选字段
- 再选操作符
- 再输入值
- 点击“添加条件”

### 布尔字段新增

- 先选字段
- 直接选择 是 / 否
- 添加条件

### 编辑已有条件

- 点击条件列表中的某条条件
- 右侧编辑器进入编辑态
- 修改后保存

### 批量清空

- 清空全部条件
- 主搜索框 Tag 同步清空
- 页面列表恢复默认查询

---

## 11. 与页面查询的联动要求

## 11.1 应用搜索时

- 页码必须重置到第 1 页
- 排序保持当前页面默认排序或当前活动排序
- `filters` 使用 `compileToFilterGroup()` 的输出

## 11.2 删除条件时

- 删除 Tag 后应立即重新查询
- 若删除后没有任何条件，应恢复默认列表查询

## 11.3 刷新时

- 保留当前条件
- 保留当前页码（是否保留第一页由页面策略决定）

### 用户管理页建议

- 搜索应用：回到第一页
- 普通刷新：保留当前页码

---

## 12. 首版不建议纳入的用户管理搜索项

以下需求虽然可能出现，但不建议在用户管理首版纳入：

### 12.1 角色搜索

原因：

- 当前 `roles` 为数组对象
- 需要额外定义映射与 UI 交互
- 容易使首版搜索复杂度明显上升

### 12.2 时间范围搜索

原因：

- 首版应先稳定主搜索框能力
- 日期范围搜索更适合在高级搜索弹窗第二阶段引入

### 12.3 多字段收藏夹编辑

原因：

- 收藏夹编辑管理不是首版核心闭环

---

## 13. 验收标准

## 13.1 配置正确性验收

- `userSearchFields` 覆盖当前用户管理 P0 范围所需字段
- `quickOps` 与字段类型一致
- 文本字段与布尔字段候选项明确且合理
- 收藏夹语义清晰

## 13.2 业务体验验收

- 用户可以通过主搜索框快速查用户名/邮箱
- 用户可以快速筛选超级用户、多端登录用户
- 用户可以通过收藏夹快速进入高频场景
- 条件 Tag 文案清晰易懂

## 13.3 工程验收

- 配置集中管理，不散落在多个页面组件中
- 与 `useSmartSearch` / 编译器协议一致
- 不额外定义页面私有搜索结构

---

## 14. 推荐下一步

建议在本配置清单确认后，继续进入：

1. **《智能搜索能力首批代码实现方案》**
2. 或直接开始第一批代码搭建：
   - `src/types/search.ts`
   - `src/utils/search-compiler.ts`
   - `src/composables/useSmartSearch.ts`

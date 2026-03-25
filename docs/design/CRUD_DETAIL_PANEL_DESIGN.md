# CRUD Detail Panel Design

> Updated on 2026-03-25
> Branch: feature/crud-refactor-v1.4
> Status: implemented

## Overview

CRUD 详情面板为列表页提供只读详情查看能力。

- 桌面端默认使用右侧 `Drawer`
- 移动端自动切换为全屏 `Dialog`
- 内容通过配置驱动生成
- 当前只支持显式 `fields` 和 `relation` 两种 section 内容来源

这份文档描述的是当前仓库里的真实实现，不再保留早期草案中的未落地能力。

## Scope

已实现：

- `drawer` / `dialog` 两种展示模式
- `title`、`width`、`emptyValue`、`responsive` 配置
- section 分组、视觉权重、折叠
- 字段展示与内置 formatter
- 关联数据展示：`list` / `tags` / `table`
- 底部 actions、`popconfirm`、成功后的提示与自动关闭
- 容器层集成：列表行“查看详情”动作 + `CrudPageContainer` 挂载详情面板

明确不在当前实现范围内：

- `page` 模式
- 自定义 slot section
- `timeline` relation
- detail header 独立配置
- detail 级 `animation` / `onError` 扩展接口
- `defineDetailConfig()` 工厂函数

## Main Files

```text
src/components/common/crud-page/
├── types.ts
├── useCrudPageController.ts
└── detail/
    ├── index.ts
    ├── types.ts
    ├── CrudDetailPanel.vue
    ├── CrudDetailBody.vue
    ├── CrudDetailSection.vue
    ├── CrudDetailField.vue
    ├── CrudDetailActions.vue
    └── composables/
        ├── useDetailState.ts
        └── useDetailResponsive.ts
```

## Data Flow

```text
table row action
    │
    ├── useCrudPageController
    │   └── open detail state / trigger fetch
    │
    └── CrudPageContainer
        └── CrudDetailPanel
            ├── CrudDetailBody
            │   └── CrudDetailSection[]
            │       ├── fields -> CrudDetailField
            │       └── relation -> tags / table / list
            └── CrudDetailActions
```

说明：

- “查看详情”动作由 `useCrudPageController` 注入，不在通用 `buildDefaultRowActions()` 里自动生成。
- `CrudPageContainer` 负责把 `detailState`、`fetcher` 和受控 props 传给 `CrudDetailPanel`。
- `CrudDetailPanel` 负责 Drawer/Dialog 切换，不再在模板里重复 loading/error/empty/content 结构，主体内容由 `CrudDetailBody` 统一承载。

## Type Surface

### `CrudPageConfig`

`src/components/common/crud-page/types.ts` 为 CRUD 页面总配置增加了：

```ts
detail?: CrudPageDetailConfig<TItem>
```

### `CrudPageDetailConfig`

当前实现支持：

```ts
export interface CrudPageDetailConfig<TItem extends CrudPageEntity> {
  mode?: 'drawer' | 'dialog'
  width?: number | string
  title?: string | ((item: TItem) => string)
  sections?: CrudPageDetailSection<TItem>[]
  showActions?: boolean
  actions?: CrudPageDetailAction<TItem>[]
  emptyValue?: {
    text?: string
    icon?: string
    dash?: boolean
  }
  responsive?: {
    mobile?: {
      mode: 'drawer' | 'bottomSheet' | 'fullScreen'
      sections?: 'all' | 'primaryOnly'
    }
    tablet?: {
      width: number
    }
  }
}
```

### `CrudPageDetailSection`

```ts
export interface CrudPageDetailSection<TItem extends CrudPageEntity> {
  title?: string
  icon?: string
  weight?: 'primary' | 'secondary' | 'tertiary'
  variant?: 'card' | 'flat' | 'outlined' | 'filled'
  collapsible?: boolean
  defaultCollapsed?: boolean
  fields?: CrudPageDetailField<TItem>[]
  showWhen?: (item: TItem) => boolean
  relation?: {
    type: 'list' | 'tags' | 'table'
    data: (item: TItem) => unknown[] | Promise<unknown[]>
    columns?: Array<{ key: string; label: string }>
    emptyText?: string
    onError?: (error: Error) => void
  }
}
```

### `CrudPageDetailAction`

```ts
export interface CrudPageDetailAction<TItem extends CrudPageEntity> {
  key: string
  label: string
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  icon?: string
  loading?: boolean
  disabled?: boolean | ((item: TItem) => boolean)
  showWhen?: (item: TItem) => boolean
  onClick: (item: TItem) => void | Promise<void>
  popconfirm?: {
    title: string
    message?: string
    confirmButtonText?: string
    cancelButtonText?: string
    confirmButtonType?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
    width?: number
  }
  success?: {
    message?: string
    autoClose?: boolean
    autoCloseDelay?: number
  }
}
```

## Example

```ts
import type { CrudPageDetailConfig } from '@/components/common/crud-page/detail/types'
import type { User } from '@/api/modules/user'

export const USER_PAGE_DETAIL: CrudPageDetailConfig<User> = {
  mode: 'drawer',
  width: 680,
  title: user => user.username,
  sections: [
    {
      title: '基本信息',
      weight: 'primary',
      fields: [
        { key: 'username', label: '用户名', layout: 'half' },
        { key: 'email', label: '邮箱', layout: 'half' }
      ]
    },
    {
      title: '角色信息',
      weight: 'secondary',
      relation: {
        type: 'tags',
        data: user => user.roles ?? [],
        emptyText: '无角色'
      }
    }
  ]
}
```

## Implementation Notes

### 1. Section rendering is explicit

当前 section 只允许两种内容来源：

- `fields`
- `relation`

这样可以保持边界清晰，避免再引入隐藏 slot 契约。

### 2. Row action ownership

“查看详情”不是通用 CRUD action helper 的职责。

- 通用 helper 只产出通用 CRUD 动作
- controller 在存在 `config.detail` 时显式 prepend `view-detail` action

这能避免 helper 反向感知 detail feature。

### 3. Shared body rendering

`CrudDetailPanel` 的 Drawer 和 Dialog 只负责容器差异。

共同的以下状态统一放在 `CrudDetailBody`：

- loading
- error
- empty
- content

### 4. Current risk points

当前实现需要重点关注：

- 首次打开详情时应优先展示权威详情数据，而不是列表行快照
- relation 异步加载必须避免旧请求覆盖新实体
- detail field formatter 应尽量与现有共享 formatter 语义保持一致

## Validation

当前功能提交前至少应通过：

```bash
pnpm run type:check
pnpm run lint:all
```

目前仓库没有独立 detail 模块测试基建，详情面板的回归主要依赖：

- `vue-tsc`
- ESLint / Prettier / Stylelint
- 人工联调验证列表页打开、刷新、切换实体、移动端显示

## Follow-ups

如后续要扩展 detail 模块，优先顺序建议如下：

1. 补充自动化测试基建
2. 收敛 detail formatter 与共享 formatter 的复用边界
3. 只在真实业务需求出现后再评估是否引入新 relation 类型
4. 如需 slot 能力，优先设计显式 API，不要回到 `provide/inject + string slot name` 的隐式协议

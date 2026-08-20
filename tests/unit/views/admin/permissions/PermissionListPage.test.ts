import { describe, expect, it } from 'vitest'
import { resolveCrudPageFeatures } from '@/components/common/crud-page/helpers/features'
import { createPermissionPageConfig } from '@/views/admin/permissions/config/pageConfig'

describe('PermissionListPage', () => {
  it('keeps the generated permission catalog readonly while retaining read capabilities', () => {
    const config = createPermissionPageConfig()
    const features = resolveCrudPageFeatures(config.features)
    const requestAdapter = config.resource.requestAdapter as typeof config.resource.requestAdapter & {
      tree?: (query?: unknown, config?: unknown) => Promise<unknown>
    }

    expect({
      create: features.create.enabled,
      edit: features.edit.enabled,
      delete: features.delete.enabled,
      batchDelete: features.batchDelete.enabled,
      trash: features.trash.enabled,
      restore: features.restore.enabled,
      batchRestore: features.batchRestore.enabled,
      permanentDelete: features.permanentDelete.enabled,
      batchPermanentDelete: features.batchPermanentDelete.enabled,
      move: features.move.enabled,
      sort: features.sort.enabled,
      createChild: features.createChild.enabled
    }).toEqual({
      create: false,
      edit: false,
      delete: false,
      batchDelete: false,
      trash: false,
      restore: false,
      batchRestore: false,
      permanentDelete: false,
      batchPermanentDelete: false,
      move: false,
      sort: false,
      createChild: false
    })
    expect(features.refresh).toBe(true)
    expect(config.detail).toBeDefined()
    expect(config.resource.treeMode?.enabled).toBe(true)
    expect(typeof config.resource.requestAdapter.getById).toBe('function')
    expect(typeof config.resource.requestAdapter.query).toBe('function')
    expect(typeof requestAdapter.tree).toBe('function')
    expect(config.resource.title.subtitle).toBe('查看后端路由生成的 API 权限目录')
  })
})

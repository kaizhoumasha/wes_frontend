import { describe, expect, it, vi } from 'vitest'
import { createUserPageConfig } from '@/views/admin/users/config/pageConfig'
import { createRolePageConfig } from '@/views/admin/roles/config/pageConfig'
import { createDevicePageConfig } from '@/views/admin/devices/config/pageConfig'
import { createWorkLinePageConfig } from '@/views/admin/worklines/config/pageConfig'
import { createAPIApplicationPageConfig } from '@/views/admin/api-applications/config/pageConfig'
import { createAuditLogPageConfig } from '@/views/logs/audit/config/pageConfig'
import { createAPIAccessLogPageConfig } from '@/views/logs/api-access/config/pageConfig'

function hasTrashCapability(
  value: unknown
): value is { getTrash: (...args: unknown[]) => unknown } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'getTrash' in value &&
    typeof (value as { getTrash?: unknown }).getTrash === 'function'
  )
}

describe('capability configs', () => {
  it('soft-delete admin pages enable trash feature and expose getTrash capability on request adapters', () => {
    const configs = [
      createUserPageConfig(
        () => undefined,
        () => undefined
      ),
      createRolePageConfig(),
      createDevicePageConfig(),
      createWorkLinePageConfig(vi.fn(), vi.fn()),
      createAPIApplicationPageConfig()
    ]

    for (const config of configs) {
      expect(config.features?.trash).toEqual(expect.objectContaining({ enabled: true }))
      expect(hasTrashCapability(config.resource.requestAdapter)).toBe(true)
    }
  })

  it('readonly log pages disable write and trash features', () => {
    const configs = [createAuditLogPageConfig(), createAPIAccessLogPageConfig()]

    for (const config of configs) {
      expect(config.features?.create).toBe(false)
      expect(config.features?.edit).toBe(false)
      expect(config.features?.delete).toBe(false)
      expect(config.features?.batchDelete).toBe(false)
      expect(config.features?.trash).toBe(false)
      expect(config.features?.restore).toBe(false)
      expect(config.features?.batchRestore).toBe(false)
      expect(config.features?.permanentDelete).toBe(false)
      expect(config.features?.batchPermanentDelete).toBe(false)
      expect(hasTrashCapability(config.resource.requestAdapter)).toBe(false)
    }
  })
})

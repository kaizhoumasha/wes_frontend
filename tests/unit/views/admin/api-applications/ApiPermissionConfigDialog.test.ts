import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { applicationsApiMethods } from '@/api/modules/applications'
import { CRUD_PAGE_REFRESH_KEY } from '@/components/common/crud-page/types'
import ApiPermissionConfigDialog from '@/views/admin/api-applications/components/ApiPermissionConfigDialog.vue'

const StandardDialogStub = defineComponent({
  template: '<section role="dialog"><slot /></section>'
})

describe('ApiPermissionConfigDialog', () => {
  it('does not expose or call the retired runtime permission sync endpoint', () => {
    const wrapper = mount(ApiPermissionConfigDialog, {
      props: {
        app: null
      },
      global: {
        directives: {
          loading: () => undefined
        },
        provide: {
          [CRUD_PAGE_REFRESH_KEY as symbol]: vi.fn()
        },
        stubs: {
          AppIcon: true,
          ElInput: true,
          StandardDialog: StandardDialogStub
        }
      }
    })

    const buttonLabels = wrapper.findAll('button').map(button => button.text().trim())

    expect(buttonLabels).not.toContain('同步权限')
    expect('availablePermissionsSync' in applicationsApiMethods).toBe(false)
  })
})

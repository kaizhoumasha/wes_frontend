import { computed, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ADMIN_PERMISSIONS } from '@/api/generated/permissions'
import type { ResetUserPasswordInput, User } from '@/api/modules/user'
import { userApi } from '@/api/modules/user'
import type { CrudPageRowAction } from '@/components/common/crud-page/types'
import { usePermission } from '@/composables/usePermission'

export function createUserRowActions(): CrudPageRowAction<User>[] {
  const { hasPermission } = usePermission()
  const resettingPasswordUserId = ref<number | null>(null)
  const canResetPassword = computed(() => hasPermission(ADMIN_PERMISSIONS.user.resetPassword))

  async function handleResetPassword(user: User) {
    try {
      const { value } = await ElMessageBox.prompt(
        `请输入用户「${user.username}」的新密码`,
        '重置密码',
        {
          confirmButtonText: '确认重置',
          cancelButtonText: '取消',
          inputType: 'password',
          inputPlaceholder: '请输入 6-100 位新密码',
          closeOnClickModal: false,
          inputValidator: inputValue => {
            if (!inputValue) {
              return '请输入新密码'
            }

            if (inputValue.length < 6 || inputValue.length > 100) {
              return '密码长度需为 6-100 位'
            }

            return true
          }
        }
      )

      const payload: ResetUserPasswordInput = {
        new_password: value
      }

      resettingPasswordUserId.value = user.id
      await userApi.resetPassword(user.id, payload)
      ElMessage.success(`已重置用户「${user.username}」的密码`)
    } catch (error) {
      if (error === 'cancel' || error === 'close') {
        return
      }

      throw error
    } finally {
      resettingPasswordUserId.value = null
    }
  }

  return [
    {
      key: 'reset-password',
      label: '重置密码',
      type: 'warning',
      disabled: () => !canResetPassword.value,
      loading: user => resettingPasswordUserId.value === user.id,
      onClick: user => void handleResetPassword(user)
    }
  ]
}

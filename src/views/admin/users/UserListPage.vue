<template>
  <CrudPageContainer :config="config">
    <template #extra-dialogs>
      <AssignRolesDialog
        v-model="assignRolesDialogVisible"
        :user="selectedUser"
      />
      <ResetPasswordDialog
        v-model="resetPasswordDialogVisible"
        :user="selectedUser"
      />
    </template>
  </CrudPageContainer>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CrudPageContainer from '@/components/common/CrudPageContainer.vue'
import AssignRolesDialog from './components/AssignRolesDialog.vue'
import ResetPasswordDialog from './components/ResetPasswordDialog.vue'
import { createUserPageConfig } from './config/pageConfig'
import type { UsersItem as User } from '@/api/modules/users'

// 分配角色对话框状态
const assignRolesDialogVisible = ref(false)
const resetPasswordDialogVisible = ref(false)
const selectedUser = ref<User | null>(null)

function openAssignRolesDialog(user: User) {
  selectedUser.value = user
  assignRolesDialogVisible.value = true
}

function openResetPasswordDialog(user: User) {
  selectedUser.value = user
  resetPasswordDialogVisible.value = true
}

const config = createUserPageConfig(openAssignRolesDialog, openResetPasswordDialog)
</script>

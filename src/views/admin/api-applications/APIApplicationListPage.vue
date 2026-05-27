<template>
  <div>
    <CrudPageContainer :config="config" />
    <ApiCredentialResultDialog
      v-model="credentialDialogVisible"
      :app-id="credentialAppId"
      :app-secret="credentialAppSecret"
      :app-name="credentialAppName"
      :is-reset="credentialIsReset"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import CrudPageContainer from '@/components/common/CrudPageContainer.vue'
import ApiCredentialResultDialog from './components/ApiCredentialResultDialog.vue'
import { createAPIApplicationPageConfig } from './config/pageConfig'
import { applicationsApiMethods } from '@/api/modules/applications'
import type {
  ApplicationsItem as APIApplication,
  CreateApplicationsInput as CreateAPIApplicationInput,
  UpdateApplicationsInput as UpdateAPIApplicationInput
} from '@/api/modules/applications'
import type { CrudPageConfig } from '@/components/common/crud-page/types'
import { getSafeErrorMessage } from '@/utils/string'

type APIApplicationPageConfig = CrudPageConfig<APIApplication, CreateAPIApplicationInput, UpdateAPIApplicationInput>

// 凭证展示对话框状态
const credentialDialogVisible = ref(false)
const credentialAppId = ref('')
const credentialAppSecret = ref('')
const credentialAppName = ref('')
const credentialIsReset = ref(false)

function showCredential(result: Record<string, unknown>, appName: string, isReset: boolean) {
  const appSecret = result.app_secret as string | undefined
  const appId = result.app_id as string | undefined
  if (!appSecret) return

  credentialAppId.value = appId || ''
  credentialAppSecret.value = appSecret
  credentialAppName.value = appName
  credentialIsReset.value = isReset
  credentialDialogVisible.value = true
}

function handleCreateResult(result: Record<string, unknown>) {
  const appName = result.app_name as string | undefined
  showCredential(result, appName || '', false)
}

async function openResetSecretDialog(app: APIApplication) {
  try {
    const data = await applicationsApiMethods.resetSecret({ id: app.id }).send() as Record<string, string> | undefined
    if (data?.app_secret) {
      showCredential(
        { app_secret: data.app_secret, app_id: app.app_id },
        app.app_name,
        true
      )
    } else {
      ElMessage.error('密钥重置失败，未返回新密钥')
    }
  } catch (e: unknown) {
    ElMessage.error(`重置密钥失败：${getSafeErrorMessage(e)}`)
  }
}

const baseConfig = createAPIApplicationPageConfig(openResetSecretDialog)

const config: APIApplicationPageConfig = {
  ...baseConfig,
  resource: {
    ...baseConfig.resource,
    onCreateResult: handleCreateResult
  }
}
</script>

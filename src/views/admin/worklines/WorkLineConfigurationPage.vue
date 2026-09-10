<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { onBeforeRouteLeave, onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router'
import { workLinesApiMethods, type WorkLinesItem } from '@/api/modules/workLines'
import { BIZ_PERMISSIONS } from '@/api/generated/permissions'
import { usePermission } from '@/composables/usePermission'
import { getSafeErrorMessage } from '@/utils/string'
import WorkLineConfigurationWorkspace from './components/WorkLineConfigurationWorkspace.vue'

const route = useRoute()
const router = useRouter()
const { hasPermission } = usePermission()
const workline = ref<(Pick<WorkLinesItem, 'id'> & Partial<WorkLinesItem>) | null>(null)
const workspace = ref<InstanceType<typeof WorkLineConfigurationWorkspace> | null>(null)
const error = ref('')
const loading = ref(false)
let sequence = 0
const allowed = computed(() =>
  [BIZ_PERMISSIONS.workline.baseConfiguration, BIZ_PERMISSIONS.device.list].every(hasPermission)
)
async function load(): Promise<void> {
  const turn = ++sequence
  workline.value = null
  error.value = ''
  if (!allowed.value) return
  const id = Number(route.params.id)
  if (!Number.isSafeInteger(id) || id <= 0) {
    error.value = '工作线编号无效'
    return
  }
  loading.value = true
  try {
    const row = hasPermission(BIZ_PERMISSIONS.workline.detail)
      ? await workLinesApiMethods.getById(id).send()
      : { id }
    if (turn === sequence) workline.value = row
  } catch (reason) {
    if (turn === sequence) error.value = getSafeErrorMessage(reason)
  } finally {
    if (turn === sequence) loading.value = false
  }
}
watch(() => route.params.id, load, { immediate: true })
let leavingConfirmed = false
const confirmLeave = () => leavingConfirmed || (workspace.value?.confirmLeave() ?? true)
onBeforeRouteLeave(confirmLeave)
onBeforeRouteUpdate(confirmLeave)
function beforeUnload(event: BeforeUnloadEvent): void {
  if (workspace.value?.isDirty || workspace.value?.busy) {
    event.preventDefault()
    event.returnValue = ''
  }
}
window.addEventListener('beforeunload', beforeUnload)
onBeforeUnmount(() => {
  ++sequence
  window.removeEventListener('beforeunload', beforeUnload)
})
// Workspace 已确认离开；路由守卫仍负责浏览器后退和侧栏导航。
async function returnToList(): Promise<void> {
  leavingConfirmed = true
  try {
    await router.push({ name: 'WorkLineList' })
  } finally {
    leavingConfirmed = false
  }
}
</script>
<template>
  <div v-loading="loading">
    <ElAlert
      v-if="!allowed"
      title="当前账号没有工作线配置查看权限"
      type="info"
      :closable="false"
    />
    <div v-else-if="error">
      <ElAlert
        :title="error"
        type="error"
        :closable="false"
      />
      <ElButton @click="load">重新加载</ElButton>
    </div>
    <WorkLineConfigurationWorkspace
      v-else-if="workline"
      ref="workspace"
      :key="workline.id"
      :workline="workline"
      :model-value="true"
      @update:model-value="returnToList"
    />
  </div>
</template>

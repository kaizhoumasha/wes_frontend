<template>
  <CrudPageContainer :config="config">
    <template #extra-dialogs>
      <WorkLineStartDialog
        v-model="startDialogVisible"
        :workline="selectedWorkline"
      />
      <WorkLineArchivePickingTaskDialog
        v-model="archivePickingTaskDialogVisible"
        :workline="selectedWorkline"
        @archived="onArchived"
      />
    </template>
  </CrudPageContainer>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { usePermission } from '@/composables/usePermission'
import { workLinesApiMethods, type WorkLinesItem as Workline } from '@/api/modules/workLines'
import CrudPageContainer from '@/components/common/CrudPageContainer.vue'
import WorkLineStartDialog from './components/WorkLineStartDialog.vue'
import WorkLineArchivePickingTaskDialog from './components/WorkLineArchivePickingTaskDialog.vue'
import { createWorkLinePageConfig } from './config/pageConfig'

const selectedWorkline = ref<Workline | null>(null)
const router = useRouter()
const startDialogVisible = ref(false)
const archivePickingTaskDialogVisible = ref(false)

function openConfig(workline: Workline): void {
  void router.push({ name: 'WorkLineConfiguration', params: { id: workline.id } })
}

function openActivityMonitor(workline: Workline): void {
  void router.push({ name: 'WorkLineActivityMonitor', params: { id: workline.id } })
}

function openStart(workline: Workline): void {
  selectedWorkline.value = workline
  startDialogVisible.value = true
}

function openArchivePickingTask(workline: Workline): void {
  selectedWorkline.value = workline
  archivePickingTaskDialogVisible.value = true
}

function onArchived(payload: { worklineId: number; version: number }): void {
  if (selectedWorkline.value && selectedWorkline.value.id === payload.worklineId) {
    selectedWorkline.value.version = payload.version
  }
}

async function archiveOpenWork(workline: Workline): Promise<void> {
  const result = await workLinesApiMethods
    .archiveOpenWork({ id: workline.id }, { version: workline.version })
    .send()
  workline.version = result.version
  ElMessage.success(`清线完成，已归档 ${result.archived_total} 项未闭合业务任务`)
}

const { hasPermission } = usePermission()
const config = createWorkLinePageConfig(
  openConfig,
  openStart,
  archiveOpenWork,
  openArchivePickingTask,
  hasPermission,
  openActivityMonitor
)
</script>

<template>
  <CrudPageContainer :config="config">
    <template #extra-dialogs>
      <WorkLineStartDialog
        v-model="startDialogVisible"
        :workline="selectedWorkline"
      />
    </template>
  </CrudPageContainer>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { usePermission } from '@/composables/usePermission'
import type { WorkLinesItem as Workline } from '@/api/modules/workLines'
import CrudPageContainer from '@/components/common/CrudPageContainer.vue'
import WorkLineStartDialog from './components/WorkLineStartDialog.vue'
import { createWorkLinePageConfig } from './config/pageConfig'

const selectedWorkline = ref<Workline | null>(null)
const router = useRouter()
const startDialogVisible = ref(false)

function openConfig(workline: Workline): void {
  void router.push({ name: 'WorkLineConfiguration', params: { id: workline.id } })
}

function openStart(workline: Workline): void {
  selectedWorkline.value = workline
  startDialogVisible.value = true
}

const { hasPermission } = usePermission()
const config = createWorkLinePageConfig(openConfig, openStart, hasPermission)
</script>

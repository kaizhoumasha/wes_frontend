<template>
  <CrudPageContainer :config="config">
    <template #extra-dialogs>
      <WorkLineConfigurationDialog
        v-model="configDialogVisible"
        :workline="selectedWorkline"
      />
      <WorkLineStartDialog
        v-model="startDialogVisible"
        :workline="selectedWorkline"
      />
    </template>
  </CrudPageContainer>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { WorkLinesItem as Workline } from '@/api/modules/workLines'
import CrudPageContainer from '@/components/common/CrudPageContainer.vue'
import WorkLineConfigurationDialog from './components/WorkLineConfigurationDialog.vue'
import WorkLineStartDialog from './components/WorkLineStartDialog.vue'
import { createWorkLinePageConfig } from './config/pageConfig'

const selectedWorkline = ref<Workline | null>(null)
const configDialogVisible = ref(false)
const startDialogVisible = ref(false)

function openConfig(workline: Workline): void {
  selectedWorkline.value = workline
  configDialogVisible.value = true
}

function openStart(workline: Workline): void {
  selectedWorkline.value = workline
  startDialogVisible.value = true
}

const config = createWorkLinePageConfig(openConfig, openStart)
</script>

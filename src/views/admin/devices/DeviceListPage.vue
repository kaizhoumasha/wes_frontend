<template>
  <CrudPageContainer :config="config">
    <template #extra-dialogs="{ openCreate }">
      <DeviceDiscoveryDrawer
        ref="discoveryDrawerRef"
        v-model="discoveryDrawerOpen"
        :open-create="openCreate"
      />
    </template>
  </CrudPageContainer>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CrudPageContainer from '@/components/common/CrudPageContainer.vue'
import DeviceDiscoveryDrawer from './components/DeviceDiscoveryDrawer.vue'
import { createDevicePageConfig } from './config/pageConfig'

interface DeviceDiscoveryDrawerExpose {
  refreshAfterCreate: () => Promise<boolean>
}

const discoveryDrawerOpen = ref(false)
const discoveryDrawerRef = ref<DeviceDiscoveryDrawerExpose | null>(null)

function openDiscovery(): void {
  discoveryDrawerOpen.value = true
}

async function refreshDiscoveryAfterCreate(): Promise<void> {
  await discoveryDrawerRef.value?.refreshAfterCreate()
}

const baseConfig = createDevicePageConfig(openDiscovery)
const config = {
  ...baseConfig,
  resource: {
    ...baseConfig.resource,
    onCreateResult: refreshDiscoveryAfterCreate
  }
}
</script>

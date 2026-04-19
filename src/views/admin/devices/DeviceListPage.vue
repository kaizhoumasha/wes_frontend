<template>
  <CrudPageContainer :config="config" />
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import CrudPageContainer from '@/components/common/CrudPageContainer.vue'
import type { DevicesItem as Device } from '@/api/modules/devices'
import { createDevicePageConfig } from './config/pageConfig'

const router = useRouter()

function openRuntime(device: Device) {
  router.push({ name: 'RuntimeDevices', query: { deviceId: String(device.id) } })
}

function openTrace(device: Device) {
  router.push({ name: 'RuntimeTraceExplorer', query: { deviceId: String(device.id) } })
}

const config = createDevicePageConfig({
  openRuntime,
  openTrace,
})
</script>

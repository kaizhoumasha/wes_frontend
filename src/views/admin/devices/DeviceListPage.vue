<template>
  <CrudPageContainer :config="config" />
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import CrudPageContainer from '@/components/common/CrudPageContainer.vue'
import type { DevicesItem as Device } from '@/api/modules/devices'
import { createDevicePageConfig } from './config/pageConfig'

const router = useRouter()

function openRuntime(device: Device) {
  if (!device.work_line_id) {
    ElMessage.warning('该设备尚未绑定工作线，暂时无法进入线内设备监控')
    return
  }

  router.push({
    name: 'RuntimeDevices',
    query: { deviceId: String(device.id), worklineId: String(device.work_line_id) }
  })
}

function openTrace(device: Device) {
  router.push({
    name: 'RuntimeTraceExplorer',
    query: {
      deviceId: String(device.id),
      worklineId: device.work_line_id ? String(device.work_line_id) : undefined
    }
  })
}

const config = createDevicePageConfig({
  openRuntime,
  openTrace,
})
</script>

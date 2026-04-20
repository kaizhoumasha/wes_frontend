<template>
  <CrudPageContainer :config="config" />
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { BIZ_PERMISSIONS } from '@/api/generated/permissions'
import { usePermission } from '@/composables/usePermission'
import CrudPageContainer from '@/components/common/CrudPageContainer.vue'
import type { DevicesItem as Device } from '@/api/modules/devices'
import { buildRuntimeDeviceQuery, buildRuntimeTraceQuery } from '@/utils/runtime-route'
import { createDevicePageConfig } from './config/pageConfig'

const router = useRouter()
const { hasPermission } = usePermission()

function canOpenTrace() {
  return hasPermission(BIZ_PERMISSIONS.workline.page)
}

function openRuntime(device: Device) {
  if (!device.work_line_id) {
    ElMessage.warning('该设备尚未绑定工作线，暂时无法进入线内设备监控')
    return
  }

  router.push({
    name: 'RuntimeDevices',
    query: buildRuntimeDeviceQuery(device.id, device.work_line_id)
  })
}

function openTrace(device: Device) {
  if (!canOpenTrace()) {
    ElMessage.warning('你暂无工作线 Trace 查看权限，暂时无法进入 Trace 工作台')
    return
  }

  router.push({
    name: 'RuntimeTraceExplorer',
    query: buildRuntimeTraceQuery({
      deviceId: device.id,
      worklineId: device.work_line_id
    })
  })
}

const config = createDevicePageConfig({
  openRuntime,
  openTrace,
  canOpenTrace,
})
</script>

<template>
  <CrudPageContainer :config="config" />
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { BIZ_PERMISSIONS } from '@/api/generated/permissions'
import { usePermission } from '@/composables/usePermission'
import CrudPageContainer from '@/components/common/CrudPageContainer.vue'
import { devicesApiMethods, type DevicesItem as Device } from '@/api/modules/devices'
import { buildRuntimeWorklineQuery, buildRuntimeTraceQuery } from '@/utils/runtime-route'
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
    name: 'RuntimeWorklines',
    query: buildRuntimeWorklineQuery(device.work_line_id, device.id)
  })
}

function openTrace(device: Device) {
  if (!canOpenTrace()) {
    ElMessage.warning('你暂无工作线 Trace 查看权限，暂时无法进入 Trace 工作台')
    return
  }

  router.push({
    name: 'RuntimeWorklines',
    query: buildRuntimeTraceQuery({
      deviceId: device.id,
      worklineId: device.work_line_id
    })
  })
}

function applyRuntimeUpdate(device: Device, updated: Device | null | undefined) {
  if (updated) {
    Object.assign(device, updated)
  }
}

async function enterMaintenance(device: Device) {
  const updated = await devicesApiMethods
    .runtimeEnterMaintenance({ id: device.id }, { reason: 'MANUAL_MAINTENANCE' })
    .send()
  applyRuntimeUpdate(device, updated)
  ElMessage.success('设备已进入维护态')
}

async function exitMaintenance(device: Device) {
  const updated = await devicesApiMethods
    .runtimeExitMaintenance({ id: device.id }, { reason: 'MANUAL_RESUME' })
    .send()
  applyRuntimeUpdate(device, updated)
  ElMessage.success('设备已退出维护态')
}

async function clearFault(device: Device) {
  const updated = await devicesApiMethods
    .runtimeClearFault({ id: device.id }, { reason: 'MANUAL_CLEAR_FAULT' })
    .send()
  applyRuntimeUpdate(device, updated)
  ElMessage.success('设备故障已清除')
}

const config = createDevicePageConfig({
  openRuntime,
  openTrace,
  enterMaintenance,
  exitMaintenance,
  clearFault,
  canOpenTrace
})
</script>

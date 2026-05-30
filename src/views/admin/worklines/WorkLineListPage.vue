<template>
  <CrudPageContainer
    v-if="config"
    :key="containerKey"
    :config="config"
  />
</template>

<script setup lang="ts">
import { computed, onMounted, ref, shallowRef } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import CrudPageContainer from '@/components/common/CrudPageContainer.vue'
import type { WorkLinesItem as Workline } from '@/api/modules/workLines'
import { worklineApiMethods } from '@/api/modules/workline'
import { runtimeApiMethods } from '@/api/modules/runtime'
import { BIZ_PERMISSIONS } from '@/api/generated/permissions'
import { env } from '@/config/env'
import { usePermission } from '@/composables/usePermission'
import type { DebugDataCleanupResponse } from '@/types/runtime'
import { buildRuntimeWorklineQuery } from '@/utils/runtime-route'
import { getErrorMessage } from '@/utils/string'
import { createWorkLinePageConfig } from './config/pageConfig'

const router = useRouter()
const { hasPermission } = usePermission()
const containerKey = ref(0)
const isNonProd = computed(() => env.isNonProd)
const canCleanupDebugData = computed(
  () => isNonProd.value && hasPermission(BIZ_PERMISSIONS.workline.cleanupDebugData)
)

const ALL_DEBUG_DATA_CONFIRMATION = 'CLEAR-ALL-DEBUG-DATA'
const DEBUG_CLEANUP_COUNT_LABELS: Record<string, string> = {
  sessions: '业务会话',
  inboxes: 'Event',
  outboxes: '下发指令',
  commands: '设备命令',
  runtime_holds: 'Runtime Hold',
  ng_return_items: 'NG 回传',
  rack_operations: '料架操作',
  rack_tasks: '料架任务',
  handling_operations: '搬运操作',
  handling_moves: '搬运步骤',
  handling_steps: '搬运下发',
  bin_cell_reservations: '格口预约',
  timelines: '时间线',
  diagnostics: '诊断记录',
  dispatch_attempts: '派发尝试',
  safety_incidents: '安全事件',
  resource_state_events: '资源事实',
  rack_placements: '料架位置投影',
  rack_bin_mounts: '料箱挂架投影',
  bin_placements: '料箱位置投影',
  bin_material_mounts: '物料格位投影',
  bin_cell_occupancies: '格位占用投影',
  bin_content_snapshots: '料箱快照',
  bin_content_snapshot_items: '快照明细',
  callback_logs: '回调日志',
  wms_call_evidence: 'WMS 调用证据'
}

function openRuntime(workline: Workline) {
  router.push({ name: 'RuntimeMonitor', query: buildRuntimeWorklineQuery(workline.id) })
}

function openConfig(workline: Workline) {
  router.push({ name: 'WorkLineConfig', params: { id: workline.id.toString() } })
}

function isConfirmCancel(error: unknown) {
  return error === 'cancel' || error === 'close'
}

function getCleanupTotal(preview: DebugDataCleanupResponse) {
  return Object.values(preview.counts ?? {}).reduce((sum, count) => sum + count, 0)
}

function buildCleanupSummary(preview: DebugDataCleanupResponse) {
  const total = getCleanupTotal(preview)
  const lines = Object.entries(preview.counts ?? {})
    .filter(([, count]) => count > 0)
    .map(([key, count]) => `${DEBUG_CLEANUP_COUNT_LABELS[key] ?? key}: ${count}`)
    .join('\n')
  const affectedWorklines = preview.affected_workline_ids.length
  const affectedSessions = preview.affected_session_ids.length

  return [
    `预计清理 ${total} 条调试过程数据。`,
    `影响工作线: ${affectedWorklines} 条；影响 Session: ${affectedSessions} 条。`,
    lines,
    '只清理过程数据，工作线、设备、资源主数据、用户权限和配置会保留。'
  ]
    .filter(Boolean)
    .join('\n')
}

async function promptConfirmation(title: string, message: string, expectedValue: string) {
  const { value } = await ElMessageBox.prompt(message, title, {
    confirmButtonText: '确认清理',
    cancelButtonText: '取消',
    type: 'warning',
    inputPlaceholder: expectedValue,
    inputValidator: value => value === expectedValue || `请输入 ${expectedValue} 后继续`
  })
  return value
}

function reloadCrudPage() {
  containerKey.value += 1
}

async function cleanupDebugData(workline: Workline) {
  if (!canCleanupDebugData.value) return
  try {
    const preview = await runtimeApiMethods
      .debugDataCleanupWorkline(workline.id, { dry_run: true })
      .send()
    if (getCleanupTotal(preview) <= 0) {
      ElMessage.info(preview.message || '当前工作线没有可清理的调试过程数据')
      return
    }

    await promptConfirmation(
      `清理 ${workline.line_code} 过程数据`,
      buildCleanupSummary(preview),
      workline.line_code
    )
    const result = await runtimeApiMethods
      .debugDataCleanupWorkline(workline.id, {
        dry_run: false,
        confirmation: workline.line_code
      })
      .send()
    ElMessage.success(result.message || '调试过程数据已清理')
    reloadCrudPage()
  } catch (error: unknown) {
    if (isConfirmCancel(error)) return
    ElMessage.error(getErrorMessage(error, '清理调试过程数据失败'))
  }
}

async function cleanupAllDebugData(refresh: () => Promise<void>) {
  if (!canCleanupDebugData.value) return
  try {
    const preview = await runtimeApiMethods.debugDataCleanupAll({ dry_run: true }).send()
    if (getCleanupTotal(preview) <= 0) {
      ElMessage.info(preview.message || '当前没有可清理的调试过程数据')
      return
    }

    await promptConfirmation(
      '清理全部过程数据',
      buildCleanupSummary(preview),
      ALL_DEBUG_DATA_CONFIRMATION
    )
    const result = await runtimeApiMethods
      .debugDataCleanupAll({
        dry_run: false,
        confirmation: ALL_DEBUG_DATA_CONFIRMATION
      })
      .send()
    ElMessage.success(result.message || '全部调试过程数据已清理')
    await refresh()
  } catch (error: unknown) {
    if (isConfirmCancel(error)) return
    ElMessage.error(getErrorMessage(error, '清理全部调试过程数据失败'))
  }
}

const pageActions = {
  openRuntime,
  openConfig,
  cleanupDebugData,
  cleanupAllDebugData,
  isDebugCleanupVisible: () => canCleanupDebugData.value
}

const config = shallowRef<ReturnType<typeof createWorkLinePageConfig> | null>(null)

onMounted(async () => {
  try {
    const pluginOptions = await worklineApiMethods.options().send()
    config.value = createWorkLinePageConfig(pageActions, pluginOptions)
  } catch (error) {
    console.error('加载作业线插件选项失败:', error)
    ElMessage.error('加载作业线插件选项失败')
    config.value = createWorkLinePageConfig(pageActions)
  }
})
</script>

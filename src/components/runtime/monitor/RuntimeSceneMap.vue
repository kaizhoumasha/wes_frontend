<template>
  <div
    class="runtime-scene-map"
    data-test="runtime-scene-map"
  >
    <div class="runtime-scene-map__header">
      <div>
        <div class="runtime-scene-map__title">{{ model.worklineName }}</div>
        <div
          class="runtime-scene-map__meta"
          data-test="runtime-scene-readiness"
        >
          {{ model.worklineCode }} · {{ model.readinessLabel }} · {{ model.runtimeStatusLabel }}
        </div>
      </div>
      <div
        v-if="model.resourceEvidenceTruncated"
        class="runtime-scene-map__count"
        data-test="runtime-scene-truncated"
      >
        仅展示前 {{ model.resourceEvidence.length }} 条证据 / 共
        {{ model.resourceEvidenceTotalCount }} 条
      </div>
    </div>

    <div
      v-if="model.semanticFallback"
      class="runtime-scene-map__fallback"
      data-test="runtime-scene-fallback"
    >
      {{ model.semanticFallbackMessage }}
    </div>

    <div
      v-if="model.boundaries.length"
      class="runtime-scene-map__boundaries"
    >
      <section
        v-for="boundary in model.boundaries"
        :key="boundary.key"
        class="runtime-scene-map__boundary"
        data-test="runtime-scene-boundary"
      >
        <div class="runtime-scene-map__boundary-top">
          <span
            class="runtime-scene-map__role"
            data-test="runtime-scene-station-role"
          >
            {{ boundary.stationRole }}
          </span>
          <span class="runtime-scene-map__position">{{ boundary.positionCode }}</span>
        </div>
        <div class="runtime-scene-map__station">{{ boundary.stationCode }}</div>
        <div class="runtime-scene-map__boundary-grid">
          <span data-test="runtime-scene-station-lease">{{ boundary.stationLeaseLabel }}</span>
          <span data-test="runtime-scene-rack-snapshot">{{ boundary.rackSnapshotLabel }}</span>
          <span data-test="runtime-scene-rack-operation">
            {{ boundary.rackOperationWaitLabel }}
          </span>
          <span data-test="runtime-scene-evidence-kind">
            {{ boundary.resourceEvidenceKindLabel }}
          </span>
        </div>
        <div class="runtime-scene-map__boundary-foot">
          {{ boundary.rackKind }} · {{ boundary.evidenceCount }} 条结构化 evidence
        </div>
      </section>
    </div>

    <div class="runtime-scene-map__lane">
      <button
        v-for="device in model.deviceNodes"
        :key="device.id"
        type="button"
        class="runtime-scene-map__device"
        :class="{
          'is-selected': selectedDeviceId === device.id,
          'is-blocking': blockingDeviceId === device.id,
          'has-runtime-hold': hasRuntimeHold(device),
          'has-parked-outbox': device.blockedOutboxCount > 0
        }"
        data-test="runtime-scene-device"
        @click="emit('selectDevice', device.id)"
      >
        <div class="runtime-scene-map__device-top">
          <span class="runtime-scene-map__device-role">
            {{ device.deviceRole }} #{{ device.roleIndex }}
          </span>
          <span
            v-if="device.maintenanceMode"
            class="runtime-scene-map__device-maintenance"
          >
            维护
          </span>
        </div>
        <div class="runtime-scene-map__device-name">{{ device.deviceName }}</div>
        <div class="runtime-scene-map__device-code">{{ device.deviceCode }}</div>
        <div class="runtime-scene-map__device-status">{{ device.status }}</div>
        <div
          class="runtime-scene-map__device-signal"
          :class="signalClass(device)"
          data-test="runtime-scene-device-signal"
        >
          {{ signalText(device) }}
        </div>
        <div
          v-if="device.openCommandCount > 0"
          class="runtime-scene-map__device-badge"
          data-test="runtime-scene-device-open-command"
        >
          {{ device.openCommandCount }} 未完成命令
        </div>
        <div
          v-if="hasRuntimeHold(device)"
          class="runtime-scene-map__device-badge is-danger"
          data-test="runtime-scene-device-runtime-hold"
        >
          Runtime Hold {{ device.runtimeHoldCount }}
        </div>
        <div
          v-if="device.blockedOutboxCount > 0"
          class="runtime-scene-map__device-badge is-warning"
          data-test="runtime-scene-device-parked-outbox"
        >
          {{ device.blockedOutboxCount }} 已停靠
        </div>
        <div
          v-if="blockingDeviceId === device.id"
          class="runtime-scene-map__device-badge is-danger"
        >
          BLOCKED
        </div>
      </button>
    </div>

    <div
      v-if="model.resourceEvidence.length"
      class="runtime-scene-map__evidence"
    >
      <div
        v-for="item in model.resourceEvidence"
        :key="getRuntimeSceneEvidenceKey(item)"
        class="runtime-scene-map__evidence-item"
        data-test="runtime-scene-evidence-item"
      >
        <div class="runtime-scene-map__evidence-main">
          <span class="runtime-scene-map__resource-kind">{{ item.resourceKindLabel }}</span>
          <span class="runtime-scene-map__resource-code">{{ item.resourceCode }}</span>
        </div>
        <div class="runtime-scene-map__evidence-meta">
          {{ item.evidenceKindLabel }}
          <template v-if="item.positionCode">· {{ item.positionCode }}</template>
          <template v-if="item.sourceTraceId">· {{ item.sourceTraceId }}</template>
        </div>
      </div>
    </div>

    <div
      v-else
      class="runtime-scene-map__empty"
      data-test="runtime-scene-empty-evidence"
    >
      {{
        model.semanticFallback
          ? '暂无结构化资源证据，当前仅展示通用 evidence 兜底。'
          : '暂无结构化资源证据'
      }}
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  getRuntimeSceneEvidenceKey,
  type RuntimeSceneDeviceNode,
  type RuntimeSceneModel
} from '@/utils/runtime-scene'

const props = defineProps<{
  model: RuntimeSceneModel
  selectedDeviceId?: number | null
  sessionCountsByDevice?: Map<number, number> | Record<number, number>
  blockingDeviceId?: number | null
}>()

const emit = defineEmits<{
  selectDevice: [deviceId: number]
}>()

function getSessionCount(deviceId: number): number {
  const map = props.sessionCountsByDevice
  if (!map) return 0
  if (map instanceof Map) return map.get(deviceId) ?? 0
  return map[deviceId] ?? 0
}

function hasRuntimeHold(device: RuntimeSceneDeviceNode): boolean {
  return device.runtimeHoldCount > 0
}

function signalText(device: RuntimeSceneDeviceNode): string {
  if (device.errorCode) return `ERROR: ${device.errorCode}`
  if (hasRuntimeHold(device)) return '异常待处置'
  if (device.blockedOutboxCount > 0) return '等待设备空闲'
  const sessionCount = getSessionCount(device.id)
  if (sessionCount > 0) return `${sessionCount}条等待`
  if (device.currentCommandId) return '执行中'
  return '空闲'
}

function signalClass(device: RuntimeSceneDeviceNode): string {
  if (device.errorCode) return 'is-danger'
  if (hasRuntimeHold(device)) return 'is-danger'
  if (device.blockedOutboxCount > 0) return 'is-warning'
  const sessionCount = getSessionCount(device.id)
  if (sessionCount > 0) return 'is-warning'
  if (device.currentCommandId) return 'is-primary'
  return 'is-idle'
}
</script>

<style scoped>
.runtime-scene-map {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
}

.runtime-scene-map__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.runtime-scene-map__title {
  font-size: 16px;
  font-weight: 700;
  color: var(--runtime-text);
}

.runtime-scene-map__meta,
.runtime-scene-map__boundary-foot,
.runtime-scene-map__evidence-meta {
  margin-top: 4px;
  font-size: 12px;
  color: var(--runtime-text-muted);
}

.runtime-scene-map__count {
  flex: 0 0 auto;
  padding: 4px 8px;
  border-radius: 8px;
  background: rgb(245, 158, 11, 0.12);
  color: rgb(146, 64, 14);
  font-size: 12px;
  font-weight: 600;
}

.runtime-scene-map__fallback {
  padding: 10px 12px;
  border: 1px solid rgb(245, 158, 11, 0.32);
  border-radius: 8px;
  background: rgb(255, 251, 235);
  color: rgb(146, 64, 14);
  font-size: 12px;
  font-weight: 600;
}

.runtime-scene-map__boundaries {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 12px;
}

.runtime-scene-map__boundary {
  min-width: 0;
  padding: 12px;
  border: 1px solid rgb(15, 23, 42, 0.1);
  border-radius: 8px;
  background: rgb(255, 255, 255, 0.72);
}

.runtime-scene-map__boundary-top,
.runtime-scene-map__evidence-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.runtime-scene-map__role,
.runtime-scene-map__resource-kind {
  font-size: 12px;
  font-weight: 700;
  color: rgb(15, 23, 42);
}

.runtime-scene-map__position,
.runtime-scene-map__resource-code {
  min-width: 0;
  overflow-wrap: anywhere;
  font-size: 12px;
  color: rgb(71, 85, 105);
}

.runtime-scene-map__station {
  margin-top: 8px;
  overflow-wrap: anywhere;
  font-size: 14px;
  font-weight: 700;
  color: rgb(30, 41, 59);
}

.runtime-scene-map__boundary-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
  margin-top: 10px;
}

.runtime-scene-map__boundary-grid span {
  min-width: 0;
  padding: 5px 6px;
  border-radius: 6px;
  background: rgb(248, 250, 252);
  color: rgb(51, 65, 85);
  font-size: 11px;
  font-weight: 600;
  overflow-wrap: anywhere;
}

.runtime-scene-map__lane {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(160px, 1fr);
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.runtime-scene-map__device {
  min-height: 96px;
  padding: 10px;
  border: 1px solid rgb(59, 130, 246, 0.16);
  border-radius: 8px;
  background: rgb(248, 250, 252);
  text-align: left;
  cursor: pointer;
}

.runtime-scene-map__device:hover {
  border-color: rgb(59, 130, 246, 0.36);
}

.runtime-scene-map__device.is-selected {
  border-color: rgb(59, 130, 246, 0.62);
  background: rgb(239, 246, 255);
  box-shadow: 0 0 0 2px rgb(59, 130, 246, 0.12);
}

.runtime-scene-map__device.is-blocking {
  border-color: rgb(239, 68, 68, 0.52);
}

.runtime-scene-map__device.has-runtime-hold {
  border-color: rgb(239, 68, 68, 0.52);
}

.runtime-scene-map__device.has-parked-outbox {
  border-color: rgb(245, 158, 11, 0.48);
}

.runtime-scene-map__device-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.runtime-scene-map__device-role,
.runtime-scene-map__device-status {
  font-size: 11px;
  font-weight: 700;
  color: rgb(37, 99, 235);
}

.runtime-scene-map__device-maintenance {
  flex: 0 0 auto;
  padding: 2px 5px;
  border-radius: 6px;
  background: rgb(245, 158, 11, 0.12);
  color: rgb(146, 64, 14);
  font-size: 11px;
  font-weight: 700;
}

.runtime-scene-map__device-name {
  margin-top: 8px;
  overflow-wrap: anywhere;
  font-size: 13px;
  font-weight: 700;
  color: rgb(15, 23, 42);
}

.runtime-scene-map__device-code {
  margin-top: 4px;
  overflow-wrap: anywhere;
  font-size: 12px;
  color: rgb(71, 85, 105);
}

.runtime-scene-map__device-status {
  margin-top: 10px;
  color: rgb(71, 85, 105);
}

.runtime-scene-map__device-signal {
  display: inline-flex;
  margin-top: 8px;
  padding: 3px 6px;
  border-radius: 6px;
  background: rgb(226, 232, 240, 0.75);
  color: rgb(51, 65, 85);
  font-size: 11px;
  font-weight: 700;
}

.runtime-scene-map__device-signal.is-danger {
  background: rgb(239, 68, 68, 0.12);
  color: rgb(153, 27, 27);
}

.runtime-scene-map__device-signal.is-warning {
  background: rgb(245, 158, 11, 0.12);
  color: rgb(146, 64, 14);
}

.runtime-scene-map__device-signal.is-primary {
  background: rgb(59, 130, 246, 0.12);
  color: rgb(29, 78, 216);
}

.runtime-scene-map__device-badge {
  display: inline-flex;
  margin-top: 8px;
  margin-right: 6px;
  padding: 3px 6px;
  border-radius: 6px;
  background: rgb(245, 158, 11, 0.12);
  color: rgb(146, 64, 14);
  font-size: 11px;
  font-weight: 700;
}

.runtime-scene-map__device-badge.is-danger {
  background: rgb(239, 68, 68, 0.12);
  color: rgb(153, 27, 27);
}

.runtime-scene-map__device-badge.is-warning {
  background: rgb(245, 158, 11, 0.12);
  color: rgb(146, 64, 14);
}

.runtime-scene-map__evidence {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 8px;
}

.runtime-scene-map__evidence-item {
  min-width: 0;
  padding: 9px 10px;
  border: 1px solid rgb(15, 23, 42, 0.08);
  border-radius: 8px;
  background: rgb(255, 255, 255, 0.78);
}

.runtime-scene-map__empty {
  padding: 18px;
  border: 1px dashed rgb(148, 163, 184, 0.5);
  border-radius: 8px;
  color: var(--runtime-text-muted);
  text-align: center;
}
</style>

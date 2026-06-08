<template>
  <div class="trace-focus-panel">
    <!-- Header -->
    <div
      v-if="showHeader"
      class="trace-focus-panel__header"
    >
      <AppIconButton
        icon="lucide:arrow-left"
        :icon-size="16"
        size="small"
        plain
        class="trace-focus-panel__back"
        @click="emit('backToLive')"
      >
        <span>返回实时态势</span>
      </AppIconButton>
      <span
        v-if="pathData"
        class="trace-focus-panel__trace-id"
      >
        {{ tracePanelTitle }}
      </span>
    </div>

    <!-- Loading State -->
    <div
      v-if="loading"
      class="trace-focus-panel__skeleton"
    />

    <!-- Error State -->
    <div
      v-else-if="error"
      class="trace-focus-panel__error"
    >
      <svg
        class="trace-focus-panel__error-icon"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
          clip-rule="evenodd"
        />
      </svg>
      <span>{{ error }}</span>
      <el-button
        plain
        size="small"
        @click="loadPathData"
      >
        重试
      </el-button>
    </div>

    <template v-else-if="pathData">
      <!-- Priority 1: Problem Summary Card (NEW) -->
      <div
        v-if="pathData.blocking_reason"
        class="trace-focus-panel__summary"
        :class="summaryClass"
      >
        <div class="trace-focus-panel__summary-icon">
          <svg
            v-if="isBlockingTimeout"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
          <svg
            v-else
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
        </div>
        <div class="trace-focus-panel__summary-content">
          <div class="trace-focus-panel__summary-title">
            {{ blockingDeviceName }}
          </div>
          <div class="trace-focus-panel__summary-reason">
            {{ pathData.blocking_reason.reason }}
          </div>
          <div
            v-if="pathData.blocking_reason.detail"
            class="trace-focus-panel__summary-detail"
          >
            {{ pathData.blocking_reason.detail }}
          </div>
        </div>
        <div class="trace-focus-panel__summary-meta">
          <div
            class="trace-focus-panel__summary-status"
            :class="statusBadgeClass"
          >
            {{ statusBadgeText }}
          </div>
          <div
            v-if="blockingDuration"
            class="trace-focus-panel__summary-duration"
          >
            {{ blockingDuration }}
          </div>
        </div>
        <!-- Quick Actions -->
        <div class="trace-focus-panel__summary-actions">
          <el-button
            type="primary"
            size="small"
            @click="handleQuickAction('retry')"
          >
            <svg
              class="trace-focus-panel__btn-icon"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0V5.36l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z"
                clip-rule="evenodd"
              />
            </svg>
            重试
          </el-button>
          <el-button
            size="small"
            @click="handleQuickAction('skip')"
          >
            <svg
              class="trace-focus-panel__btn-icon"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                clip-rule="evenodd"
              />
            </svg>
            跳过
          </el-button>
        </div>
      </div>

      <!-- Priority 2: Trace Topology -->
      <el-card
        v-if="pathDevices.length"
        shadow="never"
        class="trace-focus-panel__topology"
      >
        <template #header>
          <div class="trace-focus-panel__topology-header">
            <div>
              <div class="trace-focus-panel__topology-title">
                <svg
                  class="trace-focus-panel__topology-icon"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M4.25 2A2.25 2.25 0 002 4.25v11.5A2.25 2.25 0 004.25 18h11.5A2.25 2.25 0 0018 15.5V4.25A2.25 2.25 0 0015.75 2H4.25zm4.03 6.28a.75.75 0 00-1.06-1.06L4.97 9.47a.75.75 0 000 1.06l2.25 2.25a.75.75 0 001.06-.06l.56-.56a.75.75 0 10-1.06-1.06l-.56.56-1.97 1.97a.75.75 0 001.06 1.06l1.97-1.97 1.97-1.97a.75.75 0 00-1.06-1.06l-.56.56-.56.56z"
                    clip-rule="evenodd"
                  />
                </svg>
                执行路径
              </div>
              <div class="trace-focus-panel__topology-subtitle">
                {{ pathDevices.length }} 台设备 · 点击查看动作详情
              </div>
            </div>
          </div>
        </template>

        <div class="trace-focus-panel__device-list">
          <div
            v-for="(node, idx) in pathDevices"
            :key="node.device_id"
            class="trace-focus-panel__device-card"
            :class="{
              'is-blocked': node.device_id === pathData.current_blocking_device_id,
              'is-current': node.is_current,
              'is-completed': idx < currentDeviceIndex
            }"
            @click="toggleDevice(node.device_id)"
          >
            <!-- Device Header -->
            <div class="trace-focus-panel__device-header">
              <div class="trace-focus-panel__device-index">
                <svg
                  v-if="idx < currentDeviceIndex"
                  class="trace-focus-panel__device-check"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                    clip-rule="evenodd"
                  />
                </svg>
                <svg
                  v-else-if="node.device_id === pathData.current_blocking_device_id"
                  class="trace-focus-panel__device-block-icon"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                    clip-rule="evenodd"
                  />
                </svg>
                <span v-else>{{ idx + 1 }}</span>
              </div>
              <div class="trace-focus-panel__device-info">
                <span class="trace-focus-panel__device-name">
                  {{
                    displayDevice({
                      device_name: node.device_name,
                      device_code: null,
                      device_id: node.device_id
                    })
                  }}
                </span>
                <span
                  v-if="node.is_current"
                  class="trace-focus-panel__device-badge"
                >
                  执行中
                </span>
                <span
                  v-if="node.device_id === pathData.current_blocking_device_id"
                  class="trace-focus-panel__device-badge trace-focus-panel__device-badge--blocked"
                >
                  阻塞
                </span>
              </div>
            </div>

            <!-- Device Actions (Expandable) -->
            <div
              v-if="expandedDeviceId === node.device_id && deviceActions(node).length"
              class="trace-focus-panel__device-actions"
            >
              <div
                v-for="(action, aIdx) in deviceActions(node)"
                :key="aIdx"
                class="trace-focus-panel__action-item"
              >
                <span
                  class="trace-focus-panel__action-icon"
                  :class="actionStatusClass(action.status)"
                >
                  {{ actionKindIcon(action.kind) }}
                </span>
                <span class="trace-focus-panel__action-kind">
                  {{ actionKindLabel(action.kind) }}
                </span>
                <span class="trace-focus-panel__action-label">
                  {{ action.label }}
                </span>
                <span
                  v-if="action.status"
                  class="trace-focus-panel__action-status"
                  :class="actionStatusClass(action.status)"
                >
                  {{ actionStatusLabel(action.status) }}
                </span>
                <span
                  v-if="action.timestamp"
                  class="trace-focus-panel__action-time"
                >
                  {{ formatRelativeTime(action.timestamp) }}
                </span>
              </div>
            </div>
            <div
              v-else-if="!deviceActions(node).length"
              class="trace-focus-panel__device-empty"
            >
              未参与执行
            </div>
            <div
              v-else
              class="trace-focus-panel__device-hint"
            >
              <svg
                class="trace-focus-panel__device-hint-icon"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                  clip-rule="evenodd"
                />
              </svg>
              {{ deviceActions(node).length }} 个动作
            </div>
          </div>
        </div>
      </el-card>

      <el-card
        shadow="never"
        class="trace-focus-panel__resource-card"
      >
        <template #header>
          <div class="trace-focus-panel__resource-header">
            <div>
              <div class="trace-focus-panel__resource-title">资源快照</div>
              <div class="trace-focus-panel__resource-subtitle">
                {{ resourceRacks.length }} 个货架 · {{ resourceBinCount }} 个料箱 ·
                {{ resourceCellCount }} 个格口
              </div>
            </div>
          </div>
        </template>

        <div
          v-if="resourceRacks.length"
          class="trace-focus-panel__resource-list"
        >
          <section
            v-for="(rack, rackIndex) in resourceRacks"
            :key="resourceRackKey(rack, rackIndex)"
            class="trace-focus-panel__resource-rack"
          >
            <div class="trace-focus-panel__resource-rack-header">
              <strong>{{ rack.rack_code || rack.rack_id || '未知货架' }}</strong>
              <span>{{ [rack.rack_kind, rack.rack_type].filter(Boolean).join(' · ') || '—' }}</span>
            </div>
            <div class="trace-focus-panel__resource-bin-list">
              <article
                v-for="(bin, binIndex) in rack.bins ?? []"
                :key="resourceBinKey(rack, rackIndex, bin, binIndex)"
                class="trace-focus-panel__resource-bin"
              >
                <div class="trace-focus-panel__resource-bin-header">
                  <span>
                    {{ bin.rack_slot_code || bin.rack_slot_location_code || '未绑定槽位' }}
                  </span>
                  <strong>{{ bin.bin_code || bin.bin_id || '未知料箱' }}</strong>
                </div>
                <div class="trace-focus-panel__resource-cell-list">
                  <span
                    v-for="(cell, cellIndex) in bin.cells ?? []"
                    :key="resourceCellKey(rackIndex, bin, binIndex, cell, cellIndex)"
                    class="trace-focus-panel__resource-cell"
                    :class="{ 'is-reserved': cell.is_reserved }"
                  >
                    {{ cell.bin_cell_code || cell.bin_cell_index || '格口' }}
                    <small v-if="cell.pkg_code || cell.material_identity_key">
                      {{ cell.pkg_code || cell.material_identity_key }}
                    </small>
                  </span>
                </div>
              </article>
            </div>
          </section>
        </div>
        <div
          v-else
          class="trace-focus-panel__resource-empty"
        >
          暂无资源快照
        </div>
      </el-card>

      <!-- Priority 3: Grouped Execution Timeline -->
      <el-card
        v-if="pathData"
        shadow="never"
        class="trace-focus-panel__timeline-card"
      >
        <template #header>
          <div class="trace-focus-panel__timeline-header">
            <div class="trace-focus-panel__timeline-title-row">
              <svg
                class="trace-focus-panel__timeline-icon"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z"
                  clip-rule="evenodd"
                />
              </svg>
              <span class="trace-focus-panel__timeline-title">执行时间轴</span>
              <span class="trace-focus-panel__timeline-count">
                {{ timelineGroupEventCount }} 条
              </span>
            </div>
            <div class="trace-focus-panel__timeline-filters">
              <el-checkbox
                v-model="showOnlyFailures"
                size="small"
              >
                只看失败
              </el-checkbox>
              <el-checkbox
                v-model="showOnlyCurrent"
                size="small"
              >
                只看当前
              </el-checkbox>
            </div>
          </div>
        </template>

        <div
          v-if="timelineGroups.length && filteredTimelineGroups.length"
          class="trace-focus-panel__timeline-groups"
        >
          <section
            v-for="group in filteredTimelineGroups"
            :key="group.group_key"
            class="trace-focus-panel__timeline-group"
            :class="{
              'is-current': group.is_current,
              'is-blocked': group.is_blocked
            }"
          >
            <div class="trace-focus-panel__timeline-group-header">
              <div>
                <div class="trace-focus-panel__timeline-group-title">
                  {{ group.display_name }}
                </div>
                <div class="trace-focus-panel__timeline-group-meta">
                  {{ groupTypeLabel(group.group_type) }} · {{ group.events.length }} 条事件
                </div>
              </div>
              <div class="trace-focus-panel__timeline-group-badges">
                <span
                  v-if="group.is_blocked"
                  class="trace-focus-panel__timeline-group-badge is-blocked"
                >
                  阻塞
                </span>
                <span
                  v-else-if="group.is_current"
                  class="trace-focus-panel__timeline-group-badge is-current"
                >
                  当前
                </span>
              </div>
            </div>

            <div class="trace-focus-panel__timeline-list">
              <div
                v-for="item in group.events"
                :key="item.id"
                class="trace-focus-panel__timeline-event"
                :class="{
                  'is-failure': item.status === 'FAILED',
                  'is-success': item.status === 'SUCCESS',
                  'is-expanded': expandedTimelineId === item.id
                }"
                @click="toggleTimelineDetail(item.id)"
              >
                <div class="trace-focus-panel__timeline-dot" />
                <div class="trace-focus-panel__timeline-content">
                  <div class="trace-focus-panel__timeline-main">
                    <span
                      class="trace-focus-panel__timeline-action"
                      :class="item.display_status_class"
                    >
                      {{ actionKindIcon(item.action_type) }}
                    </span>
                    <span class="trace-focus-panel__timeline-type">
                      {{ item.business_title }}
                    </span>
                    <span
                      class="trace-focus-panel__timeline-status"
                      :class="item.display_status_class"
                    >
                      {{ item.display_status_label }}
                    </span>
                    <span
                      v-if="item.duration_label"
                      class="trace-focus-panel__timeline-duration"
                    >
                      {{ item.duration_label }}
                    </span>
                  </div>

                  <div
                    v-if="item.business_detail"
                    class="trace-focus-panel__timeline-business-detail"
                  >
                    {{ item.business_detail }}
                  </div>

                  <div
                    v-if="item.event_payload_fields.length"
                    class="trace-focus-panel__timeline-event-data"
                  >
                    <span class="trace-focus-panel__timeline-event-data-label">扫码数据</span>
                    <span
                      v-for="field in item.event_payload_fields"
                      :key="`${field.label}-${field.value}`"
                      class="trace-focus-panel__timeline-event-data-chip"
                    >
                      <span class="trace-focus-panel__timeline-event-data-key">
                        {{ field.label }}
                      </span>
                      {{ field.value }}
                    </span>
                  </div>

                  <div
                    v-if="timelineHasStatusChange(item)"
                    class="trace-focus-panel__timeline-status-change"
                  >
                    <span
                      v-if="item.from_status"
                      class="trace-focus-panel__timeline-status-from"
                    >
                      {{ timelineStatusLabel(item.from_status) }}
                    </span>
                    <span class="trace-focus-panel__timeline-status-arrow">→</span>
                    <span
                      v-if="item.to_status"
                      class="trace-focus-panel__timeline-status-to"
                      :class="{ 'is-failed': item.status === 'FAILED' }"
                    >
                      {{ timelineStatusLabel(item.to_status) }}
                    </span>
                  </div>

                  <div
                    v-if="item.message"
                    class="trace-focus-panel__timeline-msg"
                    :class="{ 'is-error': item.status === 'FAILED' }"
                  >
                    {{ item.message }}
                    <span
                      v-if="item.failure_domain"
                      class="trace-focus-panel__timeline-failure-domain"
                    >
                      [{{ item.failure_domain }}]
                    </span>
                  </div>

                  <div
                    v-if="expandedTimelineId === item.id"
                    class="trace-focus-panel__timeline-detail"
                  >
                    <div class="trace-focus-panel__timeline-ref">
                      <div class="trace-focus-panel__timeline-ref-item">
                        <span class="trace-focus-panel__timeline-ref-label">技术事件</span>
                        <span class="trace-focus-panel__timeline-ref-value">
                          {{ item.technical_label }}
                        </span>
                      </div>
                      <div
                        v-if="item.actor_code"
                        class="trace-focus-panel__timeline-ref-item"
                      >
                        <span class="trace-focus-panel__timeline-ref-label">来源</span>
                        <span class="trace-focus-panel__timeline-ref-value">
                          {{ item.actor_code }}
                        </span>
                      </div>
                    </div>
                    <div
                      v-if="item.related_command_id || item.related_inbox_id"
                      class="trace-focus-panel__timeline-ref"
                    >
                      <div
                        v-if="item.related_command_id"
                        class="trace-focus-panel__timeline-ref-item"
                      >
                        <span class="trace-focus-panel__timeline-ref-label">命令ID</span>
                        <span class="trace-focus-panel__timeline-ref-value">
                          #{{ item.related_command_id }}
                        </span>
                      </div>
                      <div
                        v-if="item.related_inbox_id"
                        class="trace-focus-panel__timeline-ref-item"
                      >
                        <span class="trace-focus-panel__timeline-ref-label">事件ID</span>
                        <span class="trace-focus-panel__timeline-ref-value">
                          #{{ item.related_inbox_id }}
                        </span>
                      </div>
                    </div>
                    <div
                      v-if="item.payload_json"
                      class="trace-focus-panel__timeline-payload"
                    >
                      <span class="trace-focus-panel__timeline-ref-label">负载</span>
                      <pre class="trace-focus-panel__timeline-payload-content">{{
                        formatPayload(item.payload_json)
                      }}</pre>
                    </div>
                  </div>
                </div>

                <div class="trace-focus-panel__timeline-right">
                  <div class="trace-focus-panel__timeline-time">
                    {{ formatTime(item.occurred_at) }}
                  </div>
                  <svg
                    v-if="
                      item.related_command_id ||
                      item.related_inbox_id ||
                      item.payload_json ||
                      item.actor_code
                    "
                    class="trace-focus-panel__timeline-expand-icon"
                    :class="{ 'is-expanded': expandedTimelineId === item.id }"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                  >
                    <path
                      d="M4.427 7.427l3.396 3.396a.25.25 0 00.354 0l3.396-3.396A.25.25 0 0011.396 7H4.604a.25.25 0 00-.177.427z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </section>
        </div>
        <div
          v-else
          class="trace-focus-panel__timeline-empty"
        >
          <span>{{ timelineGroups.length ? '筛选后无结果' : '暂无执行时间轴证据' }}</span>
        </div>
      </el-card>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { runtimeApiMethods } from '@/api/modules/runtime'
import AppIconButton from '@/components/ui/AppIconButton.vue'
import { displayDevice } from '@/utils/runtime-display-identity'
import { formatRelativeTime } from '@/utils/timezone'
import type {
  RuntimeActiveBinRackBinView,
  RuntimeActiveBinRackCellView,
  RuntimeActiveBinRackView,
  RuntimeTraceDeviceAction,
  RuntimeTraceDevicePathNode,
  RuntimeTracePathResponse,
  RuntimeTraceTimelineGroup,
  TraceTimelineItem
} from '@/types/runtime'

type RuntimeTraceTimelineViewEvent = TraceTimelineItem & {
  business_title: string
  business_detail: string | null
  event_payload_fields: TimelinePayloadField[]
  display_status_class: string
  display_status_label: string
  duration_label: string | null
  technical_label: string
}

interface TimelinePayloadField {
  label: string
  value: string
}

type RuntimeTraceTimelineViewGroup = Omit<RuntimeTraceTimelineGroup, 'events'> & {
  events: RuntimeTraceTimelineViewEvent[]
}

const props = withDefaults(
  defineProps<{
    worklineId: number
    sessionId?: number | null
    traceId?: string | null
    showHeader?: boolean
  }>(),
  {
    sessionId: null,
    traceId: null,
    showHeader: true
  }
)

const emit = defineEmits<{
  backToLive: []
  headerChange: [title: string | null]
}>()

// State
const loading = ref(false)
const error = ref<string | null>(null)
const pathData = ref<RuntimeTracePathResponse | null>(null)
const expandedDeviceId = ref<number | null>(null)
const expandedTimelineId = ref<number | null>(null)
const showOnlyFailures = ref(false)
const showOnlyCurrent = ref(false)

let abortController: AbortController | null = null

// Timer for blocking duration
let durationTimer: ReturnType<typeof setInterval> | null = null
const currentDuration = ref(0)

// Cleanup
onBeforeUnmount(() => {
  abortController?.abort()
  if (durationTimer) {
    clearInterval(durationTimer)
  }
})

// Watch for changes
watch(
  () => [props.sessionId, props.traceId],
  () => {
    loadPathData()
  },
  { immediate: true }
)

// Computed properties
const tracePanelTitle = computed(() => {
  if (!pathData.value) return null
  return pathData.value.trace_id || `会话 #${pathData.value.session_id}`
})

watch(
  tracePanelTitle,
  title => {
    emit('headerChange', title)
  },
  { immediate: true }
)

const currentDeviceIndex = computed(() => {
  if (!pathData.value) return -1
  return pathDevices.value.findIndex(d => d.is_current)
})

const blockingDeviceName = computed(() => {
  if (!pathData.value?.blocking_reason?.device_id) return '未知设备'
  const device = pathDevices.value.find(
    d => d.device_id === pathData.value?.blocking_reason?.device_id
  )
  return displayDevice({
    device_name: device?.device_name,
    device_code: null,
    device_id: pathData.value.blocking_reason.device_id
  })
})

const isBlockingTimeout = computed(() => {
  const reason = pathData.value?.blocking_reason?.reason || ''
  return reason.includes('超时') || reason.includes('timeout')
})

const blockingDuration = computed(() => {
  if (!pathData.value?.blocking_reason?.detail) return ''
  // Extract duration from detail or use timer
  const detail = pathData.value.blocking_reason.detail
  if (detail.includes('等待')) {
    const match = detail.match(/(\d+)\s*(分钟|秒|min|sec)/i)
    if (match) {
      return `已等待 ${match[1]}${match[2]}`
    }
  }
  return ''
})

const summaryClass = computed(() => {
  if (isBlockingTimeout.value) return 'trace-focus-panel__summary--critical'
  return 'trace-focus-panel__summary--warning'
})

const statusBadgeClass = computed(() => {
  if (isBlockingTimeout.value) return 'trace-focus-panel__summary-status--critical'
  return 'trace-focus-panel__summary-status--warning'
})

const statusBadgeText = computed(() => {
  if (isBlockingTimeout.value) return '需立即处理'
  return '等待中'
})

const timelineGroups = computed(() => pathData.value?.timeline_groups ?? [])
const pathDevices = computed(() => pathData.value?.devices ?? [])
const resourceRacks = computed(() => pathData.value?.resource_view?.active_bin_racks ?? [])
const resourceBinCount = computed(() =>
  resourceRacks.value.reduce((total, rack) => total + (rack.bins?.length ?? 0), 0)
)
const resourceCellCount = computed(() =>
  resourceRacks.value.reduce(
    (total, rack) =>
      total + (rack.bins ?? []).reduce((binTotal, bin) => binTotal + (bin.cells?.length ?? 0), 0),
    0
  )
)

const timelineViewGroups = computed<RuntimeTraceTimelineViewGroup[]>(() =>
  timelineGroups.value.map(group => buildTimelineViewGroup(group)).sort(compareTimelineGroupDesc)
)
const timelineGroupEventCount = computed(() =>
  timelineViewGroups.value.reduce((total, group) => total + group.events.length, 0)
)

const filteredTimelineGroups = computed<RuntimeTraceTimelineViewGroup[]>(() => {
  let groups = timelineViewGroups.value

  if (showOnlyCurrent.value) {
    groups = groups
      .map(group => {
        if (group.is_current || group.is_blocked) return group
        if (group.group_type !== 'orchestrator') return { ...group, events: [] }
        return {
          ...group,
          events: group.events.filter(item => isSessionBoundaryAction(item.action_type))
        }
      })
      .filter(group => group.is_current || group.is_blocked || group.events.length > 0)
  }

  if (showOnlyFailures.value) {
    groups = groups
      .map(group => ({
        ...group,
        events: group.events.filter(item => item.status === 'FAILED')
      }))
      .filter(group => group.events.length > 0)
  }

  return groups
})

// Methods
async function loadPathData() {
  abortController?.abort()
  const controller = new AbortController()
  abortController = controller

  loading.value = true
  error.value = null
  pathData.value = null

  try {
    if (props.sessionId) {
      pathData.value = await runtimeApiMethods.sessionPath(props.sessionId).send()
    } else if (props.traceId) {
      pathData.value = await runtimeApiMethods.tracePath(props.traceId).send()
    }

    // Start duration timer if blocked
    if (pathData.value?.current_blocking_device_id) {
      startDurationTimer()
    }
  } catch (err: unknown) {
    if (controller.signal.aborted) return
    error.value = err instanceof Error ? err.message : '加载 Trace 路径失败'
  } finally {
    if (!controller.signal.aborted) loading.value = false
  }
}

function startDurationTimer() {
  if (durationTimer) clearInterval(durationTimer)
  currentDuration.value = 0
  durationTimer = setInterval(() => {
    currentDuration.value++
  }, 1000)
}

function toggleDevice(deviceId: number) {
  expandedDeviceId.value = expandedDeviceId.value === deviceId ? null : deviceId
}

function toggleTimelineDetail(timelineId: number) {
  expandedTimelineId.value = expandedTimelineId.value === timelineId ? null : timelineId
}

function handleQuickAction(action: 'retry' | 'skip') {
  ElMessage.info(`执行操作: ${action === 'retry' ? '重试' : '跳过'}`)
  // TODO: Implement actual quick action API
}

// Action kind helpers - Business semantics
function actionKindIcon(kind: string): string {
  const iconMap: Record<string, string> = {
    command: '📡',
    inbox: '📥',
    outbox: '📤',
    event: '📋',
    result: '✅',
    ack: '📲'
  }
  return iconMap[kind?.toLowerCase()] || '📋'
}

function actionKindLabel(kind: string): string {
  const labelMap: Record<string, string> = {
    command: '设备命令',
    inbox: '接收事件',
    outbox: '下发指令',
    event: '系统事件',
    result: '返回结果',
    ack: '确认回执'
  }
  return labelMap[kind?.toLowerCase()] || kind
}

function actionStatusClass(status: string | null | undefined): string {
  if (!status) return ''
  const statusMap: Record<string, string> = {
    success: 'is-success',
    failed: 'is-failed',
    pending: 'is-pending',
    running: 'is-running',
    timeout: 'is-timeout'
  }
  return statusMap[status?.toLowerCase()] || ''
}

function actionStatusLabel(status: string | null | undefined): string {
  if (!status) return ''
  const labelMap: Record<string, string> = {
    SUCCESS: '成功',
    FAILED: '失败',
    PENDING: '等待中',
    RUNNING: '执行中',
    TIMEOUT: '超时',
    COMPLETED: '已完成'
  }
  return labelMap[status?.toUpperCase()] || status
}

function deviceActions(node: RuntimeTraceDevicePathNode): RuntimeTraceDeviceAction[] {
  return node.actions ?? []
}

function buildTimelineViewGroup(group: RuntimeTraceTimelineGroup): RuntimeTraceTimelineViewGroup {
  const chronologicalEvents = [...(group.events ?? [])].sort(compareTimelineEventAsc)
  const durationByEventId = new Map<number, string>()
  chronologicalEvents.forEach((item, index) => {
    const nextItem = chronologicalEvents[index + 1]
    const durationLabel = timelineDurationLabel(item, nextItem)
    if (durationLabel) {
      durationByEventId.set(item.id, durationLabel)
    }
  })

  return {
    ...group,
    events: [...chronologicalEvents].reverse().map(item => ({
      ...item,
      business_title: timelineBusinessTitle(item),
      business_detail: timelineBusinessDetail(item),
      event_payload_fields: timelineEventPayloadFields(item),
      display_status_class: timelineEventStatusClass(item),
      display_status_label: timelineEventStatusLabel(item),
      duration_label: durationByEventId.get(item.id) ?? null,
      technical_label: timelineActionLabel(item.action_type)
    }))
  }
}

function timelineEventStatusClass(item: TraceTimelineItem): string {
  const actionType = item.action_type || ''
  if (actionType === 'WAIT_STARTED') return ''
  if (actionType === 'COMMAND_SENT') return 'is-success'
  if (actionType === 'WAIT_RESUMED') return 'is-success'
  return actionStatusClass(item.status)
}

function timelineEventStatusLabel(item: TraceTimelineItem): string {
  const actionType = item.action_type || ''
  if (actionType === 'WAIT_STARTED') return '开始等待'
  if (actionType === 'COMMAND_SENT') return '已下发'
  if (actionType === 'WAIT_RESUMED') return '已回传'
  return actionStatusLabel(item.status)
}

function groupTypeLabel(groupType: string): string {
  const labelMap: Record<string, string> = {
    operator: '操作来源',
    orchestrator: '编排',
    device: '设备',
    external: '外部系统',
    unknown: '未归属'
  }
  return labelMap[groupType] || groupType
}

function isSessionBoundaryAction(actionType: string | null): boolean {
  return [
    'SESSION_CREATED',
    'SESSION_STARTED',
    'SESSION_RESUMED',
    'SESSION_COMPLETED',
    'SESSION_FAILED',
    'SESSION_CANCELLED',
    'STATUS_CHANGED'
  ].includes(actionType || '')
}

function compareTimelineEventDesc(left: TraceTimelineItem, right: TraceTimelineItem): number {
  return compareTimelineEventAsc(right, left)
}

function compareTimelineEventAsc(left: TraceTimelineItem, right: TraceTimelineItem): number {
  const seqDelta = left.seq_no - right.seq_no
  if (seqDelta !== 0) return seqDelta
  return timestampMs(left.occurred_at) - timestampMs(right.occurred_at)
}

function timelineDurationLabel(
  item: TraceTimelineItem,
  nextItem: TraceTimelineItem | undefined
): string | null {
  const durationMs = nextItem
    ? timestampMs(nextItem.occurred_at) - timestampMs(item.occurred_at)
    : null
  if (durationMs === null || durationMs < 0) return null
  const prefix = item.action_type === 'WAIT_STARTED' ? '等待' : '耗时'
  return `${prefix} ${formatTimelineDuration(durationMs)}`
}

function formatTimelineDuration(durationMs: number): string {
  if (durationMs < 1000) return '<1s'
  const totalSeconds = Math.floor(durationMs / 1000)
  if (totalSeconds < 60) return `${totalSeconds}s`
  const totalMinutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  if (totalMinutes < 60) return seconds > 0 ? `${totalMinutes}m ${seconds}s` : `${totalMinutes}m`
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
}

function compareTimelineGroupDesc(
  left: RuntimeTraceTimelineViewGroup,
  right: RuntimeTraceTimelineViewGroup
): number {
  const leftLatest = left.events[0]
  const rightLatest = right.events[0]
  if (!leftLatest && !rightLatest) return 0
  if (!leftLatest) return 1
  if (!rightLatest) return -1
  return compareTimelineEventDesc(leftLatest, rightLatest)
}

function timestampMs(value: string | null): number {
  if (!value) return 0
  const time = new Date(value).getTime()
  return Number.isNaN(time) ? 0 : time
}

function timelineBusinessTitle(item: TraceTimelineItem): string {
  const actionType = item.action_type || ''
  const explicitTitle = explicitPayloadText(item, [
    'business_title',
    'action_label',
    'display_label'
  ])
  if (explicitTitle) return explicitTitle
  if (actionType === 'DECISION_MADE') return '编排判定下一步'
  if (actionType === 'COMMAND_SENT') return '下发设备指令'
  if (actionType === 'WAIT_STARTED') return waitStartedTitle(item)
  if (actionType === 'WAIT_RESUMED') return '收到回传，继续编排'
  if (actionType === 'WAIT_TIMEOUT') return '等待超时'
  if (actionType === 'SESSION_CREATED') return '会话创建'
  if (actionType === 'SESSION_STARTED') return '会话开始'
  if (actionType === 'SESSION_COMPLETED') return '会话完成'
  if (actionType === 'SESSION_FAILED') return '会话失败'
  if (actionType === 'SESSION_CANCELLED') return '会话取消'
  if (actionType === 'STATUS_CHANGED') return '状态更新'
  if (actionType === 'EVENT_RECEIVED') return '收到设备事件'
  if (actionType === 'EVENT_PROCESSED') return '事件处理完成'
  if (actionType === 'COMMAND_COMPLETED') return '设备指令完成'
  if (actionType === 'EXTERNAL_CALL_COMPLETED') return '外部调用完成'
  if (actionType === 'EXTERNAL_CALL_FAILED') return '外部调用失败'
  return '记录运行事件'
}

function timelineBusinessDetail(item: TraceTimelineItem): string | null {
  const actionType = item.action_type || ''
  const explicitDetail = explicitPayloadText(item, ['business_detail', 'detail', 'description'])
  if (explicitDetail) return explicitDetail
  if (actionType === 'DECISION_MADE') {
    return item.message || null
  }
  if (actionType === 'COMMAND_SENT') {
    return item.message || '设备开始执行，系统等待回传结果'
  }
  if (actionType === 'WAIT_STARTED') {
    return '当前步骤暂停在设备响应之前'
  }
  if (actionType === 'WAIT_RESUMED') {
    return '设备结果已返回，编排继续推进'
  }
  if (actionType === 'SESSION_COMPLETED') {
    return '本次会话已经走完全部设备步骤'
  }
  if (actionType === 'SESSION_FAILED') {
    return item.message || '本次会话已失败，需要排障'
  }
  return null
}

function waitStartedTitle(item: TraceTimelineItem): string {
  const payload = payloadDict(item.payload_json)
  const waitType = readPayloadString(payload, 'wait_type')
  if (waitType === 'EXTERNAL') return '等待外部系统回传'
  return '等待设备回传'
}

function timelineStatusLabel(status: string | null): string {
  if (!status) return ''
  const labelMap: Record<string, string> = {
    NEW: '新建',
    RUNNING: '执行中',
    WAITING_DEVICE_RESULT: '等待设备回传',
    WAITING_EXTERNAL: '等待外部系统',
    MANUAL_HOLD: '人工暂停',
    COMPLETED: '已完成',
    FAILED: '失败',
    CANCELLED: '已取消'
  }
  return labelMap[status.toUpperCase()] || status
}

function timelineHasStatusChange(item: TraceTimelineItem): boolean {
  if (!item.from_status && !item.to_status) return false
  return item.from_status !== item.to_status
}

function payloadDict(payload: Record<string, unknown> | null | undefined): Record<string, unknown> {
  return payload && typeof payload === 'object' ? payload : {}
}

function recordValue(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

function timelineEventPayloadFields(item: TraceTimelineItem): TimelinePayloadField[] {
  const candidatePayloads = [item.payload_json].filter(
    (payload): payload is Record<string, unknown> => Boolean(payload)
  )

  for (const payload of candidatePayloads) {
    const fields = scanPayloadFields(payload)
    if (fields.length) return fields
  }
  return []
}

function scanPayloadFields(payload: Record<string, unknown>): TimelinePayloadField[] {
  const data = recordValue(payload.data)
  if (!Object.keys(data).length) return []
  return uniqueTimelinePayloadFields([
    firstPayloadField(data, 'PkgID', ['PkgID', 'pkg_id', 'package_id']),
    firstPayloadField(data, 'HHPN', ['HHPN', 'hhpn', 'material_code']),
    firstPayloadField(data, 'MfrPN', ['MfrPN', 'mfrpn', 'manufacturer_part_number']),
    firstPayloadField(data, 'Qty', ['Qty', 'qty', 'quantity']),
    firstPayloadField(data, 'Lot', ['LotCode', 'lot_code', 'lot']),
    firstPayloadField(data, 'Date', ['DateCode', 'date_code']),
    firstPayloadField(data, '位置', ['location', 'Location']),
    firstPayloadField(data, '扫码', ['barcode', 'bar_code', 'scan_code'])
  ]).slice(0, 6)
}

function firstPayloadField(
  payload: Record<string, unknown>,
  label: string,
  keys: string[]
): TimelinePayloadField | null {
  for (const key of keys) {
    const value = scalarPayloadValue(payload[key])
    if (value) return { label, value }
  }
  return null
}

function scalarPayloadValue(value: unknown): string | null {
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed || null
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }
  return null
}

function uniqueTimelinePayloadFields(
  fields: Array<TimelinePayloadField | null>
): TimelinePayloadField[] {
  const seen = new Set<string>()
  const result: TimelinePayloadField[] = []
  for (const field of fields) {
    if (!field) continue
    const key = `${field.label}:${field.value}`
    if (seen.has(key)) continue
    seen.add(key)
    result.push(field)
  }
  return result
}

function readPayloadString(payload: Record<string, unknown>, key: string): string | null {
  const value = payload[key]
  return typeof value === 'string' && value ? value : null
}

function explicitPayloadText(item: TraceTimelineItem, keys: readonly string[]): string | null {
  const payload = payloadDict(item.payload_json)
  for (const key of keys) {
    const value = readPayloadString(payload, key)
    if (value) return value
  }
  return null
}

function timelineActionLabel(actionType: string | null): string {
  if (!actionType) return '未知动作'
  return actionType
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

function formatTime(timestamp: string | null): string {
  if (!timestamp) return ''
  try {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('zh-CN', { hour12: false })
  } catch {
    return ''
  }
}

function formatPayload(payload: Record<string, unknown> | null): string {
  if (!payload) return ''
  // 截断显示，最多 2000 字符
  const str = JSON.stringify(payload, null, 2)
  return str.length > 2000 ? str.slice(0, 2000) + '\n\n... [内容已截断]' : str
}

function resourceRackKey(rack: RuntimeActiveBinRackView, rackIndex: number): string {
  return String(rack.rack_code ?? rack.rack_id ?? `rack:${rackIndex}`)
}

function resourceBinKey(
  rack: RuntimeActiveBinRackView,
  rackIndex: number,
  bin: RuntimeActiveBinRackBinView,
  binIndex: number
): string {
  return `${resourceRackKey(rack, rackIndex)}:${String(
    bin.bin_id ?? bin.bin_code ?? bin.rack_slot_code ?? `bin:${binIndex}`
  )}`
}

function resourceCellKey(
  rackIndex: number,
  bin: RuntimeActiveBinRackBinView,
  binIndex: number,
  cell: RuntimeActiveBinRackCellView,
  cellIndex: number
): string {
  return `${rackIndex}:${String(bin.bin_id ?? bin.bin_code ?? `bin:${binIndex}`)}:${String(
    cell.bin_cell_code ?? cell.bin_cell_index ?? cell.pkg_code ?? `cell:${cellIndex}`
  )}`
}
</script>

<style scoped>
/* Header */
.trace-focus-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.trace-focus-panel__header {
  display: flex;
  align-items: center;
  gap: 12px;
}

:deep(.trace-focus-panel__back) {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid rgb(6, 182, 212, 0.2);
  border-radius: 8px;
  background: transparent;
  color: rgb(6, 182, 212);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

:deep(.trace-focus-panel__back:hover) {
  background: rgb(6, 182, 212, 0.1);
  border-color: rgb(6, 182, 212, 0.4);
}

.trace-focus-panel__trace-id {
  color: var(--runtime-text-primary);
  font-family: var(--font-mono, monospace);
  font-size: 13px;
  font-weight: 600;
}

/* Skeleton Loading */
.trace-focus-panel__skeleton {
  height: 200px;
  border-radius: 12px;
  background: linear-gradient(
    90deg,
    var(--runtime-surface-subtle) 25%,
    var(--runtime-surface) 50%,
    var(--runtime-surface-subtle) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Error State */
.trace-focus-panel__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 32px 0;
  color: #ef4444;
  font-size: 13px;
}

.trace-focus-panel__error-icon {
  width: 32px;
  height: 32px;
}

/* ===== PRIORITY 1: Problem Summary Card ===== */
.trace-focus-panel__summary {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
  border-radius: 16px;
  border: 1px solid;
}

.trace-focus-panel__summary--critical {
  background: var(--runtime-surface-danger);
  border-color: var(--runtime-border-danger);
}

.trace-focus-panel__summary--warning {
  background: var(--runtime-surface-warning);
  border-color: var(--runtime-border-warning);
}

.trace-focus-panel__summary-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}

.trace-focus-panel__summary--critical .trace-focus-panel__summary-icon {
  background: var(--runtime-badge-danger-bg);
  color: var(--runtime-badge-danger-text);
}

.trace-focus-panel__summary--warning .trace-focus-panel__summary-icon {
  background: var(--runtime-badge-warning-bg);
  color: var(--runtime-badge-warning-text);
}

.trace-focus-panel__summary-icon svg {
  width: 28px;
  height: 28px;
}

.trace-focus-panel__summary-content {
  flex: 1;
}

.trace-focus-panel__summary-title {
  color: var(--runtime-text-primary);
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 4px;
}

.trace-focus-panel__summary-reason {
  color: var(--runtime-text-emphasis);
  font-size: 15px;
  font-weight: 500;
}

.trace-focus-panel__summary-detail {
  margin-top: 6px;
  color: var(--runtime-text-secondary);
  font-size: 13px;
  font-family: var(--font-mono, monospace);
}

.trace-focus-panel__summary-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.trace-focus-panel__summary-status {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.trace-focus-panel__summary-status--critical {
  background: var(--runtime-badge-danger-bg);
  color: var(--runtime-badge-danger-text);
}

.trace-focus-panel__summary-status--warning {
  background: var(--runtime-badge-warning-bg);
  color: var(--runtime-badge-warning-text);
}

.trace-focus-panel__summary-duration {
  color: var(--runtime-text-secondary);
  font-size: 13px;
  font-family: var(--font-mono, monospace);
}

.trace-focus-panel__summary-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.trace-focus-panel__btn-icon {
  width: 14px;
  height: 14px;
  margin-right: 4px;
}

/* ===== PRIORITY 2: Topology ===== */
.trace-focus-panel__topology {
  background: var(--runtime-surface-muted);
  border: 1px solid var(--runtime-border-neutral);
}

.trace-focus-panel__topology-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.trace-focus-panel__topology-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--runtime-text-primary);
  font-size: 15px;
  font-weight: 600;
}

.trace-focus-panel__topology-icon {
  width: 18px;
  height: 18px;
  color: #06b6d4;
}

.trace-focus-panel__topology-subtitle {
  color: var(--runtime-text-muted);
  font-size: 12px;
  margin-top: 2px;
}

/* Device Cards */
.trace-focus-panel__device-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.trace-focus-panel__device-card {
  padding: 14px 16px;
  border-radius: 12px;
  background: var(--runtime-surface-subtle);
  border: 1px solid var(--runtime-border-neutral);
  cursor: pointer;
  transition: all 0.2s ease;
}

.trace-focus-panel__device-card:hover {
  background: var(--runtime-surface);
  border-color: var(--runtime-badge-info-bg);
}

.trace-focus-panel__device-card.is-blocked {
  border-color: var(--runtime-border-danger);
  background: var(--runtime-surface-danger);
}

.trace-focus-panel__device-card.is-current {
  border-color: var(--runtime-badge-info-bg);
}

.trace-focus-panel__device-card.is-completed {
  opacity: 0.7;
}

.trace-focus-panel__device-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.trace-focus-panel__device-index {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: var(--runtime-border-neutral);
  color: var(--runtime-text-secondary);
  font-size: 12px;
  font-weight: 600;
}

.trace-focus-panel__device-card.is-completed .trace-focus-panel__device-index {
  background: var(--runtime-badge-success-bg);
  color: var(--runtime-badge-success-text);
}

.trace-focus-panel__device-card.is-blocked .trace-focus-panel__device-index {
  background: var(--runtime-badge-danger-bg);
  color: var(--runtime-badge-danger-text);
}

.trace-focus-panel__device-check {
  width: 16px;
  height: 16px;
}

.trace-focus-panel__device-block-icon {
  width: 16px;
  height: 16px;
}

.trace-focus-panel__device-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
}

.trace-focus-panel__device-name {
  color: var(--runtime-text-primary);
  font-size: 14px;
  font-weight: 600;
}

.trace-focus-panel__device-badge {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: var(--runtime-badge-info-bg);
  color: var(--runtime-badge-info-text);
}

.trace-focus-panel__device-badge--blocked {
  background: var(--runtime-badge-danger-bg);
  color: var(--runtime-badge-danger-text);
}

.trace-focus-panel__device-actions {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--runtime-border-neutral);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.trace-focus-panel__action-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  padding: 6px 8px;
  border-radius: 6px;
  background: var(--runtime-surface-subtle);
}

.trace-focus-panel__action-icon {
  font-size: 14px;
  width: 20px;
  text-align: center;
}

.trace-focus-panel__action-kind {
  color: var(--runtime-text-muted);
  font-size: 10px;
  text-transform: uppercase;
  font-weight: 600;
  background: var(--runtime-border-neutral);
  padding: 2px 6px;
  border-radius: 3px;
}

.trace-focus-panel__action-label {
  color: var(--runtime-text-emphasis);
  font-family: var(--font-mono, monospace);
}

.trace-focus-panel__action-status {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 3px;
}

.trace-focus-panel__action-status.is-success {
  background: var(--runtime-badge-success-bg);
  color: var(--runtime-badge-success-text);
}

.trace-focus-panel__action-status.is-failed {
  background: var(--runtime-badge-danger-bg);
  color: var(--runtime-badge-danger-text);
}

.trace-focus-panel__action-status.is-running {
  background: var(--runtime-badge-info-bg);
  color: var(--runtime-badge-info-text);
}

.trace-focus-panel__action-time {
  margin-left: auto;
  color: var(--runtime-text-muted);
  font-size: 11px;
}

.trace-focus-panel__device-empty {
  margin-top: 8px;
  color: var(--runtime-text-muted);
  font-size: 12px;
  font-style: italic;
}

.trace-focus-panel__device-hint {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--runtime-text-muted);
  font-size: 12px;
}

.trace-focus-panel__device-hint-icon {
  width: 14px;
  height: 14px;
}

.trace-focus-panel__resource-card {
  background: var(--runtime-surface-muted);
  border: 1px solid var(--runtime-border-neutral);
}

.trace-focus-panel__resource-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.trace-focus-panel__resource-title {
  color: var(--runtime-text-primary);
  font-size: 15px;
  font-weight: 600;
}

.trace-focus-panel__resource-subtitle {
  margin-top: 4px;
  color: var(--runtime-text-muted);
  font-size: 12px;
}

.trace-focus-panel__resource-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.trace-focus-panel__resource-rack {
  padding: 12px;
  border: 1px solid var(--runtime-border-neutral);
  border-radius: 10px;
  background: var(--runtime-surface-subtle);
}

.trace-focus-panel__resource-rack-header,
.trace-focus-panel__resource-bin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.trace-focus-panel__resource-rack-header strong,
.trace-focus-panel__resource-bin-header strong {
  color: var(--runtime-text-primary);
  font-size: 13px;
}

.trace-focus-panel__resource-rack-header span,
.trace-focus-panel__resource-bin-header span {
  color: var(--runtime-text-muted);
  font-size: 12px;
}

.trace-focus-panel__resource-bin-list {
  display: grid;
  gap: 10px;
  margin-top: 10px;
}

.trace-focus-panel__resource-bin {
  padding: 10px;
  border: 1px solid var(--runtime-border-neutral);
  border-radius: 8px;
  background: var(--runtime-surface);
}

.trace-focus-panel__resource-cell-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.trace-focus-panel__resource-cell {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  max-width: 100%;
  padding: 4px 7px;
  border-radius: 6px;
  background: var(--runtime-surface-subtle);
  color: var(--runtime-text-secondary);
  font-size: 12px;
  line-height: 1.3;
}

.trace-focus-panel__resource-cell.is-reserved {
  background: var(--runtime-badge-warning-bg);
  color: var(--runtime-badge-warning-text);
}

.trace-focus-panel__resource-cell small {
  max-width: 160px;
  overflow: hidden;
  color: inherit;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ===== PRIORITY 3: Timeline ===== */
.trace-focus-panel__timeline-card {
  background: var(--runtime-surface-muted);
  border: 1px solid var(--runtime-border-neutral);
}

.trace-focus-panel__timeline-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.trace-focus-panel__timeline-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.trace-focus-panel__timeline-icon {
  width: 18px;
  height: 18px;
  color: #06b6d4;
}

.trace-focus-panel__timeline-title {
  color: var(--runtime-text-primary);
  font-size: 15px;
  font-weight: 600;
}

.trace-focus-panel__timeline-count {
  color: var(--runtime-text-muted);
  font-size: 12px;
}

.trace-focus-panel__timeline-filters {
  display: flex;
  gap: 16px;
}

.trace-focus-panel__timeline-groups {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.trace-focus-panel__timeline-group {
  padding: 12px;
  border: 1px solid var(--runtime-border-neutral);
  border-radius: 10px;
  background: var(--runtime-surface-subtle);
}

.trace-focus-panel__timeline-group.is-current {
  border-color: var(--runtime-badge-info-bg);
}

.trace-focus-panel__timeline-group.is-blocked {
  border-color: var(--runtime-border-danger);
  background: var(--runtime-surface-danger);
}

.trace-focus-panel__timeline-group-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.trace-focus-panel__timeline-group-title {
  color: var(--runtime-text-primary);
  font-size: 14px;
  font-weight: 700;
}

.trace-focus-panel__timeline-group-meta {
  margin-top: 2px;
  color: var(--runtime-text-muted);
  font-size: 12px;
}

.trace-focus-panel__timeline-group-badges {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 6px;
}

.trace-focus-panel__timeline-group-badge {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
}

.trace-focus-panel__timeline-group-badge.is-current {
  background: var(--runtime-badge-info-bg);
  color: var(--runtime-badge-info-text);
}

.trace-focus-panel__timeline-group-badge.is-blocked {
  background: var(--runtime-badge-danger-bg);
  color: var(--runtime-badge-danger-text);
}

.trace-focus-panel__timeline-list {
  display: flex;
  flex-direction: column;
}

.trace-focus-panel__timeline-event {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--runtime-border-neutral);
}

.trace-focus-panel__timeline-event:last-child {
  border-bottom: none;
}

.trace-focus-panel__timeline-dot {
  width: 10px;
  height: 10px;
  margin-top: 4px;
  border-radius: 50%;
  background: #64748b;
  flex-shrink: 0;
}

.trace-focus-panel__timeline-event.is-failure .trace-focus-panel__timeline-dot {
  background: #ef4444;
  box-shadow: 0 0 8px rgb(239, 68, 68, 0.5);
}

.trace-focus-panel__timeline-event.is-success .trace-focus-panel__timeline-dot {
  background: #22c55e;
}

.trace-focus-panel__timeline-content {
  flex: 1;
}

.trace-focus-panel__timeline-main {
  display: flex;
  align-items: center;
  gap: 8px;
}

.trace-focus-panel__timeline-action {
  font-size: 14px;
}

.trace-focus-panel__timeline-type {
  color: var(--runtime-text-emphasis);
  font-size: 13px;
  font-weight: 500;
}

.trace-focus-panel__timeline-business-detail {
  margin-top: 4px;
  color: var(--runtime-text-secondary);
  font-size: 12px;
}

.trace-focus-panel__timeline-event-data {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
}

.trace-focus-panel__timeline-event-data-label {
  color: var(--runtime-text-muted);
  font-size: 11px;
}

.trace-focus-panel__timeline-event-data-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  max-width: 100%;
  padding: 2px 6px;
  border: 1px solid var(--runtime-border-neutral);
  border-radius: 4px;
  background: var(--runtime-surface-muted);
  color: var(--runtime-text-secondary);
  font-size: 11px;
  font-family: var(--font-mono, monospace);
  line-height: 1.5;
}

.trace-focus-panel__timeline-event-data-key {
  color: var(--runtime-text-muted);
  font-family: inherit;
}

.trace-focus-panel__timeline-status {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
}

.trace-focus-panel__timeline-status.is-success {
  background: var(--runtime-badge-success-bg);
  color: var(--runtime-badge-success-text);
}

.trace-focus-panel__timeline-status.is-failed {
  background: var(--runtime-badge-danger-bg);
  color: var(--runtime-badge-danger-text);
}

.trace-focus-panel__timeline-duration {
  padding: 2px 6px;
  border: 1px solid var(--runtime-border-neutral);
  border-radius: 4px;
  background: var(--runtime-surface-muted);
  color: var(--runtime-text-muted);
  font-size: 11px;
  font-family: var(--font-mono, monospace);
  white-space: nowrap;
}

.trace-focus-panel__timeline-msg {
  margin-top: 4px;
  color: var(--runtime-text-secondary);
  font-size: 12px;
  font-family: var(--font-mono, monospace);
  display: flex;
  align-items: flex-start;
  gap: 4px;
}

.trace-focus-panel__timeline-msg.is-error {
  color: #fca5a5;
}

.trace-focus-panel__timeline-msg-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  margin-top: 1px;
}

.trace-focus-panel__timeline-failure-domain {
  color: var(--runtime-badge-danger-text);
  font-size: 10px;
  background: var(--runtime-badge-danger-bg);
  padding: 1px 4px;
  border-radius: 3px;
  margin-left: 4px;
}

.trace-focus-panel__timeline-time {
  color: var(--runtime-text-muted);
  font-size: 11px;
  font-family: var(--font-mono, monospace);
  white-space: nowrap;
}

/* Actor (设备) */
.trace-focus-panel__timeline-actor {
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--runtime-badge-info-bg);
  color: var(--runtime-badge-info-text);
  font-size: 11px;
  font-family: var(--font-mono, monospace);
}

/* Status Change */
.trace-focus-panel__timeline-status-change {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
  font-size: 11px;
  font-family: var(--font-mono, monospace);
}

.trace-focus-panel__timeline-status-from {
  color: var(--runtime-text-muted);
}

.trace-focus-panel__timeline-status-arrow {
  color: var(--runtime-text-muted);
}

.trace-focus-panel__timeline-status-to {
  color: #22c55e;
}

.trace-focus-panel__timeline-status-to.is-failed {
  color: #ef4444;
}

/* Expandable Detail */
.trace-focus-panel__timeline-detail {
  margin-top: 12px;
  padding: 12px;
  border-radius: 8px;
  background: var(--runtime-surface-subtle);
  border: 1px solid var(--runtime-border-neutral);
}

.trace-focus-panel__timeline-ref {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.trace-focus-panel__timeline-ref-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.trace-focus-panel__timeline-ref-label {
  color: var(--runtime-text-muted);
  font-size: 11px;
}

.trace-focus-panel__timeline-ref-value {
  color: var(--runtime-badge-info-text);
  font-size: 12px;
  font-family: var(--font-mono, monospace);
  background: var(--runtime-badge-info-bg);
  padding: 2px 6px;
  border-radius: 4px;
}

.trace-focus-panel__timeline-payload {
  margin-top: 12px;
}

.trace-focus-panel__timeline-payload-content {
  margin: 8px 0 0;
  padding: 8px;
  border-radius: 6px;
  background: var(--runtime-code-bg);
  color: var(--runtime-text-emphasis);
  font-size: 11px;
  font-family: var(--font-mono, monospace);
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 400px;
  overflow-y: auto;
}

/* Expand Icon */
.trace-focus-panel__timeline-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.trace-focus-panel__timeline-expand-icon {
  width: 16px;
  height: 16px;
  color: var(--runtime-text-muted);
  transition: transform 0.2s ease;
}

.trace-focus-panel__timeline-expand-icon.is-expanded {
  transform: rotate(180deg);
}

/* Event expanded state */
.trace-focus-panel__timeline-event.is-expanded {
  background: var(--runtime-surface-subtle);
  margin: 0 -12px;
  padding: 12px;
  border-radius: 8px;
}

.trace-focus-panel__timeline-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 24px;
  color: var(--runtime-text-muted);
  font-size: 13px;
}

.trace-focus-panel__resource-empty {
  padding: 18px;
  border: 1px dashed var(--runtime-border-neutral);
  border-radius: 8px;
  color: var(--runtime-text-muted);
  font-size: 13px;
  text-align: center;
}

.trace-focus-panel__timeline-empty-icon {
  width: 24px;
  height: 24px;
}

/* Responsive */
@media (width >= 768px) {
  .trace-focus-panel__summary {
    flex-direction: row;
    align-items: flex-start;
  }

  .trace-focus-panel__summary-meta {
    flex-direction: column;
    align-items: flex-start;
  }

  .trace-focus-panel__device-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (width >= 1024px) {
  .trace-focus-panel__device-list {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>

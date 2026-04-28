<template>
  <div
    v-loading="loading"
    class="runtime-page"
  >
    <div class="runtime-page__header">
      <div>
        <h1 class="runtime-page__title">Sandbox 调试台</h1>
        <p class="runtime-page__subtitle">
          只处理 SIMULATION 工作线的待派发消息和人工操作，用真实链路验证插件与设备协议。
        </p>
      </div>
      <div class="runtime-page__status-bar runtime-control-cluster">
        <RuntimeStatusBadge
          :label="connectionLabel"
          :tone="connectionTone"
          :pulse="live && state === 'connected'"
        />
        <el-switch
          :model-value="live"
          inline-prompt
          active-text="Live"
          inactive-text="Frozen"
          @change="value => toggleLive(Boolean(value))"
        />
        <RuntimeLastUpdated
          :value="lastRefreshedAt"
          :frozen="!live"
        />
        <el-input-number
          v-model="limit"
          :min="1"
          :max="100"
          controls-position="right"
          class="sandbox-page__limit"
        />
        <el-button
          type="primary"
          @click="refresh"
        >
          刷新
        </el-button>
      </div>
    </div>

    <RuntimeFrozenNotice v-if="!live" />

    <div class="sandbox-page__notice">
      Sandbox 不修改设备 payload，也不向 payload 注入 sandbox
      字段。这里看到的消息只代表派发出口被切到调试通道。
    </div>

    <div class="sandbox-page__layout">
      <el-card
        shadow="never"
        class="runtime-panel sandbox-page__queue"
      >
        <template #header>
          <div class="runtime-panel__header">
            <div>
              <div class="runtime-panel__title">待处理 Outbox</div>
              <div class="runtime-panel__subtitle">
                选择一条沙箱派发消息后查看 payload，并可带入人工操作。
              </div>
            </div>
            <RuntimeStatusBadge
              :label="`${pendingOutboxes.length} pending`"
              tone="warning"
              size="small"
            />
          </div>
        </template>

        <el-table
          :data="pendingOutboxes"
          size="small"
          highlight-current-row
          @current-change="selectOutbox"
        >
          <el-table-column
            prop="id"
            label="ID"
            width="80"
          />
          <el-table-column
            prop="session_id"
            label="Session"
            width="100"
          />
          <el-table-column
            prop="dispatch_key"
            label="Dispatch Key"
            min-width="220"
          />
          <el-table-column
            prop="target_code"
            label="Target"
            min-width="140"
          />
          <el-table-column
            label="状态"
            width="110"
          >
            <template #default="scope">
              <RuntimeStatusBadge
                :status="scope.row.status"
                size="small"
              />
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <div class="sandbox-page__side">
        <el-card
          shadow="never"
          class="runtime-panel"
        >
          <template #header>
            <div class="runtime-panel__header">
              <div>
                <div class="runtime-panel__title">当前沙箱消息</div>
                <div class="runtime-panel__subtitle">
                  payload 用于构造设备 callback/result，内部 ID 不暴露给真实设备。
                </div>
              </div>
              <el-button
                plain
                size="small"
                :disabled="!selectedOutbox"
                @click="copyPayload"
              >
                复制 Payload
              </el-button>
            </div>
          </template>

          <div
            v-if="selectedOutbox"
            class="sandbox-page__facts"
          >
            <div class="sandbox-page__fact">
              <span>Outbox</span>
              <strong>#{{ selectedOutbox.id }}</strong>
            </div>
            <div class="sandbox-page__fact">
              <span>Workline</span>
              <strong>{{ selectedOutbox.workline_id ?? '—' }}</strong>
            </div>
            <div class="sandbox-page__fact">
              <span>Session</span>
              <strong>{{ selectedOutbox.session_id ?? '—' }}</strong>
            </div>
            <div class="sandbox-page__fact">
              <span>Target</span>
              <strong>{{ selectedOutbox.target_code || '—' }}</strong>
            </div>
          </div>
          <RuntimeEmptyState
            v-else
            title="未选择 Outbox"
            description="从左侧选择一条待处理沙箱消息。"
          />

          <pre
            v-if="selectedOutbox"
            class="sandbox-page__json"
            >{{ selectedPayloadJson }}</pre
          >
        </el-card>

        <el-card
          shadow="never"
          class="runtime-panel"
        >
          <template #header>
            <div class="runtime-panel__header">
              <div>
                <div class="runtime-panel__title">人工推进 Session</div>
                <div class="runtime-panel__subtitle">
                  仅用于开放状态会话，操作会创建一条 manual inbox。
                </div>
              </div>
            </div>
          </template>

          <el-form
            label-position="top"
            class="sandbox-page__form"
            @submit.prevent
          >
            <div class="sandbox-page__form-grid">
              <el-form-item label="Session ID">
                <el-input-number
                  v-model="manualForm.sessionId"
                  :min="1"
                  controls-position="right"
                />
              </el-form-item>
              <el-form-item label="Operation">
                <el-select v-model="manualForm.operation">
                  <el-option
                    label="HOLD"
                    value="HOLD"
                  />
                  <el-option
                    label="RESUME"
                    value="RESUME"
                  />
                  <el-option
                    label="CANCEL"
                    value="CANCEL"
                  />
                </el-select>
              </el-form-item>
            </div>
            <el-form-item label="Operator ID">
              <el-input
                v-model="manualForm.operatorId"
                placeholder="当前调试人员标识"
              />
            </el-form-item>
            <el-form-item label="Reason">
              <el-input
                v-model="manualForm.reason"
                type="textarea"
                :rows="3"
                placeholder="说明为什么执行该人工操作"
              />
            </el-form-item>
            <el-button
              type="primary"
              :loading="manualSubmitting"
              @click="submitManualOperation"
            >
              提交人工操作
            </el-button>
          </el-form>
        </el-card>

        <el-card
          shadow="never"
          class="runtime-panel"
        >
          <template #header>
            <div class="runtime-panel__header">
              <div>
                <div class="runtime-panel__title">Replay Inbox</div>
                <div class="runtime-panel__subtitle">修复根因后创建新事件，不修改历史 inbox。</div>
              </div>
            </div>
          </template>

          <el-form
            label-position="top"
            class="sandbox-page__form"
            @submit.prevent
          >
            <div class="sandbox-page__form-grid">
              <el-form-item label="Inbox ID">
                <el-input-number
                  v-model="replayForm.inboxId"
                  :min="1"
                  controls-position="right"
                />
              </el-form-item>
              <el-form-item label="Operator ID">
                <el-input
                  v-model="replayForm.operatorId"
                  placeholder="可选"
                />
              </el-form-item>
            </div>
            <el-form-item label="Reason">
              <el-input
                v-model="replayForm.reason"
                type="textarea"
                :rows="3"
                placeholder="说明 replay 原因"
              />
            </el-form-item>
            <el-button
              plain
              :loading="replaySubmitting"
              @click="submitReplay"
            >
              创建 Replay
            </el-button>
          </el-form>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import RuntimeEmptyState from '@/components/common/runtime/RuntimeEmptyState.vue'
import RuntimeFrozenNotice from '@/components/common/runtime/RuntimeFrozenNotice.vue'
import RuntimeLastUpdated from '@/components/common/runtime/RuntimeLastUpdated.vue'
import RuntimeStatusBadge from '@/components/common/runtime/RuntimeStatusBadge.vue'
import { runtimeApiMethods } from '@/api/modules/runtime'
import { useRuntimePageChrome } from '@/composables/useRuntimePageChrome'
import type { ManualOperationType, SandboxPendingOutbox } from '@/types/runtime'
import { createCoalescedAsyncTask } from '@/utils/createCoalescedAsyncTask'

const {
  connectionLabel,
  connectionTone,
  lastEvent,
  lastRefreshedAt,
  live,
  markRefreshedAt,
  state,
  toggleLive
} = useRuntimePageChrome()

const loading = ref(false)
const manualSubmitting = ref(false)
const replaySubmitting = ref(false)
const limit = ref(20)
const pendingOutboxes = ref<SandboxPendingOutbox[]>([])
const selectedOutbox = ref<SandboxPendingOutbox | null>(null)

const manualForm = reactive({
  sessionId: undefined as number | undefined,
  operation: 'HOLD' as ManualOperationType,
  operatorId: '',
  reason: ''
})

const replayForm = reactive({
  inboxId: undefined as number | undefined,
  operatorId: '',
  reason: ''
})

const selectedPayloadJson = computed(() =>
  JSON.stringify(selectedOutbox.value?.payload_json ?? {}, null, 2)
)

function selectOutbox(row?: SandboxPendingOutbox) {
  selectedOutbox.value = row ?? null
  if (row?.session_id) {
    manualForm.sessionId = row.session_id
  }
}

const refresh = createCoalescedAsyncTask(async () => {
  loading.value = true
  try {
    pendingOutboxes.value = await runtimeApiMethods.sandboxPending(limit.value).send()
    if (selectedOutbox.value) {
      selectedOutbox.value =
        pendingOutboxes.value.find(item => item.id === selectedOutbox.value?.id) ?? null
    }
    markRefreshedAt()
  } finally {
    loading.value = false
  }
})

async function copyPayload() {
  if (!selectedOutbox.value) return
  try {
    await navigator.clipboard.writeText(selectedPayloadJson.value)
    ElMessage.success('Payload 已复制')
  } catch {
    ElMessage.warning('当前浏览器不允许直接复制，请手动选择 payload')
  }
}

function validateManualForm(): boolean {
  if (!manualForm.sessionId || !manualForm.operatorId.trim() || !manualForm.reason.trim()) {
    ElMessage.warning('请填写 Session ID、Operator ID 和 Reason')
    return false
  }
  return true
}

function validateReplayForm(): boolean {
  if (!replayForm.inboxId || !replayForm.reason.trim()) {
    ElMessage.warning('请填写 Inbox ID 和 Reason')
    return false
  }
  return true
}

async function submitManualOperation() {
  if (!validateManualForm() || !manualForm.sessionId) return

  const confirmed = await ElMessageBox.confirm(
    `确认对 Session #${manualForm.sessionId} 执行 ${manualForm.operation}？`,
    '确认人工操作',
    { type: 'warning' }
  )
    .then(() => true)
    .catch(() => false)

  if (!confirmed) return

  manualSubmitting.value = true
  try {
    await runtimeApiMethods
      .manualSessionOperation(manualForm.sessionId, {
        operation: manualForm.operation,
        operator_id: manualForm.operatorId.trim(),
        reason: manualForm.reason.trim()
      })
      .send()
    ElMessage.success('人工操作已提交')
    manualForm.reason = ''
    await refresh()
  } finally {
    manualSubmitting.value = false
  }
}

async function submitReplay() {
  if (!validateReplayForm() || !replayForm.inboxId) return

  const confirmed = await ElMessageBox.confirm(
    `确认 replay Inbox #${replayForm.inboxId}？`,
    '确认 Replay',
    { type: 'warning' }
  )
    .then(() => true)
    .catch(() => false)

  if (!confirmed) return

  replaySubmitting.value = true
  try {
    await runtimeApiMethods
      .replayInbox(replayForm.inboxId, {
        operator_id: replayForm.operatorId.trim() || null,
        reason: replayForm.reason.trim()
      })
      .send()
    ElMessage.success('Replay 已创建')
    replayForm.reason = ''
    await refresh()
  } finally {
    replaySubmitting.value = false
  }
}

onMounted(() => {
  void refresh()
})

watch(
  () => lastEvent.value,
  async event => {
    if (!live.value || !event) return
    await refresh()
  }
)
</script>

<style scoped>
.runtime-page__subtitle {
  max-width: 900px;
}

.sandbox-page__limit {
  width: 108px;
}

.sandbox-page__notice {
  padding: 10px 14px;
  border: 1px solid rgb(245, 158, 11, 0.16);
  border-radius: 10px;
  background: rgb(245, 158, 11, 0.08);
  color: #f8fafc;
  font-size: 13px;
  line-height: 1.6;
}

.sandbox-page__layout {
  display: grid;
  gap: 16px;
  grid-template-columns: minmax(0, 1.1fr) minmax(420px, 0.9fr);
}

.sandbox-page__queue {
  min-width: 0;
}

.sandbox-page__side {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}

.sandbox-page__facts {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin-bottom: 14px;
}

.sandbox-page__fact {
  padding: 12px;
  border: 1px solid rgb(148, 163, 184, 0.12);
  border-radius: 10px;
  background: rgb(15, 23, 42, 0.46);
}

.sandbox-page__fact span {
  color: var(--runtime-text-secondary, #94a3b8);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.sandbox-page__fact strong {
  display: block;
  margin-top: 6px;
  color: var(--runtime-text-primary, #f8fafc);
  font-family: var(--font-mono);
  font-size: 12px;
  line-height: 1.5;
}

.sandbox-page__json {
  max-height: 340px;
  margin: 0;
  padding: 14px;
  border-radius: 10px;
  background: rgb(15, 23, 42, 0.95);
  color: #cbd5e1;
  font-size: 12px;
  line-height: 1.6;
  overflow: auto;
}

.sandbox-page__form {
  display: flex;
  flex-direction: column;
}

.sandbox-page__form-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

@media (width <= 1279px) {
  .sandbox-page__layout {
    grid-template-columns: 1fr;
  }
}

@media (width <= 767px) {
  .sandbox-page__facts,
  .sandbox-page__form-grid {
    grid-template-columns: 1fr;
  }
}
</style>

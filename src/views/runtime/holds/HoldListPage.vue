<template>
  <div class="runtime-page">
    <div class="runtime-page__header">
      <div>
        <h1 class="runtime-page__title">Hold 处置</h1>
        <p class="runtime-page__subtitle">
          浏览和处理需要人工干预的运行时阻断。业务 NG 结果请通过 Trace 查看。
        </p>
      </div>
    </div>

    <div class="hold-filter-bar">
      <el-select v-model="filterType" placeholder="类型筛选" clearable style="width: 150px">
        <el-option label="急停" value="SAFETY_ESTOP" />
        <el-option label="对账隔离" value="RUNTIME_RECONCILIATION" />
        <el-option label="人工阻断" value="MANUAL_HOLD" />
      </el-select>
      <el-select v-model="filterStatus" placeholder="状态筛选" clearable style="width: 150px">
        <el-option label="待处理" value="OPEN" />
        <el-option label="处理中" value="IN_PROGRESS" />
        <el-option label="已解决" value="RESOLVED" />
      </el-select>
    </div>

    <div v-if="loading" class="hold-list__loading">
      <el-skeleton v-for="n in 4" :key="n" animated class="hold-list__skeleton" />
    </div>

    <RuntimeEmptyState
      v-else-if="loadError"
      title="加载失败"
      :description="loadError"
      hint="请检查后端连接后重试"
    />

    <RuntimeEmptyState
      v-else-if="!loading && allHolds.length === 0"
      title="当前无待处理 Hold"
      description="所有运行中的工作线均无阻断状态。"
      hint="这是正常的系统状态——无需人工干预。"
    />

    <div v-else class="hold-list">
      <div
        v-for="s in filteredHolds"
        :key="s.id"
        class="hold-card"
        :class="`hold-card--${holdTone(s)}`"
        @click="selectHold(s.id)"
      >
        <div class="hold-card__top">
          <RuntimeStatusBadge
            :label="holdTypeLabel(s.hold_type)"
            :tone="holdTypeTone(s.hold_type)"
            size="small"
          />
          <span class="hold-card__status">{{ holdStatusLabel(s.status) }}</span>
          <span class="hold-card__id">#{{ s.id }}</span>
        </div>
        <div class="hold-card__reason">{{ s.source_reason }}</div>
        <div class="hold-card__meta">{{ formatTime(s.created_at) }}</div>
      </div>

      <RuntimeEmptyState
        v-if="allHolds.length > 0 && filteredHolds.length === 0"
        title="无匹配 Hold"
        description="当前筛选条件下没有 Hold。"
        hint="请调整类型或状态筛选条件。"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { runtimeApiMethods } from '@/api/modules/runtime'
import RuntimeEmptyState from '@/components/common/runtime/RuntimeEmptyState.vue'
import RuntimeStatusBadge from '@/components/common/runtime/RuntimeStatusBadge.vue'
import type { RuntimeHoldSummary, RuntimeWorklineSummary } from '@/types/runtime'
import type { RuntimeTone } from '@/utils/runtime-display'

const router = useRouter()
const loading = ref(false)
const loadError = ref<string | null>(null)
const allHolds = ref<RuntimeHoldSummary[]>([])
const filterType = ref<string | null>(null)
const filterStatus = ref<string | null>(null)

const filteredHolds = computed(() => {
  let items = allHolds.value
  if (filterType.value) items = items.filter((h: RuntimeHoldSummary) => h.hold_type === filterType.value)
  if (filterStatus.value) items = items.filter((h: RuntimeHoldSummary) => h.status === filterStatus.value)
  return [...items].sort((a, b) => {
    const severity: Record<string, number> = {
      SAFETY_ESTOP: 0, RUNTIME_RECONCILIATION: 1, MANUAL_HOLD: 2
    }
    return (severity[a.hold_type] ?? 3) - (severity[b.hold_type] ?? 3)
  })
})

function holdTypeLabel(type: string): string {
  const m: Record<string, string> = { SAFETY_ESTOP: '急停', RUNTIME_RECONCILIATION: '对账', MANUAL_HOLD: '阻断' }
  return m[type] ?? type
}

function holdTypeTone(type: string): RuntimeTone {
  const m: Record<string, RuntimeTone> = { SAFETY_ESTOP: 'danger', RUNTIME_RECONCILIATION: 'warning', MANUAL_HOLD: 'warning' }
  return m[type] ?? 'info'
}

function holdStatusLabel(s: string): string {
  const m: Record<string, string> = { OPEN: '待处理', IN_PROGRESS: '处理中', RESOLVED: '已解决', VOIDED: '已作废', REOPENED: '重新打开' }
  return m[s] ?? s
}

function holdTone(hold: RuntimeHoldSummary): RuntimeTone {
  if (hold.hold_type === 'SAFETY_ESTOP') return 'danger'
  if (hold.status === 'RESOLVED' || hold.status === 'VOIDED') return 'success'
  return 'warning'
}

function formatTime(iso: string | null | undefined): string {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
  } catch { return iso }
}

function selectHold(id: number) {
  router.push({ name: 'RuntimeHoldDetail', params: { holdId: id } })
}

async function loadHolds() {
  loading.value = true
  loadError.value = null
  try {
    const worklineList: RuntimeWorklineSummary[] = await runtimeApiMethods.worklines().send()
    const detailResults = await Promise.allSettled(
      worklineList.map(wl => runtimeApiMethods.worklineDetail(wl.id).send())
    )
    const holdIdSet = new Set<number>()
    for (const r of detailResults) {
      if (r.status === 'fulfilled') {
        for (const d of r.value.devices ?? []) {
          for (const hid of d.active_runtime_hold_ids ?? []) holdIdSet.add(hid)
        }
      }
    }
    if (holdIdSet.size === 0) { allHolds.value = []; loading.value = false; return }
    const holdResults = await Promise.allSettled(
      Array.from(holdIdSet).map(id => runtimeApiMethods.runtimeHoldDetail(id).send())
    )
    const holds: RuntimeHoldSummary[] = []
    for (const r of holdResults) {
      if (r.status === 'fulfilled') holds.push(r.value.summary)
      else ElMessage.warning('部分 Hold 查询失败')
    }
    allHolds.value = holds
  } catch (e: unknown) {
    loadError.value = e instanceof Error ? e.message : '未知错误'
  } finally {
    loading.value = false
  }
}

onMounted(() => { void loadHolds() })
</script>

<style scoped>
.hold-filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.hold-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.hold-list__loading {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.hold-list__skeleton {
  height: 88px;
  border-radius: 10px;
}

.hold-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px 16px;
  border: 1px solid rgb(245 158 11 / 0.12);
  border-radius: 10px;
  border-left: 3px solid rgb(245 158 11 / 0.4);
  background: #1e293b;
  cursor: pointer;
  transition: border-color 0.15s ease-out;
}

.hold-card:hover {
  border-color: rgb(245 158 11 / 0.32);
}

.hold-card--danger {
  border-left-color: rgb(220 38 38 / 0.6);
}

.hold-card--success {
  border-left-color: rgb(22 163 74 / 0.5);
}

.hold-card__top {
  display: flex;
  align-items: center;
  gap: 10px;
}

.hold-card__status {
  color: #94a3b8;
  font-size: 12px;
}

.hold-card__id {
  margin-left: auto;
  color: #64748b;
  font-family: var(--font-mono, 'JetBrains Mono');
  font-size: 12px;
}

.hold-card__reason {
  color: #f8fafc;
  font-size: 14px;
  font-weight: 600;
}

.hold-card__meta {
  color: #94a3b8;
  font-family: var(--font-mono, 'JetBrains Mono');
  font-size: 12px;
}

.runtime-page__subtitle {
  max-width: 640px;
  margin-top: 4px;
  color: #94a3b8;
  font-size: 13px;
  line-height: 1.6;
}
</style>

<template>
  <div
    v-loading="loading"
    class="sandbox-entry"
  >
    <div class="sandbox-entry__content">
      <div class="sandbox-entry__head">
        <div class="sandbox-entry__icon">
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
        <h1 class="sandbox-entry__title">Sandbox Testing</h1>
        <p class="sandbox-entry__desc">
          选择 SIMULATION 工作线进入沙箱调试模式，模拟设备事件和命令响应。
        </p>
      </div>

      <div
        v-if="simulationWorklines.length"
        class="sandbox-entry__list"
      >
        <button
          v-for="item in simulationWorklines"
          :key="item.id"
          type="button"
          class="sandbox-entry__card"
          @click="goToWorkbench(item.id)"
        >
          <div class="sandbox-entry__card-head">
            <span class="sandbox-entry__card-name">{{ item.line_name }}</span>
            <RuntimeStatusBadge
              label="SIMULATION"
              tone="warning"
              size="small"
            />
          </div>
          <div class="sandbox-entry__card-code">{{ item.line_code }}</div>
          <div class="sandbox-entry__card-arrow">
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
        </button>
      </div>

      <RuntimeEmptyState
        v-else-if="!loading"
        title="暂无 SIMULATION 工作线"
        description="当前没有配置为 SIMULATION 运行模式的工作线。"
        hint="请在工作线管理页面将工作线 run_mode 设置为 SIMULATION。"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import RuntimeEmptyState from '@/components/common/runtime/RuntimeEmptyState.vue'
import RuntimeStatusBadge from '@/components/common/runtime/RuntimeStatusBadge.vue'
import { runtimeApiMethods } from '@/api/modules/runtime'
import type { RuntimeWorklineSummary } from '@/types/runtime'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const simulationWorklines = ref<RuntimeWorklineSummary[]>([])

async function loadWorklines() {
  loading.value = true
  try {
    const worklines = await runtimeApiMethods.worklines().send()
    simulationWorklines.value = worklines.filter(w => w.run_mode === 'SIMULATION')
    const worklineId = route.query.worklineId
    if (worklineId) goToWorkbench(Number(worklineId), 'replace')
  } finally {
    loading.value = false
  }
}

function goToWorkbench(worklineId: number, method: 'push' | 'replace' = 'push') {
  router[method]({ name: 'RuntimeSandboxWorkbench', params: { worklineId } })
}

onMounted(() => void loadWorklines())
</script>

<style scoped>
.sandbox-entry {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 540px;
}

.sandbox-entry__content {
  max-width: 560px;
  width: 100%;
  text-align: center;
}

.sandbox-entry__head {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-bottom: 28px;
}

.sandbox-entry__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgb(245, 158, 11, 0.12);
  margin-bottom: 4px;
}

.sandbox-entry__icon svg {
  width: 24px;
  height: 24px;
  color: #f59e0b;
}

.sandbox-entry__title {
  color: var(--runtime-text-primary);
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.sandbox-entry__desc {
  color: var(--runtime-text-secondary);
  font-size: 14px;
  line-height: 1.5;
}

.sandbox-entry__list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.sandbox-entry__card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
  padding: 16px 48px 16px 20px;
  border: 1px solid rgb(245, 158, 11, 0.14);
  border-radius: 12px;
  background: var(--runtime-surface);
  text-align: left;
  cursor: pointer;
  transition: all 0.15s ease-out;
}

.sandbox-entry__card:hover {
  border-color: rgb(245, 158, 11, 0.35);
  background: rgb(245, 158, 11, 0.04);
}

.sandbox-entry__card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.sandbox-entry__card-name {
  color: var(--runtime-text-primary);
  font-size: 15px;
  font-weight: 600;
}

.sandbox-entry__card-code {
  color: var(--runtime-text-muted);
  font-size: 12px;
  font-family: var(--font-mono);
}

.sandbox-entry__card-arrow {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--runtime-text-muted);
  opacity: 0;
  transition:
    opacity 0.15s,
    color 0.15s;
}

.sandbox-entry__card:hover .sandbox-entry__card-arrow {
  opacity: 1;
  color: #f59e0b;
}

.sandbox-entry__card-arrow svg {
  width: 18px;
  height: 18px;
}
</style>

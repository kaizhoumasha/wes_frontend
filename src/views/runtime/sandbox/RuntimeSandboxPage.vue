<template>
  <div
    v-loading="loading"
    class="runtime-page sandbox-redirect-page"
  >
    <div class="sandbox-redirect-page__content">
      <h1 class="sandbox-redirect-page__title">Sandbox 深链入口</h1>
      <p class="sandbox-redirect-page__subtitle">
        Sandbox 调试功能已整合到工作线运行态页面。选择 SIMULATION 工作线后进入调试模式。
      </p>

      <div
        v-if="simulationWorklines.length"
        class="sandbox-redirect-page__list"
      >
        <button
          v-for="item in simulationWorklines"
          :key="item.id"
          type="button"
          class="sandbox-redirect-page__item"
          @click="goToWorkline(item.id)"
        >
          <div class="sandbox-redirect-page__item-name">{{ item.line_name }}</div>
          <div class="sandbox-redirect-page__item-code">{{ item.line_code }}</div>
          <RuntimeStatusBadge
            :label="item.run_mode"
            tone="warning"
            size="small"
          />
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

    // 如果 URL 有 worklineId 参数，直接跳转
    const worklineId = route.query.worklineId
    if (worklineId) {
      goToWorkline(Number(worklineId))
    }
  } finally {
    loading.value = false
  }
}

function goToWorkline(worklineId: number) {
  router.replace({
    path: '/runtime/worklines',
    query: { worklineId, mode: 'sandbox' }
  })
}

onMounted(() => {
  void loadWorklines()
})
</script>

<style scoped>
.sandbox-redirect-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 540px;
}

.sandbox-redirect-page__content {
  max-width: 600px;
  text-align: center;
}

.sandbox-redirect-page__title {
  color: #f8fafc;
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 8px;
}

.sandbox-redirect-page__subtitle {
  color: #94a3b8;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 24px;
}

.sandbox-redirect-page__list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sandbox-redirect-page__item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  padding: 16px;
  border: 1px solid rgb(245, 158, 11, 0.16);
  border-radius: 14px;
  background: rgb(30, 41, 59, 0.78);
  text-align: left;
  cursor: pointer;
  transition: border-color 0.15s ease-out;
}

.sandbox-redirect-page__item:hover {
  border-color: rgb(245, 158, 11, 0.38);
}

.sandbox-redirect-page__item-name {
  color: #f8fafc;
  font-size: 16px;
  font-weight: 700;
}

.sandbox-redirect-page__item-code {
  color: #94a3b8;
  font-size: 12px;
  font-family: var(--font-mono);
}
</style>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  attemptId: string
  observedAt: string
  result: string
  incomplete: boolean
  saved: boolean
  redactedContent: string
}>()

const side = ref<'request' | 'response'>('request')
const onlyDifferences = ref(false)
const copyStatus = ref('')

watch(
  () => props.attemptId,
  () => {
    side.value = 'request'
    onlyDifferences.value = false
    copyStatus.value = ''
  }
)

async function copySnapshot() {
  const attemptId = props.attemptId
  const text = [
    `采集时状态：${props.observedAt}`,
    `当次接口结果：${props.result}`,
    `attempt_id：${attemptId}`,
    `${props.incomplete ? '采集不完整' : '已采集'}；${props.saved ? '已保存' : '未保存'}`,
    props.redactedContent
  ].join('\n')
  try {
    await navigator.clipboard.writeText(text)
    if (props.attemptId === attemptId) copyStatus.value = '已复制脱敏快照'
  } catch {
    if (props.attemptId === attemptId) copyStatus.value = '复制失败，请检查浏览器剪贴板权限'
  }
}
</script>

<template>
  <section
    class="exchange-detail"
    aria-label="当次交互详情"
  >
    <header>
      <div>
        <h2>当次接口结果：{{ result }}</h2>
        <p>
          采集时状态 ·
          <time>{{ observedAt }}</time>
        </p>
      </div>
      <button
        type="button"
        data-action="copy"
        @click="copySnapshot"
      >
        复制脱敏快照
      </button>
    </header>
    <p
      v-if="incomplete || !saved"
      class="capture-notice"
    >
      <span v-if="incomplete">△ 采集不完整，请结合原始业务证据排查。</span>
      <span v-if="!saved">未保存；离开视图后可能无法回看。</span>
    </p>
    <p
      class="copy-status"
      role="status"
    >
      {{ copyStatus }}
    </p>
    <div
      class="side-switch"
      role="group"
      aria-label="报文方向"
    >
      <button
        type="button"
        data-side="request"
        :aria-pressed="side === 'request'"
        @click="side = 'request'"
      >
        请求
      </button>
      <button
        type="button"
        data-side="response"
        :aria-pressed="side === 'response'"
        @click="side = 'response'"
      >
        响应
      </button>
    </div>
    <div class="wire-content"><slot :name="side" /></div>
    <label class="difference-filter">
      <input
        v-model="onlyDifferences"
        type="checkbox"
      />
      只看差异与未校验项
    </label>
    <div data-section="comparisons">
      <slot
        name="comparisons"
        :side="side"
        :only-differences="onlyDifferences"
      />
    </div>
  </section>
</template>

<style scoped>
.exchange-detail {
  min-width: 0;
  padding: 16px;
  color: var(--color-text-primary);
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
}
header {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}
h2 {
  margin: 0;
  font-size: 14px;
}
header p {
  margin: 8px 0 0;
  color: var(--color-text-secondary);
  font-size: 12px;
}
time {
  font-family: 'JetBrains Mono', monospace;
  overflow-wrap: anywhere;
}
button {
  padding: 6px 12px;
  color: var(--color-text-primary);
  font: inherit;
  font-size: 12px;
  cursor: pointer;
  background: transparent;
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
}
button:focus-visible,
input:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
button[aria-pressed='true'] {
  color: var(--color-primary);
  border-color: var(--color-primary);
}
.capture-notice {
  display: grid;
  gap: 4px;
  margin: 12px 0 0;
  color: var(--color-warning);
  font-size: 12px;
}
.copy-status {
  min-height: 18px;
  margin: 6px 0;
  color: var(--color-text-secondary);
  font-size: 12px;
}
.side-switch {
  display: flex;
  gap: 8px;
}
.wire-content {
  max-height: 320px;
  margin: 12px 0;
  overflow: auto;
}
.difference-filter {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}
</style>

<script setup lang="ts">
import { ref } from 'vue'
import type { ExchangesQuery } from '@/api/modules/wmsDiagnostics'
defineProps<{ recent: boolean; loading: boolean }>()
const emit = defineEmits<{ apply: [query: ExchangesQuery] }>()
const direction = ref<'' | 'WMS_TO_WES' | 'WES_TO_WMS'>('')
const operation = ref(''),
  operationId = ref(''),
  businessReference = ref('')
const onlyErrors = ref(false),
  from = ref(''),
  to = ref(''),
  error = ref('')
function apply() {
  const fromMs = from.value ? new Date(from.value).getTime() : undefined
  const toMs = to.value ? new Date(to.value).getTime() : undefined
  if (
    (fromMs !== undefined && (!Number.isFinite(fromMs) || fromMs < 0)) ||
    (toMs !== undefined && (!Number.isFinite(toMs) || toMs < 0)) ||
    (fromMs !== undefined && toMs !== undefined && fromMs > toMs)
  ) {
    error.value = '请选择有效时间范围，开始时间不得晚于结束时间'
    return
  }
  error.value = ''
  emit('apply', {
    direction: direction.value || undefined,
    operation: operation.value || undefined,
    operation_id: operationId.value || undefined,
    business_reference: businessReference.value || undefined,
    only_errors: onlyErrors.value,
    from_ms: fromMs,
    to_ms: toMs
  })
}
</script>

<template>
  <form
    class="diagnostics-filters"
    @submit.prevent="apply"
  >
    <label>
      方向
      <select v-model="direction">
        <option value="">全部方向</option>
        <option value="WMS_TO_WES">WMS → WES</option>
        <option value="WES_TO_WMS">WES → WMS</option>
      </select>
    </label>
    <label>
      Operation
      <input
        v-model="operation"
        maxlength="128"
        placeholder="精确匹配 operation"
      />
    </label>
    <label>
      Operation ID
      <input
        v-model="operationId"
        maxlength="128"
        placeholder="精确匹配交互身份"
      />
    </label>
    <label>
      业务关联
      <input
        v-model="businessReference"
        maxlength="128"
        placeholder="已知业务关联"
      />
    </label>
    <template v-if="recent">
      <label>
        开始时间（本机）
        <input
          v-model="from"
          type="datetime-local"
        />
      </label>
      <label>
        结束时间（本机）
        <input
          v-model="to"
          type="datetime-local"
        />
      </label>
    </template>
    <label class="check-label">
      <input
        v-model="onlyErrors"
        type="checkbox"
      />
      仅异常
    </label>
    <button
      type="submit"
      :disabled="loading"
    >
      {{ loading ? '查询中…' : '应用筛选' }}
    </button>
    <p
      v-if="error"
      role="alert"
    >
      {{ error }}
    </p>
  </form>
</template>

<style scoped>
.diagnostics-filters {
  display: flex;
  flex-wrap: wrap;
  align-items: end;
  gap: 12px;
  padding: 16px 0;
}
label {
  display: grid;
  gap: 6px;
  font-size: 12px;
}
input,
select,
button {
  min-height: 34px;
  padding: 6px 10px;
  color: inherit;
  background: var(--diag-panel);
  border: 1px solid var(--diag-border);
  border-radius: 6px;
}
input {
  width: 170px;
}
.check-label {
  display: flex;
  align-items: center;
  min-height: 34px;
}
input[type='checkbox'] {
  width: 16px;
  min-height: 16px;
  accent-color: var(--diag-accent);
}
:focus-visible {
  outline: 2px solid var(--diag-accent);
  outline-offset: 2px;
}
button {
  cursor: pointer;
}
button:disabled {
  opacity: 0.5;
  cursor: wait;
}
p {
  flex-basis: 100%;
  margin: 0;
  color: var(--diag-error);
}
</style>

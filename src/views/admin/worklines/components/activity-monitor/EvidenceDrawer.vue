<!--
  T5 Evidence 抽屉：暂无法跳转到具体来源查询（各业务插件的只读查询接口未逐一梳理），
  先做引用展示（列出证据引用/来源/位置摘要），后续接入具体来源时按类型补充跳转。
-->
<script setup lang="ts">
import type { PlaneActiveObjectView } from '@/api/types/plane-v2'
import { CONFLICT_STATE_LABEL } from './planeV2Helpers'

const props = defineProps<{ object: PlaneActiveObjectView | null }>()
const visible = defineModel<boolean>({ default: false })
void props
</script>

<template>
  <ElDrawer
    v-model="visible"
    title="活动对象证据"
    size="360px"
  >
    <template v-if="object">
      <dl class="evidence-facts">
        <dt>对象类型</dt>
        <dd class="mono">{{ object.object_type }}</dd>
        <dt>对象标识</dt>
        <dd class="mono">{{ object.object_key }}</dd>
        <dt>过程状态</dt>
        <dd>{{ CONFLICT_STATE_LABEL[object.conflict_state] }}</dd>
        <dt>操作提示</dt>
        <dd>{{ object.operator_hint || '—' }}</dd>
        <dt>主来源</dt>
        <dd>{{ object.primary_source || '—' }}</dd>
        <dt>全部来源</dt>
        <dd>{{ object.all_sources?.length ? object.all_sources.join('、') : '—' }}</dd>
      </dl>
      <section
        v-if="object.location_summary"
        class="evidence-location"
      >
        <h4>位置摘要</h4>
        <p>
          {{ object.location_summary.location_scope }} · {{ object.location_summary.location_code }}
        </p>
        <p>{{ CONFLICT_STATE_LABEL[object.location_summary.conflict_state] }}</p>
      </section>
      <section class="evidence-refs">
        <h4>证据引用</h4>
        <p
          v-if="!object.evidence_refs?.length"
          class="evidence-refs__empty"
        >
          暂无引用
        </p>
        <ul v-else>
          <li
            v-for="ref in object.evidence_refs ?? []"
            :key="ref"
            class="mono"
          >
            {{ ref }}
          </li>
        </ul>
        <p class="evidence-refs__hint">暂不支持从证据引用直接跳转到来源查询，仅作引用展示。</p>
      </section>
    </template>
  </ElDrawer>
</template>

<style scoped>
.mono {
  font-family: var(--font-mono);
}
.evidence-facts {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--space-3xs) var(--space-sm);
  margin: 0 0 var(--space-md);
  font-size: var(--el-font-size-base);
}
.evidence-facts dt {
  color: var(--color-text-secondary);
}
.evidence-facts dd {
  margin: 0;
}
.evidence-location,
.evidence-refs {
  margin-bottom: var(--space-md);
}
.evidence-location h4,
.evidence-refs h4 {
  margin: 0 0 var(--space-2xs);
  font-size: var(--el-font-size-base);
  font-weight: 600;
}
.evidence-refs ul {
  margin: 0;
  padding-left: var(--space-sm);
}
.evidence-refs__empty {
  color: var(--color-text-secondary);
}
.evidence-refs__hint {
  color: var(--color-text-secondary);
  font-size: var(--el-font-size-small);
}
</style>

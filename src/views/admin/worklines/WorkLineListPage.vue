<template>
  <CrudPageContainer :config="config" />
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import CrudPageContainer from '@/components/common/CrudPageContainer.vue'
import type { WorkLinesItem as Workline } from '@/api/modules/workLines'
import { buildRuntimeTraceQuery, buildRuntimeWorklineQuery } from '@/utils/runtime-route'
import { createWorkLinePageConfig } from './config/pageConfig'

const router = useRouter()

function openRuntime(workline: Workline) {
  router.push({ name: 'RuntimeWorklines', query: buildRuntimeWorklineQuery(workline.id) })
}

function openTrace(workline: Workline) {
  router.push({
    name: 'RuntimeWorklines',
    query: buildRuntimeTraceQuery({ worklineId: workline.id })
  })
}

const config = createWorkLinePageConfig({
  openRuntime,
  openTrace
})
</script>

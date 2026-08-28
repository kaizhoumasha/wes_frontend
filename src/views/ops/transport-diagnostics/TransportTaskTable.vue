<script setup lang="ts">
import AppButton from '@/components/ui/AppButton.vue'
import type { TasksResult } from '@/api/modules/transport'

type TaskSummary = TasksResult['items'][number]

defineProps<{
  tasks: TaskSummary[]
  selectedTaskId: string | null
  loading: boolean
  hasMore: boolean
}>()

const emit = defineEmits<{
  select: [transportTaskId: string]
  loadMore: []
}>()

function tagType(status: TaskSummary['status']): 'success' | 'warning' | 'danger' | 'info' {
  if (status === 'SUCCEEDED') return 'success'
  if (status === 'FAILED' || status === 'REJECTED') return 'danger'
  if (status === 'RECONCILING') return 'warning'
  return 'info'
}
</script>

<template>
  <section class="task-panel">
    <el-table
      v-loading="loading"
      :data="tasks"
      row-key="transport_task_id"
      highlight-current-row
      :current-row-key="selectedTaskId ?? undefined"
      empty-text="暂无 TransportTask"
      @row-click="row => emit('select', row.transport_task_id)"
    >
      <el-table-column
        label="TransportTask"
        min-width="220"
      >
        <template #default="{ row }">
          <span class="mono">{{ row.transport_task_id }}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="kind"
        label="能力"
        width="140"
      />
      <el-table-column
        label="状态"
        width="130"
      >
        <template #default="{ row }">
          <el-tag :type="tagType(row.status)">{{ row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="reason_code"
        label="原因"
        min-width="150"
      />
      <el-table-column
        prop="updated_at"
        label="更新时间"
        min-width="190"
      />
      <el-table-column
        label="Evidence"
        width="120"
      >
        <template #default="{ row }">
          {{ row.latest_evidence?.status ?? '—' }}
        </template>
      </el-table-column>
    </el-table>
    <footer
      v-if="hasMore"
      class="table-footer"
    >
      <AppButton
        :loading="loading"
        @click="emit('loadMore')"
      >
        加载更多
      </AppButton>
    </footer>
  </section>
</template>

<style scoped>
.task-panel {
  overflow: hidden;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 12px;
}

.mono {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
}

.table-footer {
  display: flex;
  justify-content: center;
  padding: 12px;
  border-top: 1px solid var(--el-border-color);
}
</style>

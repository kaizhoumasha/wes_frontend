<template>
  <div class="sandbox-pending-queue">
    <div
      v-if="loading"
      class="sandbox-pending-queue__skeleton"
    >
      <el-skeleton
        :rows="3"
        animated
      />
    </div>

    <div
      v-else-if="!items.length"
      class="sandbox-pending-queue__empty"
    >
      暂无待处理 Outbox
    </div>

    <div
      v-else
      class="sandbox-pending-queue__list"
    >
      <button
        v-for="item in items"
        :key="item.id"
        type="button"
        class="sandbox-pending-queue__item"
        @click="emit('select', item)"
      >
        <div class="sandbox-pending-queue__item-top">
          <span class="sandbox-pending-queue__dispatch-type">{{ item.dispatch_type }}</span>
          <RuntimeStatusBadge
            :status="item.status || 'NEW'"
            size="small"
          />
        </div>
        <div class="sandbox-pending-queue__item-info">
          <span class="sandbox-pending-queue__source">
            来自: {{ item.source_device || '系统' }}
          </span>
          <span class="sandbox-pending-queue__arrow">→</span>
          <span class="sandbox-pending-queue__target">处理: {{ item.target_code }}</span>
        </div>
        <div class="sandbox-pending-queue__item-footer">
          <span class="sandbox-pending-queue__item-code">{{ item.dispatch_key }}</span>
          <el-button
            v-if="item.status === 'SENT'"
            type="success"
            size="small"
            plain
            :loading="ackingIds.includes(item.id)"
            @click.stop="handleAck(item)"
          >
            ACK
          </el-button>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import RuntimeStatusBadge from '@/components/common/runtime/RuntimeStatusBadge.vue'
import { runtimeApiMethods } from '@/api/modules/runtime'
import type { SandboxPendingOutbox } from '@/types/runtime'

defineProps<{
  worklineId: number
  deviceId?: number | null
  items: SandboxPendingOutbox[]
  loading: boolean
}>()

const emit = defineEmits<{
  select: [outbox: SandboxPendingOutbox]
  acked: [outbox: SandboxPendingOutbox]
}>()

const ackingIds = ref<number[]>([])

async function handleAck(item: SandboxPendingOutbox) {
  if (!item.dispatch_key) {
    ElMessage.error('缺少 dispatch_key')
    return
  }

  ackingIds.value.push(item.id)
  try {
    const result = await runtimeApiMethods
      .sandboxAck({
        dispatch_key: item.dispatch_key
      })
      .send()
    ElMessage.success('ACK 成功')
    emit('acked', result)
  } catch (e) {
    ElMessage.error(`ACK 失败: ${e instanceof Error ? e.message : '未知错误'}`)
  } finally {
    ackingIds.value = ackingIds.value.filter(id => id !== item.id)
  }
}
</script>

<style scoped>
.sandbox-pending-queue {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 200px;
}

.sandbox-pending-queue__skeleton,
.sandbox-pending-queue__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
  color: #64748b;
  font-size: 13px;
}

.sandbox-pending-queue__list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sandbox-pending-queue__item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  padding: 12px;
  border: 1px solid rgb(245, 158, 11, 0.12);
  border-radius: 10px;
  background: rgb(30, 41, 59, 0.5);
  text-align: left;
  cursor: pointer;
  transition: border-color 0.15s ease-out;
}

.sandbox-pending-queue__item:hover {
  border-color: rgb(245, 158, 11, 0.28);
}

.sandbox-pending-queue__item.is-selected {
  border-color: rgb(245, 158, 11, 0.38);
  background: rgb(245, 158, 11, 0.08);
}

.sandbox-pending-queue__item-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.sandbox-pending-queue__dispatch-type {
  color: #94a3b8;
  font-size: 11px;
  font-family: var(--font-mono);
}

.sandbox-pending-queue__item-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.sandbox-pending-queue__source {
  color: #fbbf24;
  font-weight: 500;
}

.sandbox-pending-queue__arrow {
  color: #64748b;
}

.sandbox-pending-queue__target {
  color: #f8fafc;
  font-weight: 600;
}

.sandbox-pending-queue__item-code {
  color: #64748b;
  font-size: 11px;
  font-family: var(--font-mono);
}

.sandbox-pending-queue__item-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
</style>

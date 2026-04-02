<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElTree, ElRadioGroup, ElRadioButton } from 'element-plus'
import { StandardDialog } from '@/components/ui/StandardDialog'
import type { TreeNode } from '@/composables/useCrudListPage'

interface Props {
  /** 控制显示状态（兼容 v-model） */
  modelValue?: boolean
  /** 控制显示状态 */
  open?: boolean
  movingId: number | null
  treeData: TreeNode[]
  loading?: boolean
  rowKey?: string
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'update:open', value: boolean): void
  (e: 'confirm', targetId: number, position: 'before' | 'after' | 'inner'): void
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  open: false,
  loading: false,
  rowKey: 'id'
})

const emit = defineEmits<Emits>()

// 兼容 open 和 modelValue 两种绑定方式
const isOpen = computed(() => props.modelValue || props.open)

function handleUpdateModelValue(val: boolean) {
  emit('update:modelValue', val)
  emit('update:open', val)
}

const position = ref<'before' | 'after' | 'inner'>('inner')
const selectedTargetId = ref<number | null>(null)

const treeProps = {
  children: 'children',
  label: 'title'
}

function handleNodeClick(data: TreeNode) {
  // 不能移动到自己
  if (data.id === props.movingId) {
    selectedTargetId.value = null
    return
  }
  selectedTargetId.value = data.id as number
}

function handleConfirm() {
  if (!selectedTargetId.value) return
  emit('confirm', selectedTargetId.value, position.value)
}

function handleCancel() {
  selectedTargetId.value = null
  position.value = 'inner'
  emit('cancel')
}

const dialogProps = computed(() => ({
  title: '移动菜单',
  size: 'md' as const,
  confirmLoading: props.loading,
  confirmDisabled: !selectedTargetId.value || props.loading
}))
</script>

<template>
  <StandardDialog
    :model-value="isOpen"
    v-bind="dialogProps"
    @update:model-value="handleUpdateModelValue"
    @confirm="handleConfirm"
    @cancel="handleCancel"
  >
    <div class="move-dialog">
      <div class="move-dialog__tip">选择目标位置：</div>

      <ElRadioGroup
        v-model="position"
        class="move-dialog__position"
      >
        <ElRadioButton value="inner">作为子级</ElRadioButton>
        <ElRadioButton value="before">之前</ElRadioButton>
        <ElRadioButton value="after">之后</ElRadioButton>
      </ElRadioGroup>

      <div class="move-dialog__tree">
        <ElTree
          :data="treeData"
          :props="treeProps"
          :node-key="rowKey"
          highlight-current
          default-expand-all
          :expand-on-click-node="false"
          @node-click="handleNodeClick"
        />
      </div>
    </div>
  </StandardDialog>
</template>

<style scoped>
.move-dialog {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.move-dialog__tip {
  color: var(--el-text-color-regular);
}

.move-dialog__position {
  display: flex;
  gap: 8px;
}

.move-dialog__tree {
  max-height: 400px;
  overflow: auto;
  border: var(--el-border);
  border-radius: var(--el-border-radius-base);
  padding: 8px;
}
</style>

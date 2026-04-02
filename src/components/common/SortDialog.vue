<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { StandardDialog } from '@/components/ui/StandardDialog'
import type { TreeNode } from '@/composables/useCrudListPage'

interface Props {
  /** 控制显示状态 */
  modelValue?: boolean
  /** 控制显示状态（兼容 v-model） */
  open?: boolean
  /** 树形数据 */
  treeData: TreeNode[]
  /** 加载状态 */
  loading?: boolean
  /** 唯一标识字段 */
  rowKey?: string
}

interface SortItem {
  id: number
  parent_id: number | null
  sort_order: number
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'update:open', value: boolean): void
  /** 确认保存排序，返回批量排序数据 */
  (e: 'confirm', items: SortItem[]): void
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  open: false,
  loading: false,
  rowKey: 'id'
})

const emit = defineEmits<Emits>()

const localTreeData = ref<TreeNode[]>([])

watch(
  () => props.modelValue || props.open,
  val => {
    if (val) {
      localTreeData.value = JSON.parse(JSON.stringify(props.treeData))
    }
  },
  { immediate: true }
)

const isOpen = computed(() => props.modelValue || props.open)

function handleUpdateModelValue(val: boolean) {
  emit('update:modelValue', val)
  emit('update:open', val)
}

const treeProps = {
  children: 'children',
  label: 'title'
}

/**
 * 计算批量排序数据
 * 遍历当前树，返回每个节点的 id、parent_id 和 sort_order
 */
function calculateSortItems(): SortItem[] {
  const items: SortItem[] = []

  function traverse(nodes: TreeNode[], parentId: number | null) {
    nodes.forEach((node, index) => {
      items.push({
        id: node.id as number,
        parent_id: parentId,
        sort_order: index
      })
      if (node.children?.length) {
        traverse(node.children, node.id as number)
      }
    })
  }

  traverse(localTreeData.value, null)
  return items
}

async function handleConfirm() {
  const items = calculateSortItems()
  emit('confirm', items)
}

function handleCancel() {
  localTreeData.value = []
  emit('cancel')
}

const dialogProps = computed(() => ({
  title: '菜单排序',
  size: 'lg' as const,
  confirmLoading: props.loading,
  confirmText: '保存排序',
  cancelText: '取消'
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
    <div class="sort-dialog">
      <div class="sort-dialog__tip">拖拽节点调整顺序和层级</div>

      <div class="sort-dialog__tree">
        <el-tree
          v-model="localTreeData"
          :data="localTreeData"
          :props="treeProps"
          :node-key="rowKey"
          draggable
          default-expand-all
          :expand-on-click-node="false"
        />
      </div>
    </div>
  </StandardDialog>
</template>

<style scoped>
.sort-dialog {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sort-dialog__tip {
  color: var(--el-text-color-regular);
}

.sort-dialog__tree {
  max-height: 500px;
  overflow: auto;
  border: var(--el-border);
  border-radius: var(--el-border-radius-base);
  padding: 8px;
}

.sort-dialog__tree :deep(.el-tree-node__content) {
  height: 32px;
}
</style>

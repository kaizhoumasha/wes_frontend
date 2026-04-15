import { ElMessage } from 'element-plus'
import type { Ref, ShallowRef } from 'vue'
import type { TreeNode, TreeRequestAdapter } from '@/composables/useTreeCrud'
import { flattenTree, removeNodeFromTree, updateNodeInTree } from '@/composables/tree/tree-helpers'

interface UseTreeCrudMutationsOptions<T extends TreeNode> {
  requestAdapter: TreeRequestAdapter<T>
  treeData: ShallowRef<T[]>
  flatData: ShallowRef<T[]>
  loading: Ref<boolean>
  error: Ref<Error | null>
  childrenKey: string
  fetchTree: () => Promise<void>
}

export function useTreeCrudMutations<T extends TreeNode>({
  requestAdapter,
  treeData,
  flatData,
  loading,
  error,
  childrenKey,
  fetchTree,
}: UseTreeCrudMutationsOptions<T>) {
  async function create(data: unknown): Promise<T | null> {
    loading.value = true
    error.value = null

    try {
      const result = await requestAdapter.create(data)
      ElMessage.success('创建成功')
      await fetchTree()
      return result
    } catch (e) {
      error.value = e as Error
      ElMessage.error('创建失败')
      return null
    } finally {
      loading.value = false
    }
  }

  async function update(id: number, data: unknown): Promise<T | null> {
    loading.value = true
    error.value = null

    try {
      const result = await requestAdapter.update(id, data)
      ElMessage.success('更新成功')
      updateNodeInTree(treeData.value, id, result, childrenKey)
      flatData.value = flattenTree(treeData.value, childrenKey)
      return result
    } catch (e) {
      error.value = e as Error
      ElMessage.error('更新失败')
      return null
    } finally {
      loading.value = false
    }
  }

  async function deleteNode(id: number, options?: unknown): Promise<boolean> {
    loading.value = true
    error.value = null

    try {
      await requestAdapter.delete(id, options)
      ElMessage.success('删除成功')
      removeNodeFromTree(treeData.value, id, childrenKey)
      flatData.value = flattenTree(treeData.value, childrenKey)
      return true
    } catch (e) {
      error.value = e as Error
      ElMessage.error('删除失败')
      return false
    } finally {
      loading.value = false
    }
  }

  async function move(
    id: number,
    targetId: number,
    position: 'before' | 'after' | 'inner'
  ): Promise<boolean> {
    if (!requestAdapter.move) {
      console.warn('Move API not available')
      return false
    }

    loading.value = true
    error.value = null

    try {
      await requestAdapter.move({ id, target_id: targetId, position })
      ElMessage.success('移动成功')
      await fetchTree()
      return true
    } catch (e) {
      error.value = e as Error
      ElMessage.error('移动失败')
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    create,
    update,
    deleteNode,
    move,
  }
}

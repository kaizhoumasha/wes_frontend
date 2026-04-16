import type { TreeNode } from '@/composables/useTreeCrud'

export function flattenTree<T extends TreeNode>(
  tree: T[],
  childrenKey: string,
  result: T[] = []
): T[] {
  for (const node of tree) {
    result.push(node)
    const children = node[childrenKey] as T[] | undefined
    if (children && children.length > 0) {
      flattenTree(children, childrenKey, result)
    }
  }
  return result
}

export function findNodeInTree<T extends TreeNode>(
  tree: T[],
  id: number,
  childrenKey: string
): T | undefined {
  for (const node of tree) {
    if (node.id === id) {
      return node
    }
    const children = node[childrenKey] as T[] | undefined
    if (children && children.length > 0) {
      const found = findNodeInTree(children, id, childrenKey)
      if (found) {
        return found
      }
    }
  }
  return undefined
}

export function getNodePathInTree<T extends TreeNode>(
  tree: T[],
  id: number,
  childrenKey: string,
  path: T[] = []
): T[] | null {
  for (const node of tree) {
    if (node.id === id) {
      return [...path, node]
    }
    const children = node[childrenKey] as T[] | undefined
    if (children && children.length > 0) {
      const found = getNodePathInTree(children, id, childrenKey, [...path, node])
      if (found) {
        return found
      }
    }
  }
  return null
}

export function getDirectChildren<T extends TreeNode>(
  tree: T[],
  parentId: number,
  childrenKey: string
): T[] {
  for (const node of tree) {
    if (node.id === parentId) {
      return (node[childrenKey] as T[]) || []
    }
    const children = node[childrenKey] as T[] | undefined
    if (children && children.length > 0) {
      const found = getDirectChildren(children, parentId, childrenKey)
      if (found.length > 0) {
        return found
      }
    }
  }
  return []
}

export function removeNodeFromTree<T extends TreeNode>(
  tree: T[],
  id: number,
  childrenKey: string
): boolean {
  for (let i = 0; i < tree.length; i++) {
    if (tree[i].id === id) {
      tree.splice(i, 1)
      return true
    }
    const children = tree[i][childrenKey] as T[] | undefined
    if (children && children.length > 0) {
      if (removeNodeFromTree(children, id, childrenKey)) {
        return true
      }
    }
  }
  return false
}

export function updateNodeInTree<T extends TreeNode>(
  tree: T[],
  id: number,
  updated: T,
  childrenKey: string
): boolean {
  for (let i = 0; i < tree.length; i++) {
    if (tree[i].id === id) {
      tree[i] = { ...tree[i], ...updated }
      return true
    }
    const children = tree[i][childrenKey] as T[] | undefined
    if (children && children.length > 0) {
      if (updateNodeInTree(children, id, updated, childrenKey)) {
        return true
      }
    }
  }
  return false
}

export function updateChildrenInTree<T extends TreeNode>(
  tree: T[],
  parentId: number,
  children: T[],
  childrenKey: string
): void {
  for (const node of tree) {
    if (node.id === parentId) {
      ;(node as Record<string, unknown>)[childrenKey] = children
      return
    }
    const nodeChildren = node[childrenKey] as T[] | undefined
    if (nodeChildren && nodeChildren.length > 0) {
      updateChildrenInTree(nodeChildren, parentId, children, childrenKey)
    }
  }
}

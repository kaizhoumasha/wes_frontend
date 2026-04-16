export type MethodLike<T> = {
  send: () => Promise<T>
}

export type BatchDeleteSummary = {
  success: number
  failed: number
  total: number
}

export async function executeMethod<T>(method: MethodLike<T>): Promise<T> {
  return await method.send()
}

export async function executeBatchDeleteMethods(
  methods: MethodLike<unknown>[],
  total: number
): Promise<BatchDeleteSummary> {
  const settled = await Promise.allSettled(methods.map(method => executeMethod(method)))
  const success = settled.filter(item => item.status === 'fulfilled').length
  const failed = settled.length - success

  return {
    success,
    failed,
    total,
  }
}

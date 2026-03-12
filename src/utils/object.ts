/**
 * 对象工具函数
 *
 * 提供安全的对象属性访问和操作方法
 */

/**
 * 类型守卫：检查值是否为普通对象
 *
 * @param value - 要检查的值
 * @returns 是否为对象
 *
 * @example
 * isObject({}) // true
 * isObject([]) // false
 * isObject(null) // false
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * 安全地获取嵌套对象的属性值
 *
 * 支持点号分隔的路径，如 'user.profile.name'
 * 如果路径不存在，返回默认值
 *
 * @param obj - 要访问的对象
 * @param path - 属性路径（点号分隔）
 * @param defaultValue - 默认值（可选）
 * @returns 属性值或默认值
 *
 * @example
 * const data = { user: { profile: { name: 'John' } } }
 * getNestedValue(data, 'user.profile.name') // 'John'
 * getNestedValue(data, 'user.age') // undefined
 * getNestedValue(data, 'user.age', 0) // 0
 * getNestedValue(data, 'invalid.path', 'N/A') // 'N/A'
 */
export function getNestedValue<T = unknown>(
  obj: Record<string, unknown>,
  path: string,
  defaultValue?: T
): T {
  if (!path) {
    return defaultValue as T
  }

  const keys = path.split('.')
  let value: unknown = obj

  for (const key of keys) {
    // 类型守卫：确保当前值是对象
    if (!isObject(value)) {
      return defaultValue as T
    }

    // 检查属性是否存在
    if (!(key in value)) {
      return defaultValue as T
    }

    value = value[key]
  }

  // 返回值或默认值
  return (value ?? defaultValue) as T
}

/**
 * 安全地设置嵌套对象的属性值
 *
 * 支持点号分隔的路径，如 'user.profile.name'
 * 如果路径不存在，会自动创建中间对象
 *
 * @param obj - 要修改的对象
 * @param path - 属性路径（点号分隔）
 * @param value - 要设置的值
 * @returns 修改后的对象
 *
 * @example
 * const data = {}
 * setNestedValue(data, 'user.profile.name', 'John')
 * // data === { user: { profile: { name: 'John' } } }
 */
export function setNestedValue(
  obj: Record<string, unknown>,
  path: string,
  value: unknown
): Record<string, unknown> {
  if (!path) return obj

  const keys = path.split('.')
  let current: Record<string, unknown> = obj

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]

    // 如果中间路径不存在或不是对象，创建新对象
    if (!isObject(current[key])) {
      current[key] = {}
    }

    current = current[key] as Record<string, unknown>
  }

  // 设置最后一个键的值
  current[keys[keys.length - 1]] = value

  return obj
}

/**
 * 删除嵌套对象的属性
 *
 * 支持点号分隔的路径，如 'user.profile.name'
 * 删除后会清理空对象（可选）
 *
 * @param obj - 要修改的对象
 * @param path - 属性路径（点号分隔）
 * @param cleanEmpty - 是否删除空对象（默认 false）
 * @returns 是否成功删除
 *
 * @example
 * const data = { user: { profile: { name: 'John' } } }
 * deleteNestedValue(data, 'user.profile.name')
 * // data === { user: { profile: {} } }
 * deleteNestedValue(data, 'user.profile.name', true)
 * // data === {}
 */
export function deleteNestedValue(
  obj: Record<string, unknown>,
  path: string,
  cleanEmpty = false
): boolean {
  if (!path) return false

  const keys = path.split('.')
  let current: Record<string, unknown> | undefined = obj

  // 遍历到倒数第二层
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]

    if (!isObject(current[key])) {
      return false // 路径不存在
    }

    current = current[key] as Record<string, unknown>
  }

  // 删除最后一个键
  const lastKey = keys[keys.length - 1]
  if (isObject(current) && lastKey in current) {
    delete current[lastKey]

    // 清理空对象
    if (cleanEmpty) {
      const keysToCheck = [...keys].reverse()
      let checkObj: Record<string, unknown> | undefined = obj

      for (let i = 0; i < keysToCheck.length - 1; i++) {
        const key = keysToCheck[i]

        if (isObject(checkObj)) {
          const nextObj = checkObj[key] as Record<string, unknown>
          if (isObject(nextObj) && Object.keys(nextObj).length === 0) {
            delete checkObj[key]
          }
          checkObj = nextObj
        }
      }
    }

    return true
  }

  return false
}

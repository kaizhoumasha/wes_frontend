/**
 * Zod Schema 扩展
 *
 * 在此文件中添加自定义验证规则或覆盖自动生成的 schema
 *
 * 示例：
 * import { UserCreateSchema } from './generated/zod-schemas'
 *
 * export const UserCreateSchemaExtended = UserCreateSchema.superRefine((data, ctx) => {
 *   // 添加自定义验证
 *   if (data.username === 'admin') {
 *     ctx.addIssue({
 *       code: z.ZodIssueCode.custom,
 *       message: '不能使用 admin 作为用户名',
 *       path: ['username']
 *     })
 *   }
 * })
 */

// 导出所有自动生成的 schemas
export * from './generated/zod-schemas'

// 在此添加自定义验证扩展
// 如需使用 z 对象，请取消下面的导入
// import { z } from 'zod'

import type { CrudPageConfig, CrudPageEntity } from './types'

export function defineCrudPageConfig<
  TItem extends CrudPageEntity,
  TCreate extends object,
  TUpdate extends object
>(config: CrudPageConfig<TItem, TCreate, TUpdate>): CrudPageConfig<TItem, TCreate, TUpdate> {
  return config
}

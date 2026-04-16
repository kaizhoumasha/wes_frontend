export function createCrudResourceEndpoints<TCollectionPath extends string>(collection: TCollectionPath) {
  return {
    collection,
    item: `${collection}/{id}`,
    query: `${collection}/query`,
  }
}

export function createSoftDeleteCrudResourceEndpoints<TCollectionPath extends string>(collection: TCollectionPath) {
  const item = `${collection}/{id}`
  const trash = `${collection}/trash`

  return {
    collection,
    item,
    query: `${collection}/query`,
    restore: `${item}/restore`,
    trash,
    trashRestore: `${trash}/restore`,
    trashPermanentDelete: `${trash}/permanent`,
  }
}

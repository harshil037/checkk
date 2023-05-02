export const find = async ({ db, collection, find = {}, sort = {}, limit = 0 }) => {
  try {
    const result =
      limit === 1
        ? await db.collection(collection).findOne(find)
        : await db
            .collection(collection)
            .find(find) //
            .collation({ locale: 'en' })
            .sort(sort)
            .limit(limit)
            .toArray()
    return { error: null, data: result }
  } catch (error) {
    return { data: null, error }
  }
}

export const insert = async ({ db, collection, document }) => {
  try {
    return Array.isArray(document)
      ? await db
          .collection(collection) //
          .insertMany(document)
          .then(({ result, ops }) => {
            return result?.ok ? { data: ops[0], error: null } : { data: null, error: 'error inserting documents' }
          })
      : await db
          .collection(collection) //
          .insertOne(document)
          // .then(({ acknowledged, insertedId }) => {
          //   return acknowledged ? { data: insertedId, error: null } : { data: null, error: 'error inserting document' }
          .then(({result, ops}) => {
            return result?.ok ? { data: ops[0], error: null } : { data: null, error: 'error inserting document' }
          })
  } catch (error) {
    return { data: null, error }
  }
}

export const remove = async ({ db, collection, document, multi }) => {
  try {
    return multi
      ? await db
          .collection(collection) //
          .deleteMany(document)
          .then(({ result, deletedCount }) => {
            return result?.ok ? { data: deletedCount, error: null } : { data: null, error: 'error deleting documents' }
          })
      : await db
          .collection(collection) //
          .deleteOne(document)
          .then(({ result, deletedCount }) => {
            return result?.ok ? { data: deletedCount, error: null } : { data: null, error: 'error deleting document' }
          })
  } catch (error) {
    return { data: null, error }
  }
}

export const removeMany = async ({ db, collection, document }) => {
  try {
    return await db
      .collection(collection) //
      .deleteMany({ _id: { $in: document } })
      .then((res) => {
        const { result } = res
        return result?.ok
      })
  } catch (error) {
    return null
  }
}

export const updateAll = async ({
  db,
  collection,
  query = {},
  document,
  options = { returnOriginal: false, upsert: true },
}) => {
  try {
    return db
      .collection(collection)
      .updateOne(query, { $set: document }, options)
      .then((res) => {
        const { result } = res
        return result?.ok
      })
  } catch (error) {
    console.log(error)
    return null
  }
}

export const update = async ({ db, collection, query, document, options = {}, multi }) => {
  try {
    return multi
      ? await db
          .collection(collection) //
          .updateMany(query, document, options)
          .then(({ result, modifiedCount }) => {
            return result?.ok ? { data: modifiedCount, error: null } : { data: null, error: 'error updating documents' }
          })
      : await db
          .collection(collection) //
          .findOneAndUpdate(query, document, options)
          .then(({ ok, value }) => {
            return ok ? { data: value, error: null } : { data: null, error: 'error updating document' }
          })
  } catch (error) {
    return { data: null, error }
  }
}

export const replace = async ({ db, collection, query, document, options = {} }) => {
  try {
    return await db
      .collection(collection) //
      .findOneAndReplace(query, document, options)
      .then(({ ok, value }) => {
        return ok ? { data: value, error: null } : { data: null, error: 'error replacing document' }
      })
  } catch (error) {
    console.log(error)
    return { data: null, error }
  }
}

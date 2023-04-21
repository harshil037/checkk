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
            return result?.ok ? { data: ops, error: null } : { data: null, error: 'error inserting documents' }
          })
      : await db
          .collection(collection) //
          .insertOne(document)
          .then(({ result, ops }) => {
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

/**
 *
 * @function aggregate
 * @param {string} collection name of collection
 * @param {Object} query i.e {fieldName : fieldValue}
 * @param {Object} document fields and its corresponding values that are supposed to be changed
 * @param {number} skip number of documents to be skipped
 * @param {number} limit number of documents required.
 * @param {Object} sort to specify sorting order depending on which field.
 * @param {Array} options for to perform more aggregation operations.
 * @returns {promise} returns array of requested documents.
 */

export const aggregate = async ({ db, collection, query, document, skip, limit, sort, options = {} }) => {
  try {
    let aggregateArr = []

    let facetQuery = []
    facetQuery.push({ $match: query || {} })

    if (document && Object.entries(document).length > 0) {
      facetQuery.push({ $set: document })
    }
    if (sort && Object.entries(sort).length > 0) {
      facetQuery.push({ $sort: sort })
    }

    if (skip) {
      facetQuery.push({ $skip: skip })
    }
    if (limit) {
      facetQuery.push({ $limit: limit })
    }

    aggregateArr.push({
      $facet: {
        data: facetQuery,
        length: [{ $match: query || {} }, { $count: 'total' }],
      },
    })

    aggregateArr.push({ $unwind: '$length' })
    if (options && Array.isArray(options)) {
      options.forEach((item) => {
        aggregateArr.push(item)
      })
    }
    let result = await db.collection(collection).aggregate(aggregateArr).toArray()

    if (result && result?.[0]?.data) {
      return result[0]
    } else {
      return { data: [], error: null }
    }
  } catch (error) {
    console.log(error)
    return { data: null, error }
  }
}

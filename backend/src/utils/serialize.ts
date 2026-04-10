import type { HydratedDocument } from 'mongoose';

export function withId<T extends { _id: unknown }>(document: HydratedDocument<T> | T) {
  const plain = typeof document.toObject === 'function' ? document.toObject() : document;
  const { _id, ...rest } = plain as T & { _id: unknown };

  return {
    id: String(_id),
    ...rest,
  };
}

export function withIdList<T extends { _id: unknown }>(documents: Array<HydratedDocument<T> | T>) {
  return documents.map((document) => withId(document));
}
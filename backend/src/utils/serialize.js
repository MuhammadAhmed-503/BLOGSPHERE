"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withId = withId;
exports.withIdList = withIdList;
function withId(document) {
    const plain = typeof document.toObject === 'function' ? document.toObject() : document;
    const { _id, ...rest } = plain;
    return {
        id: String(_id),
        ...rest,
    };
}
function withIdList(documents) {
    return documents.map((document) => withId(document));
}

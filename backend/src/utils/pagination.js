"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizePagination = normalizePagination;
function normalizePagination(pageInput, limitInput) {
    const page = Math.max(1, Number(pageInput ?? 1));
    const limit = Math.min(100, Math.max(1, Number(limitInput ?? 10)));
    return {
        page,
        limit,
        skip: (page - 1) * limit,
    };
}

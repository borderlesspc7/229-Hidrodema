"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrmError = void 0;
class CrmError extends Error {
    name = "CrmError";
    status;
    retriable;
    constructor(message, opts) {
        super(message);
        this.status = opts?.status;
        this.retriable = opts?.retriable;
    }
}
exports.CrmError = CrmError;

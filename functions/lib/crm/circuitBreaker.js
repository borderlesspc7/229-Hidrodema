"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.circuitIsOpen = circuitIsOpen;
exports.circuitSnapshot = circuitSnapshot;
exports.circuitRecordSuccess = circuitRecordSuccess;
exports.circuitRecordFailure = circuitRecordFailure;
const state = {
    consecutiveFailures: 0,
    openUntilMs: 0,
};
function circuitIsOpen() {
    return Date.now() < state.openUntilMs;
}
function circuitSnapshot() {
    return { ...state };
}
function circuitRecordSuccess() {
    state.consecutiveFailures = 0;
    state.openUntilMs = 0;
    state.lastFailureAt = undefined;
}
function circuitRecordFailure(params) {
    state.consecutiveFailures += 1;
    state.lastFailureAt = new Date().toISOString();
    const cooldownMs = params?.cooldownMs ?? 60_000;
    const penalty = Math.min(10, state.consecutiveFailures);
    state.openUntilMs = Date.now() + cooldownMs * penalty;
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = env;
exports.envBool = envBool;
exports.envCsv = envCsv;
function env(name) {
    const v = process.env[name];
    return v && v.trim() ? v.trim() : null;
}
function envBool(name, fallback = false) {
    const v = env(name);
    if (!v)
        return fallback;
    return ["1", "true", "yes", "on"].includes(v.toLowerCase());
}
function envCsv(name) {
    const v = env(name);
    if (!v)
        return [];
    return v
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
}

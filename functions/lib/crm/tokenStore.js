"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStoredToken = getStoredToken;
exports.setStoredToken = setStoredToken;
exports.tokenIsFresh = tokenIsFresh;
exports.getStaticBearerToken = getStaticBearerToken;
const admin = __importStar(require("firebase-admin"));
const env_1 = require("./env");
const DOC_PATH = "integrations/crmAuth";
function nowMs() {
    return Date.now();
}
async function getStoredToken() {
    const snap = await admin.firestore().doc(DOC_PATH).get();
    if (!snap.exists)
        return null;
    const data = snap.data();
    const accessToken = typeof data.accessToken === "string" ? data.accessToken : null;
    const expiresAtMs = typeof data.expiresAtMs === "number" ? data.expiresAtMs : null;
    if (!accessToken || !expiresAtMs)
        return null;
    return { accessToken, expiresAtMs };
}
async function setStoredToken(token) {
    await admin.firestore().doc(DOC_PATH).set({
        accessToken: token.accessToken,
        expiresAtMs: token.expiresAtMs,
        updatedAt: new Date().toISOString(),
    }, { merge: true });
}
function tokenIsFresh(token, skewMs = 60_000) {
    return token.expiresAtMs - nowMs() > skewMs;
}
function getStaticBearerToken() {
    return (0, env_1.env)("CRM_BEARER_TOKEN");
}

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
exports.upsertSellerDirectoryRows = upsertSellerDirectoryRows;
exports.syncSellerDirectoryFromCrm = syncSellerDirectoryFromCrm;
exports.syncSingleSellerFromCrm = syncSingleSellerFromCrm;
const admin = __importStar(require("firebase-admin"));
const firebase_functions_1 = require("firebase-functions");
const crmSellerApi_1 = require("./crmSellerApi");
const sellerMapper_1 = require("./sellerMapper");
const COLLECTION = "sellerDirectory";
function chunk(arr, size) {
    const out = [];
    for (let i = 0; i < arr.length; i += size)
        out.push(arr.slice(i, i + size));
    return out;
}
async function upsertSellerDirectoryRows(rows) {
    const nowIso = new Date().toISOString();
    const db = admin.firestore();
    // batch do Firestore (v2 admin) suporta 500 ops; usamos 450 como margem
    const BATCH_MAX = 450;
    const batches = chunk(rows, BATCH_MAX);
    let processed = 0;
    for (const b of batches) {
        const batch = db.batch();
        for (const r of b) {
            const doc = (0, sellerMapper_1.mapCrmSellerToDirectoryDoc)(r, nowIso);
            const docId = (0, sellerMapper_1.safeFirestoreDocId)(doc.externalId);
            const ref = db.collection(COLLECTION).doc(docId);
            batch.set(ref, doc, { merge: true });
            processed++;
        }
        await batch.commit();
    }
    return { processed, updatedAt: nowIso };
}
async function syncSellerDirectoryFromCrm() {
    const rows = await (0, crmSellerApi_1.fetchAllCrmSellers)();
    firebase_functions_1.logger.info("CRM sellers fetched.", { fetched: rows.length });
    const res = await upsertSellerDirectoryRows(rows);
    return { ok: true, fetched: rows.length, processed: res.processed, updatedAt: res.updatedAt };
}
async function syncSingleSellerFromCrm(params) {
    const row = await (0, crmSellerApi_1.fetchCrmSellerById)(params.sellerId);
    if (!row)
        return { ok: true, sellerId: params.sellerId, processed: 0, updatedAt: new Date().toISOString() };
    const res = await upsertSellerDirectoryRows([row]);
    return { ok: true, sellerId: params.sellerId, processed: 1, updatedAt: res.updatedAt };
}

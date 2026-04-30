"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExternalIdFromCrmSeller = getExternalIdFromCrmSeller;
exports.mapCrmSellerToDirectoryDoc = mapCrmSellerToDirectoryDoc;
exports.safeFirestoreDocId = safeFirestoreDocId;
function pickString(r, keys) {
    for (const k of keys) {
        const v = r[k];
        if (typeof v === "string" && v.trim())
            return v.trim();
        if (typeof v === "number")
            return String(v);
    }
    return undefined;
}
function pickBool(r, keys) {
    for (const k of keys) {
        const v = r[k];
        if (typeof v === "boolean")
            return v;
        if (typeof v === "number")
            return v !== 0;
        if (typeof v === "string") {
            const s = v.trim().toLowerCase();
            if (["true", "1", "yes", "y", "sim", "ativo"].includes(s))
                return true;
            if (["false", "0", "no", "n", "nao", "não", "inativo"].includes(s))
                return false;
        }
    }
    return undefined;
}
function getExternalIdFromCrmSeller(r) {
    const id = pickString(r, ["id", "externalId", "sellerId", "sellerExternalId", "uuid"]) ??
        pickString(r, ["code", "codigo", "matricula"]);
    if (id)
        return id;
    const email = pickString(r, ["email", "mail"]);
    if (email)
        return `email:${email}`;
    const name = pickString(r, ["name", "nome", "fullName"]);
    if (name)
        return `name:${name}`;
    return `hash:${JSON.stringify(r).slice(0, 120)}`;
}
function mapCrmSellerToDirectoryDoc(r, nowIso) {
    return {
        externalId: getExternalIdFromCrmSeller(r),
        code: pickString(r, ["code", "codigo", "sellerCode", "matricula"]),
        name: pickString(r, ["name", "nome", "fullName", "razaoSocial"]),
        email: pickString(r, ["email", "mail", "corporateEmail", "loginEmail"]),
        active: pickBool(r, ["active", "isActive", "status", "enabled"]),
        teamId: pickString(r, ["teamId", "team_id", "equipeId", "equipe"]),
        regionId: pickString(r, ["regionId", "region_id", "regiaoId", "regiao"]),
        raw: r,
        updatedAt: nowIso,
    };
}
/** IDs de documento Firestore não podem conter `/`. */
function safeFirestoreDocId(externalId) {
    return externalId.replace(/\//g, "__").slice(0, 1400);
}

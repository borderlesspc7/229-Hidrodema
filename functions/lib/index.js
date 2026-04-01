"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProfissionalUsuario = exports.createClienteUsuario = void 0;
const app_1 = require("firebase-admin/app");
const auth_1 = require("firebase-admin/auth");
const firestore_1 = require("firebase-admin/firestore");
const https_1 = require("firebase-functions/v2/https");
(0, app_1.initializeApp)();
const db = (0, firestore_1.getFirestore)();
const adminAuth = (0, auth_1.getAuth)();
function onlyDigits(value) {
    return value.replace(/\D/g, '');
}
function assertRequiredString(value, field) {
    if (typeof value !== 'string' || value.trim().length === 0) {
        throw new https_1.HttpsError('invalid-argument', `Campo obrigatório: ${field}.`);
    }
    return value.trim();
}
function mapFirebaseError(err) {
    const code = typeof err === 'object' &&
        err !== null &&
        'code' in err &&
        typeof err.code === 'string'
        ? err.code
        : '';
    if (code === 'auth/email-already-exists') {
        return new https_1.HttpsError('already-exists', 'E-mail já está em uso.');
    }
    if (code === 'auth/uid-already-exists') {
        return new https_1.HttpsError('already-exists', 'Usuário já existe.');
    }
    return new https_1.HttpsError('internal', 'Não foi possível criar o cliente.');
}
function parseCommonPayload(data) {
    const nome = assertRequiredString(data.nome, 'nome');
    const cpf = onlyDigits(assertRequiredString(data.cpf, 'cpf'));
    const email = assertRequiredString(data.email, 'email').toLowerCase();
    const celular = onlyDigits(assertRequiredString(data.celular, 'celular'));
    const localizacao = assertRequiredString(data.localizacao, 'localizacao');
    const cidade = assertRequiredString(data.cidade, 'cidade');
    const estado = assertRequiredString(data.estado, 'estado').toUpperCase();
    const password = assertRequiredString(data.password, 'password');
    if (cpf.length !== 11) {
        throw new https_1.HttpsError('invalid-argument', 'CPF inválido.');
    }
    if (password.length < 6) {
        throw new https_1.HttpsError('invalid-argument', 'Senha deve ter pelo menos 6 caracteres.');
    }
    return { nome, cpf, email, celular, localizacao, cidade, estado, password };
}
exports.createClienteUsuario = (0, https_1.onCall)({ region: 'southamerica-east1' }, async (request) => {
    if (!request.auth?.uid) {
        throw new https_1.HttpsError('unauthenticated', 'É necessário estar autenticado.');
    }
    const data = request.data;
    const { nome, cpf, email, celular, localizacao, cidade, estado, password } = parseCommonPayload(data);
    const funcao = assertRequiredString(data.funcao, 'funcao');
    let uid = null;
    try {
        const userRecord = await adminAuth.createUser({
            email,
            password,
            displayName: nome,
        });
        uid = userRecord.uid;
        const batch = db.batch();
        batch.create(db.collection('documentRegistry').doc(cpf), { uid });
        batch.set(db.collection('users').doc(uid), {
            kind: 'pf',
            role: 'funcionario_cliente',
            funcao,
            document: cpf,
            name: nome,
            tradeName: null,
            email,
            phone: celular,
            localizacao,
            cidade,
            estado,
            locadoraId: null,
            createdAt: firestore_1.FieldValue.serverTimestamp(),
            createdBy: request.auth.uid,
        });
        await batch.commit();
        return { uid, email };
    }
    catch (err) {
        if (uid) {
            await adminAuth.deleteUser(uid).catch(() => undefined);
        }
        throw mapFirebaseError(err);
    }
});
exports.createProfissionalUsuario = (0, https_1.onCall)({ region: 'southamerica-east1' }, async (request) => {
    if (!request.auth?.uid) {
        throw new https_1.HttpsError('unauthenticated', 'É necessário estar autenticado.');
    }
    const data = request.data;
    const { nome, cpf, email, celular, localizacao, cidade, estado, password } = parseCommonPayload(data);
    let uid = null;
    try {
        const userRecord = await adminAuth.createUser({
            email,
            password,
            displayName: nome,
        });
        uid = userRecord.uid;
        const batch = db.batch();
        batch.create(db.collection('documentRegistry').doc(cpf), { uid });
        batch.set(db.collection('users').doc(uid), {
            kind: 'pf',
            role: 'profissional',
            funcao: 'Profissional',
            document: cpf,
            name: nome,
            tradeName: null,
            email,
            phone: celular,
            localizacao,
            cidade,
            estado,
            locadoraId: null,
            createdAt: firestore_1.FieldValue.serverTimestamp(),
            createdBy: request.auth.uid,
        });
        batch.set(db.collection('profissionais').doc(uid), {
            nome,
            cpf,
            email,
            telefone: celular,
            localizacao,
            cidade,
            estado,
            status: 'pendente',
            saldoTaxaHabilitacao: 0,
            createdAt: firestore_1.FieldValue.serverTimestamp(),
            createdBy: request.auth.uid,
        });
        await batch.commit();
        return { uid, email };
    }
    catch (err) {
        if (uid) {
            await adminAuth.deleteUser(uid).catch(() => undefined);
        }
        throw mapFirebaseError(err);
    }
});
//# sourceMappingURL=index.js.map
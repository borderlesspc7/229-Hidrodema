interface FirebaseError {
  code?: string;
  message?: string;
  customData?: {
    serverResponse?: string;
  };
}

/** Mensagens para códigos atuais do Firebase Auth (incl. invalid-credential unificado). */
export default function getFirebaseErrorMessage(
  error: string | FirebaseError
): string {
  if (typeof error === "string") {
    if (error === "USER_DOC_MISSING") {
      return "Conta autenticada, mas não há perfil no sistema. Contacte o administrador.";
    }
    return error;
  }

  const errorCode = error?.code || "";
  const serverResponse = error?.customData?.serverResponse ?? "";
  const rawMsg = `${error?.message ?? ""} ${serverResponse}`.toLowerCase();

  switch (errorCode) {
    case "auth/user-not-found":
      return "Usuário não encontrado. Verifique seu email.";

    case "auth/wrong-password":
      return "Senha incorreta. Tente novamente.";

    case "auth/invalid-credential":
    case "auth/invalid-login-credentials":
      return "E-mail ou senha incorretos. Tente novamente.";

    case "auth/invalid-email":
      return "Email inválido. Verifique o formato.";

    case "auth/too-many-requests":
      return "Muitas tentativas. Tente novamente em alguns minutos.";

    case "auth/user-disabled":
      return "Conta desabilitada. Entre em contato com o suporte.";

    case "auth/network-request-failed":
      return "Erro de conexão. Verifique sua internet.";

    case "auth/unauthorized-domain":
      return "Domínio do Netlify não autorizado no Firebase. Adicione o domínio em Authentication → Settings → Authorized domains.";

    case "auth/invalid-api-key":
      return "Chave API inválida ou restrições na Google Cloud. Verifique o .env e as restrições da chave (localhost).";

    case "auth/operation-not-allowed":
      return "Login por e-mail e senha não está ativo no Firebase. Ative em Authentication → Sign-in method.";

    case "auth/configuration-not-found":
      return "Projeto Firebase ou domínio de autenticação incorreto. Verifique authDomain e projectId no .env.";

    default:
      if (rawMsg.includes("api key") || rawMsg.includes("api_key")) {
        return "Problema com a API key (inválida ou bloqueada por referrer). Verifique credenciais na Google Cloud.";
      }
      if (rawMsg.includes("unauthorized") && rawMsg.includes("domain")) {
        return "Domínio do Netlify não autorizado no Firebase. Adicione o domínio em Authentication → Settings → Authorized domains.";
      }
      if (rawMsg.includes("bad request") || rawMsg.includes("400")) {
        return "Requisição recusada pelo Firebase (400). Verifique as variáveis VITE_FIREBASE_* no Netlify e o domínio autorizado no Firebase.";
      }
      if (rawMsg.includes("blocked") || rawMsg.includes("billing")) {
        return "Pedido bloqueado pelo Firebase. Verifique consola do projeto e faturação.";
      }
      return "Erro inesperado. Tente novamente.";
  }
}

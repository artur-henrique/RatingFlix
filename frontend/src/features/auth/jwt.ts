interface JwtPayload {
  sub: string;
  username: string;
  exp?: number;
}

function base64UrlDecode(input: string): string {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  return atob(padded);
}

/**
 * Decodifica (sem verificar assinatura) o payload de um JWT do backend.
 * Usado só para restaurar a sessão no reload da página a partir do token
 * salvo em localStorage — o backend continua sendo a fonte de verdade em
 * toda chamada real, verificando a assinatura a cada requisição.
 */
export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const [, payload] = token.split(".");
    return JSON.parse(base64UrlDecode(payload)) as JwtPayload;
  } catch {
    return null;
  }
}

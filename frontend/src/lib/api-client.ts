// Fora do Docker, o mesmo endereço serve pros dois lados (backend e frontend
// rodam ambos em "localhost", só em portas diferentes). Dentro do Docker
// Compose, isso deixa de ser verdade: código rodando no servidor (Server
// Components, dentro do container do frontend) precisa do nome do serviço
// (`http://backend:3333`, resolvido pela rede interna do Compose), enquanto
// código rodando no navegador do usuário (fora de qualquer container)
// continua precisando de `http://localhost:3333` (a porta publicada pro
// host). API_URL_INTERNAL só existe como variável de ambiente dentro do
// container do frontend; fora do Docker, cai no mesmo valor de sempre.
const API_URL =
  typeof window === "undefined"
    ? (process.env.API_URL_INTERNAL ?? process.env.NEXT_PUBLIC_API_URL)
    : process.env.NEXT_PUBLIC_API_URL;

export class ApiError extends Error {
  status: number;
  issues?: unknown;

  constructor(status: number, message: string, issues?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.issues = issues;
  }
}

interface ApiFetchOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  token?: string | null;
}

/**
 * Wrapper fino sobre fetch para chamar o backend do RatingFlix.
 * Não lê o token de nenhum storage global de propósito: quem chama decide
 * se e qual token enviar, o que mantém esta função pura e fácil de testar.
 */
export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { token, headers, body, ...rest } = options;

  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      // Só manda Content-Type quando há corpo de fato — com um corpo vazio
      // (ex: DELETE), o Fastify tenta fazer parse de JSON vazio e quebra
      // com FST_ERR_CTP_EMPTY_JSON_BODY.
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(response.status, data?.message ?? "Erro inesperado.", data?.issues);
  }

  return data as T;
}

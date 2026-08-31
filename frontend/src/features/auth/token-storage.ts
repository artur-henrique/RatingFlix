const TOKEN_KEY = "ratingflix:token";

type Listener = () => void;
const listeners = new Set<Listener>();

function emitChange() {
  for (const listener of listeners) listener();
}

/**
 * Assinatura para useSyncExternalStore: notifica quando o token muda,
 * seja por login()/logout() nesta mesma aba (emitChange) ou por outra aba
 * (evento "storage" do navegador — assim um logout em uma aba desloga as
 * outras também).
 */
export function subscribeToken(listener: Listener): () => void {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === TOKEN_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function getStoredToken(): string | null {
  return window.localStorage.getItem(TOKEN_KEY);
}

// Sentinela usada como snapshot no servidor / antes da hidratação — undefined
// é distinto de null (null = "sem token", undefined = "ainda não sabemos").
export function getServerToken(): string | undefined {
  return undefined;
}

export function setStoredToken(token: string): void {
  window.localStorage.setItem(TOKEN_KEY, token);
  emitChange();
}

export function clearStoredToken(): void {
  window.localStorage.removeItem(TOKEN_KEY);
  emitChange();
}

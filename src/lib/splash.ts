// Estado da splash da home, só em memória: cada carregamento de página (F5) começa do zero
// e a splash roda de novo. Sem React aqui; os componentes leem via useSyncExternalStore.
let finished = false;
let revealed = false;
// A splash veio no HTML do servidor? Só é verdade quando a home é a página carregada.
// Chegando na home por navegação interna, ela não roda.
let serverRendered: boolean | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function subscribeSplash(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// A splash já terminou (ou nem vai rodar) neste carregamento de página?
export function getSplashSeen() {
  if (finished) return true;
  if (serverRendered === null) {
    serverRendered = document.querySelector("[data-splash-root]") !== null;
  }
  return !serverRendered;
}

// A home já pode animar a entrada? (a splash começou a sair ou nem vai rodar)
export function getHomeRevealed() {
  return revealed || getSplashSeen();
}

export function revealHome() {
  revealed = true;
  emit();
}

export function markSplashSeen() {
  finished = true;
  revealed = true;
  emit();
}

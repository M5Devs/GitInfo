export type RoutePath = '/' | '/compare' | '/explore' | '/apps';

export interface RouteState {
  path: string;
  queryParams: URLSearchParams;
}

type RouteChangeCallback = (state: RouteState) => void;

const listeners: RouteChangeCallback[] = [];

export function normalizePath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith('/')) {
    pathname = pathname.slice(0, -1);
  }
  if (pathname === '/compare') return '/compare';
  if (pathname === '/explore') return '/explore';
  if (pathname === '/apps') return '/apps';
  return '/';
}

export function getCurrentRoute(): RouteState {
  const path = normalizePath(window.location.pathname);
  const queryParams = new URLSearchParams(window.location.search);
  return { path, queryParams };
}

export function navigateTo(url: string, replace = false): void {
  const targetUrl = new URL(url, window.location.origin);
  const path = normalizePath(targetUrl.pathname);

  if (replace) {
    window.history.replaceState({}, '', targetUrl.pathname + targetUrl.search);
  } else {
    window.history.pushState({}, '', targetUrl.pathname + targetUrl.search);
  }

  updateActiveNavLinks(path);
  notifyListeners();
}

export function addRouteListener(callback: RouteChangeCallback): () => void {
  listeners.push(callback);
  return () => {
    const idx = listeners.indexOf(callback);
    if (idx >= 0) listeners.splice(idx, 1);
  };
}

function notifyListeners(): void {
  const state = getCurrentRoute();
  listeners.forEach((cb) => cb(state));
}

export function updateActiveNavLinks(currentPath: string): void {
  const normPath = normalizePath(currentPath);
  const navLinks = document.querySelectorAll<HTMLAnchorElement>('[data-nav-link]');

  navLinks.forEach((link) => {
    const linkPath = normalizePath(link.getAttribute('data-nav-link') || '/');
    if (linkPath === normPath) {
      link.classList.add('bg-indigo-600/20', 'text-indigo-300', 'border', 'border-indigo-500/30', 'shadow-sm');
      link.classList.remove('text-slate-400', 'hover:bg-slate-800/50');
    } else {
      link.classList.remove('bg-indigo-600/20', 'text-indigo-300', 'border', 'border-indigo-500/30', 'shadow-sm');
      link.classList.add('text-slate-400', 'hover:bg-slate-800/50');
    }
  });
}

export function initRouter(onRouteChanged?: RouteChangeCallback): void {
  if (onRouteChanged) {
    addRouteListener(onRouteChanged);
  }

  document.addEventListener('click', (e) => {
    const target = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[data-nav-link], a[data-link], a[href]');
    if (target) {
      const href = target.getAttribute('href');
      if (
        href &&
        (href.startsWith('/') || href.startsWith(window.location.origin)) &&
        target.getAttribute('target') !== '_blank' &&
        !target.hasAttribute('download')
      ) {
        e.preventDefault();
        navigateTo(href);
      }
    }
  });

  window.addEventListener('popstate', () => {
    const state = getCurrentRoute();
    updateActiveNavLinks(state.path);
    notifyListeners();
  });

  const initialState = getCurrentRoute();
  updateActiveNavLinks(initialState.path);
  if (onRouteChanged) {
    onRouteChanged(initialState);
  }
}

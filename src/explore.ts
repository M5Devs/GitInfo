import { navigateTo } from './router';
import { formatNumber } from './utils/formatters';

export interface RankingRepo {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    avatar_url: string;
    html_url: string;
  };
  html_url: string;
  description: string;
  stargazers_count: number;
  forks_count: number;
  language: string;
  size: number; // size in KB
  sizeFormatted: string;
  weightCategory: 'feather' | 'light' | 'medium' | 'heavy' | 'titan' | 'blackHole';
  weightLabel: string;
}

export interface RankingsData {
  lastUpdated?: string;
  repos: RankingRepo[];
}

export const FALLBACK_RANKINGS: RankingRepo[] = [
  {
    id: 1,
    name: 'chromium',
    full_name: 'chromium/chromium',
    owner: {
      login: 'chromium',
      avatar_url: 'https://avatars.githubusercontent.com/u/1253018?v=4',
      html_url: 'https://github.com/chromium',
    },
    html_url: 'https://github.com/chromium/chromium',
    description: 'The open-source project behind Google Chrome browser.',
    stargazers_count: 18500,
    forks_count: 5200,
    language: 'C++',
    size: 47185920,
    sizeFormatted: '45.00 GB',
    weightCategory: 'blackHole',
    weightLabel: 'Black Hole 🕳️',
  },
  {
    id: 2,
    name: 'linux',
    full_name: 'torvalds/linux',
    owner: {
      login: 'torvalds',
      avatar_url: 'https://avatars.githubusercontent.com/u/102415?v=4',
      html_url: 'https://github.com/torvalds',
    },
    html_url: 'https://github.com/torvalds/linux',
    description: 'Linux kernel source tree maintained by Linus Torvalds.',
    stargazers_count: 185000,
    forks_count: 54000,
    language: 'C',
    size: 4404019,
    sizeFormatted: '4.20 GB',
    weightCategory: 'titan',
    weightLabel: 'Titan 🔴',
  },
  {
    id: 3,
    name: 'flutter',
    full_name: 'flutter/flutter',
    owner: {
      login: 'flutter',
      avatar_url: 'https://avatars.githubusercontent.com/u/14101776?v=4',
      html_url: 'https://github.com/flutter',
    },
    html_url: 'https://github.com/flutter/flutter',
    description: 'Flutter makes it easy and fast to build beautiful apps for mobile and beyond.',
    stargazers_count: 168000,
    forks_count: 26500,
    language: 'Dart',
    size: 1887436,
    sizeFormatted: '1.80 GB',
    weightCategory: 'titan',
    weightLabel: 'Titan 🔴',
  },
  {
    id: 4,
    name: 'godot',
    full_name: 'godotengine/godot',
    owner: {
      login: 'godotengine',
      avatar_url: 'https://avatars.githubusercontent.com/u/6180373?v=4',
      html_url: 'https://github.com/godotengine',
    },
    html_url: 'https://github.com/godotengine/godot',
    description: 'Godot Engine – Multi-platform 2D and 3D game engine.',
    stargazers_count: 92000,
    forks_count: 20500,
    language: 'C++',
    size: 1153433,
    sizeFormatted: '1.10 GB',
    weightCategory: 'titan',
    weightLabel: 'Titan 🔴',
  },
  {
    id: 5,
    name: 'rust',
    full_name: 'rust-lang/rust',
    owner: {
      login: 'rust-lang',
      avatar_url: 'https://avatars.githubusercontent.com/u/543096?v=4',
      html_url: 'https://github.com/rust-lang',
    },
    html_url: 'https://github.com/rust-lang/rust',
    description: 'Empowering everyone to build reliable and efficient software.',
    stargazers_count: 99000,
    forks_count: 12500,
    language: 'Rust',
    size: 972800,
    sizeFormatted: '950.00 MB',
    weightCategory: 'heavy',
    weightLabel: 'Heavy 🟠',
  },
  {
    id: 6,
    name: 'freeCodeCamp',
    full_name: 'freeCodeCamp/freeCodeCamp',
    owner: {
      login: 'freeCodeCamp',
      avatar_url: 'https://avatars.githubusercontent.com/u/9892522?v=4',
      html_url: 'https://github.com/freeCodeCamp',
    },
    html_url: 'https://github.com/freeCodeCamp/freeCodeCamp',
    description: "freeCodeCamp.org's open-source codebase and curriculum.",
    stargazers_count: 408000,
    forks_count: 38200,
    language: 'TypeScript',
    size: 389120,
    sizeFormatted: '380.00 MB',
    weightCategory: 'heavy',
    weightLabel: 'Heavy 🟠',
  },
  {
    id: 7,
    name: 'free-programming-books',
    full_name: 'EbookFoundation/free-programming-books',
    owner: {
      login: 'EbookFoundation',
      avatar_url: 'https://avatars.githubusercontent.com/u/14127308?v=4',
      html_url: 'https://github.com/EbookFoundation',
    },
    html_url: 'https://github.com/EbookFoundation/free-programming-books',
    description: '📚 Freely available programming books in all languages.',
    stargazers_count: 348000,
    forks_count: 62000,
    language: 'Python',
    size: 12288,
    sizeFormatted: '12.00 MB',
    weightCategory: 'medium',
    weightLabel: 'Medium 🟡',
  },
  {
    id: 8,
    name: 'awesome',
    full_name: 'sindresorhus/awesome',
    owner: {
      login: 'sindresorhus',
      avatar_url: 'https://avatars.githubusercontent.com/u/170270?v=4',
      html_url: 'https://github.com/sindresorhus',
    },
    html_url: 'https://github.com/sindresorhus/awesome',
    description: '😎 Awesome lists about all kinds of interesting topics.',
    stargazers_count: 335000,
    forks_count: 29500,
    language: 'JavaScript',
    size: 5120,
    sizeFormatted: '5.00 MB',
    weightCategory: 'light',
    weightLabel: 'Light 🟢',
  },
  {
    id: 9,
    name: 'react',
    full_name: 'facebook/react',
    owner: {
      login: 'facebook',
      avatar_url: 'https://avatars.githubusercontent.com/u/69631?v=4',
      html_url: 'https://github.com/facebook',
    },
    html_url: 'https://github.com/facebook/react',
    description: 'The library for web and native user interfaces.',
    stargazers_count: 232000,
    forks_count: 46800,
    language: 'JavaScript',
    size: 184320,
    sizeFormatted: '180.00 MB',
    weightCategory: 'heavy',
    weightLabel: 'Heavy 🟠',
  },
  {
    id: 10,
    name: 'vue',
    full_name: 'vuejs/vue',
    owner: {
      login: 'vuejs',
      avatar_url: 'https://avatars.githubusercontent.com/u/6128107?v=4',
      html_url: 'https://github.com/vuejs',
    },
    html_url: 'https://github.com/vuejs/vue',
    description: '🖖 Vue.js is a progressive, incrementally-adoptable JavaScript framework.',
    stargazers_count: 210000,
    forks_count: 33800,
    language: 'TypeScript',
    size: 43008,
    sizeFormatted: '42.00 MB',
    weightCategory: 'medium',
    weightLabel: 'Medium 🟡',
  },
  {
    id: 11,
    name: 'go',
    full_name: 'golang/go',
    owner: {
      login: 'golang',
      avatar_url: 'https://avatars.githubusercontent.com/u/4314092?v=4',
      html_url: 'https://github.com/golang',
    },
    html_url: 'https://github.com/golang/go',
    description: 'The Go programming language.',
    stargazers_count: 122000,
    forks_count: 17500,
    language: 'Go',
    size: 327680,
    sizeFormatted: '320.00 MB',
    weightCategory: 'heavy',
    weightLabel: 'Heavy 🟠',
  },
  {
    id: 12,
    name: 'cpython',
    full_name: 'python/cpython',
    owner: {
      login: 'python',
      avatar_url: 'https://avatars.githubusercontent.com/u/1525981?v=4',
      html_url: 'https://github.com/python',
    },
    html_url: 'https://github.com/python/cpython',
    description: 'The Python programming language implementation.',
    stargazers_count: 63000,
    forks_count: 30000,
    language: 'Python',
    size: 491520,
    sizeFormatted: '480.00 MB',
    weightCategory: 'heavy',
    weightLabel: 'Heavy 🟠',
  },
  {
    id: 13,
    name: 'vscode',
    full_name: 'microsoft/vscode',
    owner: {
      login: 'microsoft',
      avatar_url: 'https://avatars.githubusercontent.com/u/6154722?v=4',
      html_url: 'https://github.com/microsoft',
    },
    html_url: 'https://github.com/microsoft/vscode',
    description: 'Visual Studio Code source code.',
    stargazers_count: 162000,
    forks_count: 30500,
    language: 'TypeScript',
    size: 614400,
    sizeFormatted: '600.00 MB',
    weightCategory: 'heavy',
    weightLabel: 'Heavy 🟠',
  },
  {
    id: 14,
    name: 'git',
    full_name: 'git/git',
    owner: {
      login: 'git',
      avatar_url: 'https://avatars.githubusercontent.com/u/18134?v=4',
      html_url: 'https://github.com/git',
    },
    html_url: 'https://github.com/git/git',
    description: 'Git Source Code Mirror - free and open source distributed version control system.',
    stargazers_count: 53000,
    forks_count: 26000,
    language: 'C',
    size: 204800,
    sizeFormatted: '200.00 MB',
    weightCategory: 'heavy',
    weightLabel: 'Heavy 🟠',
  }
];

export const SUPPORTED_LANGUAGES = [
  'All',
  'TypeScript',
  'JavaScript',
  'Python',
  'Rust',
  'Go',
  'C++',
  'C'
];

export function filterRankings(repos: RankingRepo[], language: string): RankingRepo[] {
  if (!language || language === 'All') {
    return repos;
  }
  const langLower = language.trim().toLowerCase();
  return repos.filter((repo) => {
    if (!repo.language) return false;
    return repo.language.trim().toLowerCase() === langLower;
  });
}

export function sortRankings(repos: RankingRepo[], sortBy: 'stars' | 'forks' | 'size'): RankingRepo[] {
  const result = [...repos];
  if (sortBy === 'stars') {
    result.sort((a, b) => b.stargazers_count - a.stargazers_count);
  } else if (sortBy === 'forks') {
    result.sort((a, b) => b.forks_count - a.forks_count);
  } else if (sortBy === 'size') {
    result.sort((a, b) => b.size - a.size);
  }
  return result;
}

// Module State
let currentLanguage = 'All';
let currentSort: 'stars' | 'forks' | 'size' = 'stars';
let allRankings: RankingRepo[] = [...FALLBACK_RANKINGS];

export async function fetchRankingsData(): Promise<RankingRepo[]> {
  try {
    const fetchUrl = typeof window !== 'undefined' && window.location && window.location.origin
      ? new URL('/data/rankings.json', window.location.origin).toString()
      : 'https://gitinfo.pages.dev/data/rankings.json';

    const response = await fetch(fetchUrl);
    if (!response.ok) {
      return FALLBACK_RANKINGS;
    }
    const data = await response.json();
    if (data && Array.isArray(data.repos) && data.repos.length > 0) {
      return data.repos;
    } else if (Array.isArray(data) && data.length > 0) {
      return data;
    }
  } catch (err) {
    // Return fallback rankings silently
  }
  return FALLBACK_RANKINGS;
}

export function renderExploreHTML(): string {
  return `
    <div class="flex flex-col gap-6 sm:gap-8 max-w-full">
      <!-- Title & Header -->
      <div class="text-center space-y-2 max-w-2xl mx-auto">
        <h1 class="text-2xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-indigo-100 to-slate-400 bg-clip-text text-transparent">
          🏆 Explore GitHub Rankings Hub
        </h1>
        <p class="text-xs sm:text-base text-slate-400">
          Discover top repositories ranked by Stars ⭐, Forks 🍴, and GitInfo's signature <strong>Repository Weight Classification</strong>.
        </p>
      </div>

      <!-- Controls & Filter Section -->
      <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <!-- Language Filter Pills -->
        <div class="flex items-center gap-1.5 flex-wrap justify-center md:justify-start w-full md:w-auto" id="language-filter-container">
          ${SUPPORTED_LANGUAGES.map((lang) => `
            <button
              type="button"
              data-lang="${lang}"
              class="lang-pill px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                lang === currentLanguage
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }"
            >
              ${lang}
            </button>
          `).join('')}
        </div>

        <!-- Sort Controls -->
        <div class="flex items-center gap-2 shrink-0 w-full md:w-auto justify-center md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
          <span class="text-xs text-slate-400 font-semibold shrink-0">Sort By:</span>
          <div class="inline-flex rounded-xl bg-slate-950 p-1 border border-slate-800" id="sort-controls-container">
            <button
              type="button"
              data-sort="stars"
              class="sort-btn px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                currentSort === 'stars'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }"
            >
              ⭐ Stars
            </button>
            <button
              type="button"
              data-sort="forks"
              class="sort-btn px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                currentSort === 'forks'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }"
            >
              🍴 Forks
            </button>
            <button
              type="button"
              data-sort="size"
              class="sort-btn px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                currentSort === 'size'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }"
            >
              ⚖️ Size
            </button>
          </div>
        </div>
      </div>

      <!-- Rankings Table & Grid Container -->
      <div class="flex flex-col gap-4">
        <div class="flex items-center justify-between px-1">
          <span id="rankings-count-label" class="text-xs text-slate-400 font-mono">
            Showing repositories...
          </span>
        </div>

        <div id="rankings-list-container" class="flex flex-col gap-3">
          <!-- Dynamically populated via JS -->
        </div>
      </div>
    </div>
  `;
}

function getBadgeStyle(weightCategory: string): string {
  switch (weightCategory) {
    case 'blackHole':
      return 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40 animate-pulse';
    case 'titan':
      return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
    case 'heavy':
      return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
    case 'medium':
      return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    case 'light':
      return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    case 'feather':
    default:
      return 'bg-slate-800 text-slate-300 border-slate-700';
  }
}

function renderRankingRow(repo: RankingRepo, index: number): string {
  const rank = index + 1;
  const badgeClass = getBadgeStyle(repo.weightCategory);

  return `
    <div
      class="ranking-card bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-4 sm:p-5 transition-all duration-200 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
    >
      <div class="flex items-center gap-3.5 min-w-0">
        <!-- Rank # -->
        <span class="font-mono text-sm sm:text-base font-extrabold w-8 shrink-0 text-center text-indigo-400/90 bg-indigo-500/10 rounded-xl py-1 border border-indigo-500/20">
          #${rank}
        </span>

        <!-- Owner Avatar -->
        <img
          src="${repo.owner.avatar_url}"
          alt="${repo.owner.login}"
          class="w-10 h-10 sm:w-11 sm:h-11 rounded-xl border border-slate-800 shrink-0 bg-slate-950"
          loading="lazy"
        />

        <!-- Repo Info -->
        <div class="flex flex-col min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <a
              href="${repo.html_url}"
              target="_blank"
              rel="noopener noreferrer"
              class="text-sm sm:text-base font-bold text-white group-hover:text-indigo-400 transition-colors truncate"
              onclick="event.stopPropagation();"
            >
              ${repo.full_name}
            </a>
            ${
              repo.language
                ? `<span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-indigo-300 border border-slate-700 shrink-0">${repo.language}</span>`
                : ''
            }
          </div>
          <p class="text-xs text-slate-400 line-clamp-1 mt-0.5 leading-relaxed">
            ${repo.description || 'No description provided.'}
          </p>
        </div>
      </div>

      <!-- Stats & Actions -->
      <div class="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
        <!-- Stars & Forks -->
        <div class="flex items-center gap-3 text-xs font-mono text-slate-300">
          <span title="Stars">⭐ ${formatNumber(repo.stargazers_count)}</span>
          <span title="Forks" class="hidden sm:inline text-slate-400">🍴 ${formatNumber(repo.forks_count)}</span>
        </div>

        <!-- Formatted Repository Size & Weight Badge -->
        <div class="flex items-center gap-2">
          <span class="px-2.5 py-1 rounded-full text-[11px] font-bold border shrink-0 ${badgeClass}">
            ${repo.sizeFormatted} (${repo.weightLabel || repo.weightCategory})
          </span>

          <!-- Inspect Button -->
          <button
            type="button"
            class="inspect-repo-btn px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-semibold transition-all shrink-0 flex items-center gap-1 shadow-sm"
            data-repo="${repo.full_name}"
          >
            <span>Inspect</span>
            <span class="text-xs">→</span>
          </button>
        </div>
      </div>
    </div>
  `;
}

export function updateExploreView(container: HTMLElement): void {
  const listContainer = container.querySelector('#rankings-list-container') as HTMLElement;
  const countLabel = container.querySelector('#rankings-count-label') as HTMLElement;

  if (!listContainer) return;

  const filtered = filterRankings(allRankings, currentLanguage);
  const sorted = sortRankings(filtered, currentSort);

  if (countLabel) {
    countLabel.textContent = `Showing ${sorted.length} ${sorted.length === 1 ? 'repository' : 'repositories'} (${currentLanguage} • Sorted by ${currentSort})`;
  }

  if (sorted.length === 0) {
    listContainer.innerHTML = `
      <div class="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-sm">
        No repositories found for <strong>${currentLanguage}</strong>.
      </div>
    `;
    return;
  }

  listContainer.innerHTML = sorted.map((repo, idx) => renderRankingRow(repo, idx)).join('');

  // Re-bind inspect buttons
  listContainer.querySelectorAll('.inspect-repo-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const repo = (e.currentTarget as HTMLElement).getAttribute('data-repo');
      if (repo) {
        navigateTo(`/?repo=${encodeURIComponent(repo)}`);
      }
    });
  });

  // Re-bind card click
  listContainer.querySelectorAll('.ranking-card').forEach((card) => {
    card.addEventListener('click', (e) => {
      const btn = (e.currentTarget as HTMLElement).querySelector('.inspect-repo-btn');
      const repo = btn?.getAttribute('data-repo');
      if (repo) {
        navigateTo(`/?repo=${encodeURIComponent(repo)}`);
      }
    });
  });
}

export function initExploreEvents(container: HTMLElement): void {
  // Bind Language Filter Pills
  container.querySelectorAll('.lang-pill').forEach((pill) => {
    pill.addEventListener('click', (e) => {
      const lang = (e.currentTarget as HTMLElement).getAttribute('data-lang');
      if (lang) {
        currentLanguage = lang;
        // Update pill active classes
        container.querySelectorAll('.lang-pill').forEach((p) => {
          if (p.getAttribute('data-lang') === currentLanguage) {
            p.className = 'lang-pill px-3 py-1.5 rounded-xl text-xs font-bold transition-all bg-indigo-600 text-white shadow-md shadow-indigo-600/30';
          } else {
            p.className = 'lang-pill px-3 py-1.5 rounded-xl text-xs font-bold transition-all bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700';
          }
        });
        updateExploreView(container);
      }
    });
  });

  // Bind Sort Control Buttons
  container.querySelectorAll('.sort-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const sort = (e.currentTarget as HTMLElement).getAttribute('data-sort') as 'stars' | 'forks' | 'size';
      if (sort) {
        currentSort = sort;
        // Update button active classes
        container.querySelectorAll('.sort-btn').forEach((b) => {
          if (b.getAttribute('data-sort') === currentSort) {
            b.className = 'sort-btn px-3 py-1 rounded-lg text-xs font-semibold transition-all bg-indigo-600 text-white shadow-sm';
          } else {
            b.className = 'sort-btn px-3 py-1 rounded-lg text-xs font-semibold transition-all text-slate-400 hover:text-white';
          }
        });
        updateExploreView(container);
      }
    });
  });

  // Initial render with fallback data first (instant)
  updateExploreView(container);

  // Fetch rankings.json asynchronously and update
  fetchRankingsData().then((repos) => {
    allRankings = repos;
    updateExploreView(container);
  });
}

import { navigateTo } from './router';
import { showToast } from './main';

export interface CuratedRepo {
  owner: string;
  repo: string;
  description: string;
  sizeMBFormatted: string;
  weightCategory: 'titan' | 'blackHole' | 'heavy' | 'medium';
  starsFormatted: string;
  category: 'titan' | 'champion';
  shallowCmd?: string;
}

export const TITAN_REPOSITORIES: CuratedRepo[] = [
  {
    owner: 'chromium',
    repo: 'chromium',
    description: 'The open-source project behind Google Chrome browser.',
    sizeMBFormatted: '~45 GB',
    weightCategory: 'blackHole',
    starsFormatted: '18.5k',
    category: 'titan',
    shallowCmd: 'git clone --depth 1 https://github.com/chromium/chromium.git',
  },
  {
    owner: 'torvalds',
    repo: 'linux',
    description: 'Linux kernel source tree maintained by Linus Torvalds.',
    sizeMBFormatted: '~4.2 GB',
    weightCategory: 'titan',
    starsFormatted: '185k',
    category: 'titan',
    shallowCmd: 'git clone --depth 1 https://github.com/torvalds/linux.git',
  },
  {
    owner: 'flutter',
    repo: 'flutter',
    description: 'Flutter makes it easy and fast to build beautiful apps for mobile and beyond.',
    sizeMBFormatted: '~1.8 GB',
    weightCategory: 'titan',
    starsFormatted: '168k',
    category: 'titan',
    shallowCmd: 'git clone --depth 1 https://github.com/flutter/flutter.git',
  },
  {
    owner: 'godotengine',
    repo: 'godot',
    description: 'Godot Engine – Multi-platform 2D and 3D game engine.',
    sizeMBFormatted: '~1.1 GB',
    weightCategory: 'titan',
    starsFormatted: '92k',
    category: 'titan',
    shallowCmd: 'git clone --depth 1 https://github.com/godotengine/godot.git',
  },
  {
    owner: 'rust-lang',
    repo: 'rust',
    description: 'Empowering everyone to build reliable and efficient software.',
    sizeMBFormatted: '~950 MB',
    weightCategory: 'heavy',
    starsFormatted: '99k',
    category: 'titan',
    shallowCmd: 'git clone --depth 1 https://github.com/rust-lang/rust.git',
  },
];

export const CHAMPION_REPOSITORIES: CuratedRepo[] = [
  {
    owner: 'freeCodeCamp',
    repo: 'freeCodeCamp',
    description: "freeCodeCamp.org's open-source codebase and curriculum.",
    sizeMBFormatted: '~380 MB',
    weightCategory: 'heavy',
    starsFormatted: '408k',
    category: 'champion',
  },
  {
    owner: 'sindresorhus',
    repo: 'awesome',
    description: '😎 Awesome lists about all kinds of interesting topics.',
    sizeMBFormatted: '~5 MB',
    weightCategory: 'medium',
    starsFormatted: '335k',
    category: 'champion',
  },
  {
    owner: 'EbookFoundation',
    repo: 'free-programming-books',
    description: '📚 Freely available programming books in all languages.',
    sizeMBFormatted: '~12 MB',
    weightCategory: 'medium',
    starsFormatted: '348k',
    category: 'champion',
  },
  {
    owner: 'facebook',
    repo: 'react',
    description: 'The library for web and native user interfaces.',
    sizeMBFormatted: '~180 MB',
    weightCategory: 'heavy',
    starsFormatted: '232k',
    category: 'champion',
  },
  {
    owner: 'vuejs',
    repo: 'vue',
    description: '🖖 Vue.js is a progressive, incrementally-adoptable JavaScript framework.',
    sizeMBFormatted: '~42 MB',
    weightCategory: 'medium',
    starsFormatted: '210k',
    category: 'champion',
  },
];

export function renderExploreHTML(): string {
  return `
    <div class="flex flex-col gap-8 max-w-full">
      <!-- Title & Header -->
      <div class="text-center space-y-2 max-w-2xl mx-auto">
        <h1 class="text-2xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-indigo-100 to-slate-400 bg-clip-text text-transparent">
          🏆 Explore & Leaderboards
        </h1>
        <p class="text-xs sm:text-base text-slate-400">
          Discover curated open-source champions, massive codebase titans, and instant shallow clone shortcuts.
        </p>
      </div>

      <!-- Category Filter Tabs -->
      <div class="flex items-center justify-center gap-2 border-b border-slate-800 pb-3">
        <button
          type="button"
          id="tab-titans-btn"
          class="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
        >
          🦖 Heaviest Titans & Black Holes
        </button>
        <button
          type="button"
          id="tab-champions-btn"
          class="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all bg-slate-800 text-slate-400 hover:text-white"
        >
          ⭐ Top Starred Champions
        </button>
      </div>

      <!-- Section 1: Titans & Black Holes -->
      <div id="explore-titans-section" class="flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <h2 class="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
            <span>🦖 The Heaviest Codebase Titans & Black Holes</span>
          </h2>
          <span class="text-xs text-slate-400 font-mono">5 Curated Repositories</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${TITAN_REPOSITORIES.map((repo) => renderRepoCard(repo)).join('')}
        </div>
      </div>

      <!-- Section 2: Top Starred Champions -->
      <div id="explore-champions-section" class="hidden flex-col gap-4">
        <div class="flex items-center justify-between">
          <h2 class="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
            <span>⭐ Top Starred Open Source Champions</span>
          </h2>
          <span class="text-xs text-slate-400 font-mono">5 Curated Repositories</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${CHAMPION_REPOSITORIES.map((repo) => renderRepoCard(repo)).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderRepoCard(repo: CuratedRepo): string {
  const fullRepo = `${repo.owner}/${repo.repo}`;
  const badgeClass =
    repo.weightCategory === 'blackHole'
      ? 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40 animate-pulse'
      : repo.weightCategory === 'titan'
      ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
      : 'bg-orange-500/20 text-orange-300 border-orange-500/30';

  const shallowHtml = repo.shallowCmd
    ? `
    <div class="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 font-mono text-[11px] text-emerald-400 bg-slate-950 p-2 rounded-xl">
      <span class="truncate select-all">${repo.shallowCmd}</span>
      <button
        type="button"
        class="copy-shallow-btn shrink-0 text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
        data-cmd="${repo.shallowCmd}"
        title="Copy Shallow Clone Command"
      >
        📋
      </button>
    </div>
  `
    : '';

  return `
    <div
      class="explore-card bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-5 transition-all duration-200 shadow-xl flex flex-col justify-between cursor-pointer group"
      data-repo="${fullRepo}"
    >
      <div class="space-y-2">
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2 min-w-0">
            <span class="text-base font-bold text-white group-hover:text-indigo-400 transition-colors truncate">
              ${fullRepo}
            </span>
          </div>
          <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold border shrink-0 ${badgeClass}">
            ${repo.sizeMBFormatted}
          </span>
        </div>

        <p class="text-xs text-slate-400 leading-relaxed line-clamp-2">
          ${repo.description}
        </p>
      </div>

      <div class="pt-3 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/60 mt-3">
        <span class="flex items-center gap-1 text-slate-300 font-mono">
          ⭐ ${repo.starsFormatted} stars
        </span>
        <span class="text-indigo-400 group-hover:translate-x-1 transition-transform font-medium flex items-center gap-1">
          Inspect Repo →
        </span>
      </div>

      ${shallowHtml}
    </div>
  `;
}

export function initExploreEvents(container: HTMLElement): void {
  const tabTitansBtn = container.querySelector('#tab-titans-btn') as HTMLButtonElement;
  const tabChampionsBtn = container.querySelector('#tab-champions-btn') as HTMLButtonElement;
  const titansSection = container.querySelector('#explore-titans-section') as HTMLElement;
  const championsSection = container.querySelector('#explore-champions-section') as HTMLElement;

  tabTitansBtn?.addEventListener('click', () => {
    tabTitansBtn.className = 'px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all bg-indigo-600 text-white shadow-lg shadow-indigo-600/20';
    tabChampionsBtn.className = 'px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all bg-slate-800 text-slate-400 hover:text-white';
    titansSection.classList.remove('hidden');
    titansSection.classList.add('flex');
    championsSection.classList.add('hidden');
    championsSection.classList.remove('flex');
  });

  tabChampionsBtn?.addEventListener('click', () => {
    tabChampionsBtn.className = 'px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all bg-indigo-600 text-white shadow-lg shadow-indigo-600/20';
    tabTitansBtn.className = 'px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all bg-slate-800 text-slate-400 hover:text-white';
    championsSection.classList.remove('hidden');
    championsSection.classList.add('flex');
    titansSection.classList.add('hidden');
    titansSection.classList.remove('flex');
  });

  // Handle Shallow Clone Copy Buttons
  container.querySelectorAll('.copy-shallow-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation(); // don't navigate when copying command
      const cmd = (e.currentTarget as HTMLElement).getAttribute('data-cmd');
      if (cmd && navigator.clipboard) {
        navigator.clipboard.writeText(cmd);
        showToast('Shallow clone command copied! 📋');
      }
    });
  });

  // Handle Card Click -> Inspect repository on /
  container.querySelectorAll('.explore-card').forEach((card) => {
    card.addEventListener('click', () => {
      const repo = card.getAttribute('data-repo');
      if (repo) {
        navigateTo(`/?repo=${encodeURIComponent(repo)}`);
      }
    });
  });
}

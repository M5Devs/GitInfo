import { parseGitHubRepo } from './utils/parser';
import { formatRepoSize, formatNumber, formatRelativeTime } from './utils/formatters';
import { calculateLanguageBreakdown } from './utils/languages';
import { fetchRepoDetails, GitHubApiError } from './api/github';

export function calculateWeightComparison(sizeA: number, sizeB: number, nameA: string, nameB: string): {
  lighterRepo: 'A' | 'B' | 'equal';
  ratioText: string;
} {
  if (isNaN(sizeA) || isNaN(sizeB) || sizeA < 0 || sizeB < 0) {
    return { lighterRepo: 'equal', ratioText: 'Invalid size comparison' };
  }

  if (sizeA === sizeB) {
    return { lighterRepo: 'equal', ratioText: 'Both repositories are identical in size' };
  }

  if (sizeA < sizeB) {
    const ratio = sizeA === 0 ? '1.0' : (sizeB / sizeA).toFixed(1);
    const text = `${nameA} is ${ratio}x lighter than ${nameB}`;
    return { lighterRepo: 'A', ratioText: text };
  } else {
    const ratio = sizeB === 0 ? '1.0' : (sizeA / sizeB).toFixed(1);
    const text = `${nameB} is ${ratio}x lighter than ${nameA}`;
    return { lighterRepo: 'B', ratioText: text };
  }
}

export function renderCompareHTML(): string {
  return `
    <div class="flex flex-col gap-6 max-w-full">
      <!-- Title & Hero -->
      <div class="text-center space-y-2 max-w-2xl mx-auto">
        <h1 class="text-2xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-indigo-100 to-slate-400 bg-clip-text text-transparent">
          ⚔️ Repository Comparison
        </h1>
        <p class="text-xs sm:text-base text-slate-400">
          Compare repository size, stars, health metrics, and language breakdowns side-by-side.
        </p>
      </div>

      <!-- Compare Inputs Form -->
      <form id="compare-form" class="bg-slate-900/80 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl flex flex-col md:flex-row items-center gap-3">
        <div class="flex-1 w-full">
          <label for="repo-a-input" class="block text-xs font-semibold text-indigo-400 mb-1">Repo A</label>
          <input
            type="text"
            id="repo-a-input"
            placeholder="e.g. facebook/react"
            value="facebook/react"
            class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono"
          />
        </div>

        <div class="text-slate-500 font-bold text-sm px-2 hidden md:block">VS</div>

        <div class="flex-1 w-full">
          <label for="repo-b-input" class="block text-xs font-semibold text-purple-400 mb-1">Repo B</label>
          <input
            type="text"
            id="repo-b-input"
            placeholder="e.g. vuejs/core"
            value="vuejs/core"
            class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono"
          />
        </div>

        <button
          type="submit"
          id="compare-btn"
          class="w-full md:w-auto self-end px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-lg shadow-indigo-500/20 transition-all shrink-0 mt-2 md:mt-0"
        >
          Compare Repositories ⚔️
        </button>
      </form>

      <!-- Compare Error State -->
      <div id="compare-error" class="hidden bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 text-xs font-medium text-rose-300 text-center"></div>

      <!-- Compare Loading State -->
      <div id="compare-loading" class="hidden flex-col items-center justify-center py-12 gap-3 text-slate-400 animate-pulse">
        <div class="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <span class="text-xs font-mono">Fetching comparison data from GitHub...</span>
      </div>

      <!-- Compare Dashboard Results -->
      <div id="compare-dashboard" class="hidden flex-col gap-6">

        <!-- Weight Battle Banner -->
        <div class="bg-slate-950/90 border border-indigo-500/30 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col items-center text-center gap-3 relative overflow-hidden">
          <span class="text-xs font-bold tracking-wider uppercase text-indigo-400">🥊 Weight Battle Outcome</span>
          <div id="weight-ratio-badge" class="text-base sm:text-xl font-extrabold text-white bg-indigo-500/20 border border-indigo-500/40 rounded-2xl px-5 py-2">
            Loading...
          </div>

          <!-- Side-by-side Weight Cards -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full pt-2">
            <div id="weight-card-a" class="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col items-center gap-2">
              <span id="weight-name-a" class="font-bold text-sm text-indigo-300 truncate max-w-full">Repo A</span>
              <span id="weight-size-a" class="text-xl sm:text-2xl font-extrabold text-white font-mono">0 KB</span>
              <span id="weight-badge-a" class="px-3 py-1 rounded-full text-xs font-semibold capitalize border"></span>
            </div>

            <div id="weight-card-b" class="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col items-center gap-2">
              <span id="weight-name-b" class="font-bold text-sm text-purple-300 truncate max-w-full">Repo B</span>
              <span id="weight-size-b" class="text-xl sm:text-2xl font-extrabold text-white font-mono">0 KB</span>
              <span id="weight-badge-b" class="px-3 py-1 rounded-full text-xs font-semibold capitalize border"></span>
            </div>
          </div>
        </div>

        <!-- Side-By-Side Metrics Face-off Table -->
        <div class="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl overflow-x-auto">
          <h2 class="text-sm font-bold text-slate-100 mb-4 flex items-center gap-2">
            <span>📊 Metrics Face-off</span>
          </h2>
          <table class="w-full text-xs sm:text-sm text-left">
            <thead>
              <tr class="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-mono tracking-wider">
                <th class="pb-3 w-1/3">Metric</th>
                <th id="th-repo-a" class="pb-3 w-1/3 text-indigo-400 font-bold">Repo A</th>
                <th id="th-repo-b" class="pb-3 w-1/3 text-purple-400 font-bold">Repo B</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60 font-mono">
              <tr>
                <td class="py-3 font-sans text-slate-300 font-semibold">⭐ Stars</td>
                <td id="td-stars-a" class="py-3 text-slate-100">0</td>
                <td id="td-stars-b" class="py-3 text-slate-100">0</td>
              </tr>
              <tr>
                <td class="py-3 font-sans text-slate-300 font-semibold">🍴 Forks</td>
                <td id="td-forks-a" class="py-3 text-slate-100">0</td>
                <td id="td-forks-b" class="py-3 text-slate-100">0</td>
              </tr>
              <tr>
                <td class="py-3 font-sans text-slate-300 font-semibold">⚠️ Open Issues</td>
                <td id="td-issues-a" class="py-3 text-slate-100">0</td>
                <td id="td-issues-b" class="py-3 text-slate-100">0</td>
              </tr>
              <tr>
                <td class="py-3 font-sans text-slate-300 font-semibold">🕒 Last Pushed</td>
                <td id="td-pushed-a" class="py-3 text-slate-100">N/A</td>
                <td id="td-pushed-b" class="py-3 text-slate-100">N/A</td>
              </tr>
              <tr>
                <td class="py-3 font-sans text-slate-300 font-semibold">🛡️ License</td>
                <td id="td-license-a" class="py-3 text-slate-100">N/A</td>
                <td id="td-license-b" class="py-3 text-slate-100">N/A</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Side-By-Side Language Breakdowns -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col gap-3">
            <h3 id="lang-title-a" class="text-xs font-bold text-indigo-400 truncate">Repo A Languages</h3>
            <div id="lang-bar-a" class="w-full h-3 bg-slate-950 rounded-full overflow-hidden flex p-0.5 gap-0.5 border border-slate-800"></div>
            <div id="lang-legend-a" class="grid grid-cols-2 gap-2 text-xs pt-1"></div>
          </div>

          <div class="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col gap-3">
            <h3 id="lang-title-b" class="text-xs font-bold text-purple-400 truncate">Repo B Languages</h3>
            <div id="lang-bar-b" class="w-full h-3 bg-slate-950 rounded-full overflow-hidden flex p-0.5 gap-0.5 border border-slate-800"></div>
            <div id="lang-legend-b" class="grid grid-cols-2 gap-2 text-xs pt-1"></div>
          </div>
        </div>

      </div>
    </div>
  `;
}

export async function executeComparison(repoAStr: string, repoBStr: string): Promise<void> {
  const compareError = document.getElementById('compare-error');
  const compareLoading = document.getElementById('compare-loading');
  const compareDashboard = document.getElementById('compare-dashboard');

  if (!compareError || !compareLoading || !compareDashboard) return;

  compareError.classList.add('hidden');
  compareDashboard.classList.add('hidden');
  compareLoading.classList.remove('hidden');
  compareLoading.classList.add('flex');

  const parsedA = parseGitHubRepo(repoAStr);
  const parsedB = parseGitHubRepo(repoBStr);

  if (!parsedA || !parsedB) {
    compareLoading.classList.add('hidden');
    compareLoading.classList.remove('flex');
    compareError.textContent = 'Invalid repository input. Please specify valid "owner/repo" strings.';
    compareError.classList.remove('hidden');
    return;
  }

  try {
    const [dataA, dataB] = await Promise.all([
      fetchRepoDetails(parsedA.owner, parsedA.repo),
      fetchRepoDetails(parsedB.owner, parsedB.repo),
    ]);

    renderCompareResults(dataA, dataB);

    compareLoading.classList.add('hidden');
    compareLoading.classList.remove('flex');
    compareDashboard.classList.remove('hidden');
    compareDashboard.classList.add('flex');
  } catch (err: any) {
    compareLoading.classList.add('hidden');
    compareLoading.classList.remove('flex');
    if (err instanceof GitHubApiError) {
      compareError.textContent = `Comparison failed: ${err.message}`;
    } else {
      compareError.textContent = 'Comparison failed: Unable to fetch repository details.';
    }
    compareError.classList.remove('hidden');
  }
}

function getWeightBadgeInfo(weightCategory: string): { label: string; className: string } {
  switch (weightCategory) {
    case 'feather':
      return { label: 'Feather 🪶', className: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' };
    case 'light':
      return { label: 'Light 🟢', className: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30' };
    case 'medium':
      return { label: 'Medium 🟡', className: 'bg-amber-500/10 text-amber-300 border-amber-500/20' };
    case 'heavy':
      return { label: 'Heavy 🟠', className: 'bg-orange-500/15 text-orange-300 border-orange-500/30' };
    case 'titan':
      return { label: 'Titan 🔴', className: 'bg-rose-500/20 text-rose-300 border-rose-500/30' };
    case 'blackHole':
      return { label: 'Black Hole 🕳️', className: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40 animate-pulse' };
    default:
      return { label: 'Unknown', className: 'bg-slate-800 text-slate-300 border-slate-700' };
  }
}

function renderCompareResults(dataA: any, dataB: any): void {
  const repoA = dataA.repo;
  const repoB = dataB.repo;

  // Header Table Titles
  const thRepoA = document.getElementById('th-repo-a');
  const thRepoB = document.getElementById('th-repo-b');
  if (thRepoA) thRepoA.textContent = repoA.full_name;
  if (thRepoB) thRepoB.textContent = repoB.full_name;

  // Weight Battle
  const weightNameA = document.getElementById('weight-name-a');
  const weightNameB = document.getElementById('weight-name-b');
  const weightSizeA = document.getElementById('weight-size-a');
  const weightSizeB = document.getElementById('weight-size-b');
  const weightBadgeA = document.getElementById('weight-badge-a');
  const weightBadgeB = document.getElementById('weight-badge-b');
  const weightRatioBadge = document.getElementById('weight-ratio-badge');

  const sizeA = formatRepoSize(repoA.size);
  const sizeB = formatRepoSize(repoB.size);

  if (weightNameA) weightNameA.textContent = repoA.full_name;
  if (weightNameB) weightNameB.textContent = repoB.full_name;
  if (weightSizeA) weightSizeA.textContent = sizeA.formattedString;
  if (weightSizeB) weightSizeB.textContent = sizeB.formattedString;

  const badgeAInfo = getWeightBadgeInfo(sizeA.weightCategory);
  const badgeBInfo = getWeightBadgeInfo(sizeB.weightCategory);

  if (weightBadgeA) {
    weightBadgeA.textContent = badgeAInfo.label;
    weightBadgeA.className = `px-3 py-1 rounded-full text-xs font-semibold capitalize border ${badgeAInfo.className}`;
  }
  if (weightBadgeB) {
    weightBadgeB.textContent = badgeBInfo.label;
    weightBadgeB.className = `px-3 py-1 rounded-full text-xs font-semibold capitalize border ${badgeBInfo.className}`;
  }

  const comparison = calculateWeightComparison(repoA.size, repoB.size, repoA.full_name, repoB.full_name);
  if (weightRatioBadge) {
    weightRatioBadge.textContent = comparison.ratioText;
  }

  // Metrics Face-off
  const tdStarsA = document.getElementById('td-stars-a');
  const tdStarsB = document.getElementById('td-stars-b');
  const tdForksA = document.getElementById('td-forks-a');
  const tdForksB = document.getElementById('td-forks-b');
  const tdIssuesA = document.getElementById('td-issues-a');
  const tdIssuesB = document.getElementById('td-issues-b');
  const tdPushedA = document.getElementById('td-pushed-a');
  const tdPushedB = document.getElementById('td-pushed-b');
  const tdLicenseA = document.getElementById('td-license-a');
  const tdLicenseB = document.getElementById('td-license-b');

  if (tdStarsA) tdStarsA.textContent = `${formatNumber(repoA.stargazers_count)} ${repoA.stargazers_count > repoB.stargazers_count ? '👑' : ''}`;
  if (tdStarsB) tdStarsB.textContent = `${formatNumber(repoB.stargazers_count)} ${repoB.stargazers_count > repoA.stargazers_count ? '👑' : ''}`;

  if (tdForksA) tdForksA.textContent = `${formatNumber(repoA.forks_count)} ${repoA.forks_count > repoB.forks_count ? '👑' : ''}`;
  if (tdForksB) tdForksB.textContent = `${formatNumber(repoB.forks_count)} ${repoB.forks_count > repoA.forks_count ? '👑' : ''}`;

  if (tdIssuesA) tdIssuesA.textContent = formatNumber(repoA.open_issues_count);
  if (tdIssuesB) tdIssuesB.textContent = formatNumber(repoB.open_issues_count);

  if (tdPushedA) tdPushedA.textContent = formatRelativeTime(repoA.pushed_at);
  if (tdPushedB) tdPushedB.textContent = formatRelativeTime(repoB.pushed_at);

  if (tdLicenseA) tdLicenseA.textContent = repoA.license?.spdx_id || repoA.license?.name || 'N/A';
  if (tdLicenseB) tdLicenseB.textContent = repoB.license?.spdx_id || repoB.license?.name || 'N/A';

  // Languages
  renderCompareLanguages(dataA.languages, 'a', repoA.full_name);
  renderCompareLanguages(dataB.languages, 'b', repoB.full_name);
}

function renderCompareLanguages(languages: Record<string, number>, targetKey: 'a' | 'b', repoName: string): void {
  const langTitle = document.getElementById(`lang-title-${targetKey}`);
  const langBar = document.getElementById(`lang-bar-${targetKey}`);
  const langLegend = document.getElementById(`lang-legend-${targetKey}`);

  if (langTitle) langTitle.textContent = `${repoName} Languages`;
  if (!langBar || !langLegend) return;

  langBar.innerHTML = '';
  langLegend.innerHTML = '';

  const breakdown = calculateLanguageBreakdown(languages);
  if (breakdown.length === 0) {
    langBar.innerHTML = '<div class="w-full h-full bg-slate-800 rounded-full"></div>';
    langLegend.innerHTML = '<span class="text-slate-500 text-xs col-span-2">No language data</span>';
    return;
  }

  breakdown.forEach((lang) => {
    const segment = document.createElement('div');
    segment.className = 'h-full first:rounded-l-full last:rounded-r-full';
    segment.style.width = `${lang.percentage}%`;
    segment.style.backgroundColor = lang.color;
    segment.title = `${lang.name}: ${lang.formattedPercentage}`;
    langBar.appendChild(segment);

    const badge = document.createElement('div');
    badge.className = 'flex items-center gap-1.5 text-[11px] text-slate-300';
    badge.innerHTML = `
      <span class="w-2 h-2 rounded-full flex-shrink-0" style="background-color: ${lang.color}"></span>
      <span class="truncate">${lang.name}</span>
      <span class="text-slate-500 font-mono ml-auto">${lang.formattedPercentage}</span>
    `;
    langLegend.appendChild(badge);
  });
}

import './style.css';
import { parseGitHubRepo } from './utils/parser';
import { formatRepoSize, formatNumber, formatRelativeTime } from './utils/formatters';
import { calculateLanguageBreakdown } from './utils/languages';
import { fetchRepoDetails, GitHubApiError, getStoredPat, setStoredPat } from './api/github';

// DOM Element References
const searchForm = document.getElementById('search-form') as HTMLFormElement;
const repoInput = document.getElementById('repo-input') as HTMLInputElement;
const inputError = document.getElementById('input-error') as HTMLDivElement;
const presetBtns = document.querySelectorAll('.preset-btn');

// PAT Modal Elements
const togglePatBtn = document.getElementById('toggle-pat-btn') as HTMLButtonElement;
const patModal = document.getElementById('pat-modal') as HTMLElement;
const closePatModalBtn = document.getElementById('close-pat-modal') as HTMLButtonElement;
const patForm = document.getElementById('pat-form') as HTMLFormElement;
const patInput = document.getElementById('pat-input') as HTMLInputElement;
const clearPatBtn = document.getElementById('clear-pat-btn') as HTMLButtonElement;
const patIndicator = document.getElementById('pat-indicator') as HTMLSpanElement;

// Display States
const loadingSkeleton = document.getElementById('loading-skeleton') as HTMLElement;
const errorCard = document.getElementById('error-card') as HTMLElement;
const errorTitle = document.getElementById('error-title') as HTMLElement;
const errorMessage = document.getElementById('error-message') as HTMLElement;
const errorActionBtn = document.getElementById('error-action-btn') as HTMLButtonElement;
const repoDashboard = document.getElementById('repo-dashboard') as HTMLElement;

// Dashboard Elements
const ownerAvatar = document.getElementById('owner-avatar') as HTMLImageElement;
const ownerLink = document.getElementById('owner-link') as HTMLAnchorElement;
const repoLink = document.getElementById('repo-link') as HTMLAnchorElement;
const githubUrlBtn = document.getElementById('github-url-btn') as HTMLAnchorElement;
const repoDescription = document.getElementById('repo-description') as HTMLParagraphElement;
const homepageContainer = document.getElementById('homepage-container') as HTMLElement;
const homepageLink = document.getElementById('homepage-link') as HTMLAnchorElement;

// Hero Metrics
const heroSizeValue = document.getElementById('hero-size-value') as HTMLElement;
const heroSizeRaw = document.getElementById('hero-size-raw') as HTMLElement;
const weightBadge = document.getElementById('weight-badge') as HTMLElement;
const gaugeBar = document.getElementById('gauge-bar') as HTMLElement;

// Key Stats
const statStars = document.getElementById('stat-stars') as HTMLElement;
const statForks = document.getElementById('stat-forks') as HTMLElement;
const statWatchers = document.getElementById('stat-watchers') as HTMLElement;
const statIssues = document.getElementById('stat-issues') as HTMLElement;

// Metadata
const metaLicense = document.getElementById('meta-license') as HTMLElement;
const metaBranch = document.getElementById('meta-branch') as HTMLElement;
const metaPushed = document.getElementById('meta-pushed') as HTMLElement;

// Languages
const languagesTotalCount = document.getElementById('languages-total-count') as HTMLElement;
const languagesBar = document.getElementById('languages-bar') as HTMLElement;
const languagesLegend = document.getElementById('languages-legend') as HTMLElement;

// Initial state setup
function init(): void {
  updatePatUI();
  setupEventListeners();
  handleUrlQueryParams();
}

function updatePatUI(): void {
  const currentPat = getStoredPat();
  if (currentPat) {
    patInput.value = currentPat;
    patIndicator.className = 'w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400';
  } else {
    patInput.value = '';
    patIndicator.className = 'w-1.5 h-1.5 rounded-full bg-slate-500';
  }
}

function setupEventListeners(): void {
  repoInput.addEventListener('input', () => {
    hideInputError();
  });

  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = repoInput.value.trim();
    if (!query) {
      showInputError('Please enter a GitHub repository URL or owner/repo string.');
      return;
    }

    const parsed = parseGitHubRepo(query);
    if (!parsed) {
      showInputError('Invalid repository format. Please use "owner/repo" or "https://github.com/owner/repo".');
      return;
    }

    hideInputError();
    updateUrlQuery(parsed.owner, parsed.repo);
    inspectRepo(parsed.owner, parsed.repo);
  });

  presetBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const repoAttr = btn.getAttribute('data-repo');
      if (repoAttr) {
        repoInput.value = repoAttr;
        hideInputError();
        const parsed = parseGitHubRepo(repoAttr);
        if (parsed) {
          updateUrlQuery(parsed.owner, parsed.repo);
          inspectRepo(parsed.owner, parsed.repo);
        }
      }
    });
  });

  togglePatBtn.addEventListener('click', () => {
    patModal.classList.toggle('hidden');
  });

  closePatModalBtn.addEventListener('click', () => {
    patModal.classList.add('hidden');
  });

  patForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newToken = patInput.value.trim();
    setStoredPat(newToken);
    updatePatUI();
    patModal.classList.add('hidden');

    const query = repoInput.value.trim();
    if (query) {
      const parsed = parseGitHubRepo(query);
      if (parsed) {
        inspectRepo(parsed.owner, parsed.repo);
      }
    }
  });

  clearPatBtn.addEventListener('click', () => {
    setStoredPat('');
    updatePatUI();
  });

  errorActionBtn.addEventListener('click', () => {
    patModal.classList.remove('hidden');
    patInput.focus();
  });

  window.addEventListener('popstate', () => {
    handleUrlQueryParams();
  });
}

function showInputError(msg: string): void {
  inputError.textContent = msg;
  inputError.classList.remove('hidden');
}

function hideInputError(): void {
  inputError.classList.add('hidden');
  inputError.textContent = '';
}

function updateUrlQuery(owner: string, repo: string): void {
  const url = new URL(window.location.href);
  url.searchParams.set('repo', `${owner}/${repo}`);
  window.history.pushState({}, '', url.toString());
}

function handleUrlQueryParams(): void {
  const urlParams = new URLSearchParams(window.location.search);
  const repoParam = urlParams.get('repo');
  if (repoParam) {
    repoInput.value = repoParam;
    const parsed = parseGitHubRepo(repoParam);
    if (parsed) {
      inspectRepo(parsed.owner, parsed.repo);
    }
  }
}

async function inspectRepo(owner: string, repo: string): Promise<void> {
  showLoading();

  try {
    const data = await fetchRepoDetails(owner, repo);
    renderDashboard(data.repo, data.languages);
  } catch (err: any) {
    if (err instanceof GitHubApiError) {
      showError(err.message, err.isRateLimit);
    } else {
      showError('An unexpected error occurred. Please try again.', false);
    }
  }
}

function showLoading(): void {
  repoDashboard.classList.add('hidden');
  errorCard.classList.add('hidden');
  loadingSkeleton.classList.remove('hidden');
  loadingSkeleton.classList.add('flex');
}

function showError(msg: string, isRateLimit = false): void {
  loadingSkeleton.classList.add('hidden');
  loadingSkeleton.classList.remove('flex');
  repoDashboard.classList.add('hidden');

  errorTitle.textContent = isRateLimit ? 'API Rate Limit Exceeded' : 'Inspection Failed';
  errorMessage.textContent = msg;

  if (isRateLimit) {
    errorActionBtn.classList.remove('hidden');
  } else {
    errorActionBtn.classList.add('hidden');
  }

  errorCard.classList.remove('hidden');
}

function renderDashboard(repo: any, rawLanguages: Record<string, number>): void {
  loadingSkeleton.classList.add('hidden');
  loadingSkeleton.classList.remove('flex');
  errorCard.classList.add('hidden');

  ownerAvatar.src = repo.owner.avatar_url;
  ownerAvatar.alt = `${repo.owner.login} avatar`;
  ownerLink.href = repo.owner.html_url;
  ownerLink.textContent = repo.owner.login;

  repoLink.href = repo.html_url;
  repoLink.textContent = repo.name;
  githubUrlBtn.href = repo.html_url;

  repoDescription.textContent = repo.description || 'No description provided for this repository.';
  if (repo.homepage) {
    homepageLink.href = repo.homepage.startsWith('http') ? repo.homepage : `https://${repo.homepage}`;
    homepageLink.textContent = repo.homepage;
    homepageContainer.classList.remove('hidden');
    homepageContainer.classList.add('flex');
  } else {
    homepageContainer.classList.add('hidden');
    homepageContainer.classList.remove('flex');
  }

  const formattedSize = formatRepoSize(repo.size);
  heroSizeValue.textContent = formattedSize.formattedString;
  heroSizeRaw.textContent = `(${formatNumber(repo.size)} KB raw)`;

  weightBadge.textContent = `${formattedSize.weightCategory} Weight`;
  if (formattedSize.weightCategory === 'light') {
    weightBadge.className = 'px-3 py-1 rounded-full text-xs font-semibold capitalize bg-emerald-500/10 text-emerald-300 border border-emerald-500/20';
  } else if (formattedSize.weightCategory === 'medium') {
    weightBadge.className = 'px-3 py-1 rounded-full text-xs font-semibold capitalize bg-sky-500/10 text-sky-300 border border-sky-500/20';
  } else if (formattedSize.weightCategory === 'heavy') {
    weightBadge.className = 'px-3 py-1 rounded-full text-xs font-semibold capitalize bg-amber-500/10 text-amber-300 border border-amber-500/20';
  } else {
    weightBadge.className = 'px-3 py-1 rounded-full text-xs font-semibold capitalize bg-rose-500/10 text-rose-300 border border-rose-500/20';
  }

  gaugeBar.style.width = '0%';
  setTimeout(() => {
    gaugeBar.style.width = `${formattedSize.gaugePercentage}%`;
  }, 100);

  statStars.textContent = formatNumber(repo.stargazers_count);
  statForks.textContent = formatNumber(repo.forks_count);
  statWatchers.textContent = formatNumber(repo.subscribers_count ?? repo.watchers_count);
  statIssues.textContent = formatNumber(repo.open_issues_count);

  metaLicense.textContent = repo.license?.spdx_id || repo.license?.name || 'No License';
  metaBranch.textContent = repo.default_branch || 'main';
  metaPushed.textContent = formatRelativeTime(repo.pushed_at);

  renderLanguages(rawLanguages);

  repoDashboard.classList.remove('hidden');
  repoDashboard.classList.add('flex');
}

function renderLanguages(rawLanguages: Record<string, number>): void {
  const breakdown = calculateLanguageBreakdown(rawLanguages);
  languagesBar.innerHTML = '';
  languagesLegend.innerHTML = '';

  if (breakdown.length === 0) {
    languagesTotalCount.textContent = 'No language data';
    languagesBar.innerHTML = '<div class="w-full h-full bg-slate-800 rounded-full"></div>';
    languagesLegend.innerHTML = '<span class="text-slate-500 text-xs">No code language data detected for this repository.</span>';
    return;
  }

  languagesTotalCount.textContent = `${breakdown.length} ${breakdown.length === 1 ? 'language' : 'languages'}`;

  breakdown.forEach((lang) => {
    const segment = document.createElement('div');
    segment.className = 'h-full transition-all duration-500 hover:opacity-80 first:rounded-l-full last:rounded-r-full';
    segment.style.width = `${lang.percentage}%`;
    segment.style.backgroundColor = lang.color;
    segment.title = `${lang.name}: ${lang.formattedPercentage}`;
    languagesBar.appendChild(segment);

    const badge = document.createElement('div');
    badge.className = 'flex items-center gap-2 text-slate-300 font-medium';
    badge.innerHTML = `
      <span class="w-2.5 h-2.5 rounded-full flex-shrink-0" style="background-color: ${lang.color}"></span>
      <span class="truncate">${lang.name}</span>
      <span class="text-slate-500 text-[11px] font-mono ml-auto">${lang.formattedPercentage}</span>
    `;
    languagesLegend.appendChild(badge);
  });
}

init();

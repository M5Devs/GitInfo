import './style.css';
import { parseGitHubRepo } from './utils/parser';
import { formatRepoSize, formatNumber, formatRelativeTime } from './utils/formatters';
import { calculateLanguageBreakdown } from './utils/languages';
import {
  fetchRepoDetails,
  fetchRateLimit,
  checkUserStarredRepo,
  checkUserSponsoringAccount,
  GitHubApiError,
} from './api/github';
import { isVipSponsor } from './utils/sponsors';
import {
  getStoredPat,
  setStoredPat,
  getStoredOAuthToken,
  getStoredUserProfile,
  getStoredPlan,
  setStoredPlan,
  getStoredGigachadVerified,
  setStoredGigachadVerified,
  getStoredPatronVerified,
  setStoredPatronVerified,
  getActiveToken,
  getAuthType,
  signOut,
  initiateGitHubOAuth,
  handleOAuthCallback,
} from './utils/auth';
import { getPricingTiers } from './utils/pricing';
import { calculateFuelGauge } from './utils/rateLimit';
import { initRouter, navigateTo, RouteState } from './router';
import { renderCompareHTML, executeComparison } from './compare';
import { renderExploreHTML, initExploreEvents } from './explore';

// DOM Element References
const searchForm = document.getElementById('search-form') as HTMLFormElement;
const repoInput = document.getElementById('repo-input') as HTMLInputElement;
const inputError = document.getElementById('input-error') as HTMLDivElement;
const presetBtns = document.querySelectorAll('.preset-btn');
const toastContainer = document.getElementById('toast-container') as HTMLDivElement;

// PAT Modal Elements
const togglePatBtn = document.getElementById('toggle-pat-btn') as HTMLButtonElement;
const patModal = document.getElementById('pat-modal') as HTMLElement;
const closePatModalBtn = document.getElementById('close-pat-modal') as HTMLButtonElement;
const patForm = document.getElementById('pat-form') as HTMLFormElement;
const patInput = document.getElementById('pat-input') as HTMLInputElement;
const clearPatBtn = document.getElementById('clear-pat-btn') as HTMLButtonElement;
const patIndicator = document.getElementById('pat-indicator') as HTMLSpanElement;

// Pricing Modal Elements
const openPricingBtn = document.getElementById('open-pricing-btn') as HTMLButtonElement;
const pricingModal = document.getElementById('pricing-modal') as HTMLElement;
const closePricingModalBtn = document.getElementById('close-pricing-modal') as HTMLButtonElement;
const billingToggleBtn = document.getElementById('billing-toggle-btn') as HTMLButtonElement;
const billingToggleCircle = document.getElementById('billing-toggle-circle') as HTMLElement;
const billingMonthlyLabel = document.getElementById('billing-monthly-label') as HTMLElement;
const billingAnnuallyLabel = document.getElementById('billing-annually-label') as HTMLElement;
const pricingCardsContainer = document.getElementById('pricing-cards-container') as HTMLElement;
const pricingToast = document.getElementById('pricing-toast') as HTMLElement;

// Header & Rate Limit Elements
const rateLimitTrigger = document.getElementById('rate-limit-trigger') as HTMLButtonElement;
const rateLimitDropdown = document.getElementById('rate-limit-dropdown') as HTMLElement;
const userBadgeContainer = document.getElementById('user-badge-container') as HTMLElement;
const dropdownPlanBadge = document.getElementById('dropdown-plan-badge') as HTMLElement;
const dropdownGigachadStatus = document.getElementById('dropdown-gigachad-status') as HTMLElement;
const dropdownPatronStatus = document.getElementById('dropdown-patron-status') as HTMLElement;
const rateLimitCounts = document.getElementById('rate-limit-counts') as HTMLElement;
const rateLimitBar = document.getElementById('rate-limit-bar') as HTMLElement;
const rateLimitWarning = document.getElementById('rate-limit-warning') as HTMLElement;
const rateLimitReset = document.getElementById('rate-limit-reset') as HTMLElement;
const refreshRateLimitBtn = document.getElementById('refresh-rate-limit-btn') as HTMLButtonElement;
const dropdownChangeTokenBtn = document.getElementById('dropdown-change-token-btn') as HTMLButtonElement;
const dropdownSigninGithubBtn = document.getElementById('dropdown-signin-github-btn') as HTMLButtonElement;
const dropdownLogoutBtn = document.getElementById('dropdown-logout-btn') as HTMLButtonElement;

// View Containers
const inspectView = document.getElementById('inspect-view') as HTMLElement;
const compareView = document.getElementById('compare-view') as HTMLElement;
const exploreView = document.getElementById('explore-view') as HTMLElement;

// Dashboard & State Displays (Inspect View)
const loadingSkeleton = document.getElementById('loading-skeleton') as HTMLElement;
const errorCard = document.getElementById('error-card') as HTMLElement;
const errorTitle = document.getElementById('error-title') as HTMLElement;
const errorMessage = document.getElementById('error-message') as HTMLElement;
const errorActionBtn = document.getElementById('error-action-btn') as HTMLButtonElement;
const repoDashboard = document.getElementById('repo-dashboard') as HTMLElement;

// Repo Hero Card Elements
const ownerAvatar = document.getElementById('owner-avatar') as HTMLImageElement;
const ownerLink = document.getElementById('owner-link') as HTMLAnchorElement;
const repoLink = document.getElementById('repo-link') as HTMLAnchorElement;
const githubUrlBtn = document.getElementById('github-url-btn') as HTMLAnchorElement;
const shareLinkBtn = document.getElementById('share-link-btn') as HTMLButtonElement;
const repoDescription = document.getElementById('repo-description') as HTMLParagraphElement;
const homepageContainer = document.getElementById('homepage-container') as HTMLElement;
const homepageLink = document.getElementById('homepage-link') as HTMLAnchorElement;

// Hero Metrics
const heroSizeValue = document.getElementById('hero-size-value') as HTMLElement;
const heroSizeRaw = document.getElementById('hero-size-raw') as HTMLElement;
const weightBadge = document.getElementById('weight-badge') as HTMLElement;
const gaugeBar = document.getElementById('gauge-bar') as HTMLElement;

// Shallow Clone Helper Banner
const shallowCloneBanner = document.getElementById('shallow-clone-banner') as HTMLElement;
const shallowCloneCmd = document.getElementById('shallow-clone-cmd') as HTMLElement;
const copyShallowCmdBtn = document.getElementById('copy-shallow-cmd-btn') as HTMLButtonElement;

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

let currentBillingCycle: 'monthly' | 'annually' = 'monthly';

// Helper function to show elegant toast messages
export function showToast(message: string): void {
  if (!toastContainer) return;
  const toast = document.createElement('div');
  toast.className =
    'bg-slate-900/90 text-white border border-indigo-500/40 rounded-xl px-4 py-2.5 text-xs font-semibold shadow-2xl backdrop-blur-md transition-all duration-300 transform translate-y-2 opacity-0 flex items-center gap-2 pointer-events-auto';
  toast.innerHTML = `<span>${message}</span>`;
  toastContainer.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  });

  setTimeout(() => {
    toast.classList.add('translate-y-2', 'opacity-0');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}

// Initial state setup
async function init(): Promise<void> {
  setupEventListeners();

  updatePatUI();
  updateUserHeaderUI();

  try {
    const authResult = await handleOAuthCallback();
    if (authResult) {
      await runVerificationChecks();
      updateUserHeaderUI();
      refreshRateLimitData();
    }
  } catch (err) {
    console.error('Failed to exchange OAuth code:', err);
  }

  if (getActiveToken()) {
    await runVerificationChecks();
  }

  updatePatUI();
  updateUserHeaderUI();
  refreshRateLimitData();

  // Initialize Router
  initRouter(handleRouteChanged);
}

function handleRouteChanged(route: RouteState): void {
  // Hide all view containers
  inspectView.classList.add('hidden');
  inspectView.classList.remove('flex');
  compareView.classList.add('hidden');
  compareView.classList.remove('flex');
  exploreView.classList.add('hidden');
  exploreView.classList.remove('flex');

  if (route.path === '/compare') {
    compareView.classList.remove('hidden');
    compareView.classList.add('flex');

    if (!compareView.innerHTML.trim()) {
      compareView.innerHTML = renderCompareHTML();
    }
    setupCompareEvents();

    const paramA = route.queryParams.get('a');
    const paramB = route.queryParams.get('b');
    const inputA = document.getElementById('repo-a-input') as HTMLInputElement;
    const inputB = document.getElementById('repo-b-input') as HTMLInputElement;

    if (paramA) inputA.value = paramA;
    if (paramB) inputB.value = paramB;

    if (paramA || paramB) {
      executeComparison(inputA.value, inputB.value);
    }
  } else if (route.path === '/explore') {
    exploreView.classList.remove('hidden');
    exploreView.classList.add('flex');

    if (!exploreView.innerHTML.trim()) {
      exploreView.innerHTML = renderExploreHTML();
    }
    initExploreEvents(exploreView);
  } else {
    // Default Route: / (Inspect View)
    inspectView.classList.remove('hidden');
    inspectView.classList.add('flex');

    const repoParam = route.queryParams.get('repo');
    if (repoParam) {
      repoInput.value = repoParam;
      const parsed = parseGitHubRepo(repoParam);
      if (parsed) {
        inspectRepo(parsed.owner, parsed.repo);
      }
    }
  }
}

function setupCompareEvents(): void {
  const compareForm = document.getElementById('compare-form') as HTMLFormElement;
  if (compareForm && !compareForm.hasAttribute('data-bound')) {
    compareForm.setAttribute('data-bound', 'true');
    compareForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const inputA = (document.getElementById('repo-a-input') as HTMLInputElement).value.trim();
      const inputB = (document.getElementById('repo-b-input') as HTMLInputElement).value.trim();

      if (inputA && inputB) {
        navigateTo(`/compare?a=${encodeURIComponent(inputA)}&b=${encodeURIComponent(inputB)}`);
      }
    });
  }
}

async function runVerificationChecks(): Promise<{ isGigachad: boolean; isPatron: boolean }> {
  const token = getActiveToken();
  const profile = getStoredUserProfile();
  const username = profile?.login;

  if (!token) {
    setStoredGigachadVerified(false);
    setStoredPatronVerified(false);
    if (getStoredPlan() === 'gigachad' || getStoredPlan() === 'patron') {
      setStoredPlan('guest');
    }
    return { isGigachad: false, isPatron: false };
  }

  let isGigachad = getStoredGigachadVerified();
  const starResult = await checkUserStarredRepo('M5Devs', 'GitInfo', token);
  if (starResult !== null) {
    isGigachad = starResult;
    setStoredGigachadVerified(isGigachad);
  }

  let isPatron = isVipSponsor(username);
  if (!isPatron) {
    const sponsorResult = await checkUserSponsoringAccount('M5Devs', token);
    if (sponsorResult !== null) {
      isPatron = sponsorResult;
      setStoredPatronVerified(isPatron);
    } else {
      isPatron = getStoredPatronVerified();
    }
  } else {
    setStoredPatronVerified(true);
  }

  const currentPlan = getStoredPlan();
  if (currentPlan === 'gigachad' && !isGigachad) {
    setStoredPlan('pro');
  } else if (currentPlan === 'patron' && !isPatron) {
    setStoredPlan('pro');
  }

  return { isGigachad, isPatron };
}

function updatePatUI(): void {
  const currentPat = getStoredPat();
  if (currentPat) {
    patInput.value = currentPat;
    if (patIndicator) {
      patIndicator.className = 'w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400';
    }
  } else {
    patInput.value = '';
    if (patIndicator) {
      patIndicator.className = 'w-1.5 h-1.5 rounded-full bg-slate-500';
    }
  }
}

function updateUserHeaderUI(): void {
  const profile = getStoredUserProfile();
  const oauthToken = getStoredOAuthToken();
  const patToken = getStoredPat();
  const plan = getStoredPlan();

  const isGigachadVerified = getStoredGigachadVerified();
  const isPatronVerified = getStoredPatronVerified();

  userBadgeContainer.innerHTML = '';

  if (profile && oauthToken) {
    const avatar = document.createElement('img');
    avatar.src = profile.avatar_url;
    avatar.alt = profile.login;
    avatar.className = 'w-5 h-5 rounded-full border border-indigo-500/50';

    const username = document.createElement('span');
    username.className = 'font-semibold text-xs text-white max-w-[100px] truncate';
    username.textContent = profile.login;

    const badge = document.createElement('span');
    if (plan === 'patron') {
      badge.className =
        'px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-pink-500/20 text-pink-300 border border-pink-500/30 shadow-sm shadow-pink-500/30 animate-pulse';
      badge.textContent = 'Patron 💖';
    } else if (plan === 'gigachad') {
      badge.className =
        'px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm shadow-amber-500/30 animate-pulse';
      badge.textContent = 'Gigachad 🗿';
    } else {
      badge.className =
        'px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30';
      badge.textContent = 'Pro';
    }

    userBadgeContainer.appendChild(avatar);
    userBadgeContainer.appendChild(username);
    userBadgeContainer.appendChild(badge);

    dropdownLogoutBtn.classList.remove('hidden');
    dropdownLogoutBtn.classList.add('flex');
    dropdownSigninGithubBtn.parentElement?.classList.add('hidden');
  } else if (patToken) {
    const icon = document.createElement('span');
    icon.textContent = '🔑';

    const text = document.createElement('span');
    text.className = 'font-medium text-xs text-indigo-300';
    text.textContent = '5k req/hr (PAT)';

    const badge = document.createElement('span');
    if (plan === 'patron') {
      badge.className = 'px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-pink-500/20 text-pink-300 border border-pink-500/30';
      badge.textContent = 'Patron 💖';
    } else if (plan === 'gigachad') {
      badge.className = 'px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30';
      badge.textContent = 'Gigachad 🗿';
    }

    userBadgeContainer.appendChild(icon);
    userBadgeContainer.appendChild(text);
    if (plan === 'patron' || plan === 'gigachad') {
      userBadgeContainer.appendChild(badge);
    }

    dropdownLogoutBtn.classList.remove('hidden');
    dropdownLogoutBtn.classList.add('flex');
    dropdownSigninGithubBtn.parentElement?.classList.remove('hidden');
  } else {
    const icon = document.createElement('span');
    icon.textContent = '⚡';

    const text = document.createElement('span');
    text.className = 'font-medium text-xs text-slate-300';
    text.textContent = '60 req/hr (Guest)';

    const upgradeLink = document.createElement('span');
    upgradeLink.className = 'text-[10px] font-bold text-indigo-400 hover:underline ml-1';
    upgradeLink.textContent = 'Upgrade';

    userBadgeContainer.appendChild(icon);
    userBadgeContainer.appendChild(text);
    userBadgeContainer.appendChild(upgradeLink);

    dropdownLogoutBtn.classList.add('hidden');
    dropdownLogoutBtn.classList.remove('flex');
    dropdownSigninGithubBtn.parentElement?.classList.remove('hidden');
  }

  if (plan === 'patron') {
    dropdownPlanBadge.textContent = 'Patron 💖';
    dropdownPlanBadge.className = 'px-2 py-0.5 text-[10px] font-bold rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30';
  } else if (plan === 'gigachad') {
    dropdownPlanBadge.textContent = 'Gigachad 🗿';
    dropdownPlanBadge.className = 'px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30';
  } else if (oauthToken || patToken) {
    dropdownPlanBadge.textContent = 'Pro Plan (5,000/hr)';
    dropdownPlanBadge.className = 'px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30';
  } else {
    dropdownPlanBadge.textContent = 'Guest Tier (60/hr)';
    dropdownPlanBadge.className = 'px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-800 text-slate-400 border border-slate-700';
  }

  if (dropdownGigachadStatus) {
    if (isGigachadVerified) {
      dropdownGigachadStatus.textContent = '✅ Verified';
      dropdownGigachadStatus.className =
        'text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm shadow-emerald-500/20';
    } else {
      dropdownGigachadStatus.textContent = '🔒 Locked';
      dropdownGigachadStatus.className =
        'text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700';
    }
  }

  if (dropdownPatronStatus) {
    if (isPatronVerified) {
      dropdownPatronStatus.textContent = '✅ Verified';
      dropdownPatronStatus.className =
        'text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 shadow-sm shadow-pink-500/20';
    } else {
      dropdownPatronStatus.textContent = '🔒 Locked';
      dropdownPatronStatus.className =
        'text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700';
    }
  }
}

async function refreshRateLimitData(): Promise<void> {
  try {
    const status = await fetchRateLimit();
    const gauge = calculateFuelGauge(status);

    rateLimitCounts.textContent = `${formatNumber(gauge.remaining)} / ${formatNumber(gauge.limit)}`;
    rateLimitBar.className = `h-full rounded-full transition-all duration-500 ${gauge.barColorClass}`;
    rateLimitBar.style.width = `${gauge.percentageRemaining}%`;

    if (gauge.warningMsg) {
      rateLimitWarning.textContent = gauge.warningMsg;
      rateLimitWarning.classList.remove('hidden');
    } else {
      rateLimitWarning.classList.add('hidden');
    }

    rateLimitReset.textContent = gauge.resetFormatted;
  } catch (err) {
    console.error('Failed to fetch rate limit:', err);
    rateLimitCounts.textContent = 'Error loading limit';
  }
}

function renderPricingModal(): void {
  const plan = getStoredPlan();
  const isAuthenticated = getAuthType() !== 'guest';
  const verification = {
    isGigachad: getStoredGigachadVerified(),
    isPatron: getStoredPatronVerified(),
  };

  const tiers = getPricingTiers(plan, isAuthenticated, currentBillingCycle, verification);

  pricingCardsContainer.innerHTML = '';

  tiers.forEach((tier) => {
    const card = document.createElement('div');
    const isPopular = tier.popular;

    card.className = `flex flex-col justify-between p-5 rounded-2xl border transition-all duration-200 ${
      isPopular
        ? 'bg-gradient-to-b from-indigo-950/80 to-slate-900 border-indigo-500/60 shadow-xl shadow-indigo-500/10 ring-1 ring-indigo-500/40 relative'
        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 relative'
    }`;

    let statusBadgeHtml = '';
    if (tier.isVerified) {
      statusBadgeHtml = `<span class="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/30 flex items-center gap-1">✅ Verified</span>`;
    } else if (tier.isLocked && tier.id !== 'guest' && tier.id !== 'pro') {
      statusBadgeHtml = `<span class="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-slate-800/80 text-slate-400 border border-slate-700/60 flex items-center gap-1">🔒 Locked</span>`;
    }

    let topBadgeHtml = '';
    if (tier.badge) {
      topBadgeHtml = `<span class="px-2.5 py-0.5 text-[10px] font-extrabold rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 text-white shadow-md">${tier.badge}</span>`;
    }

    const headerBadgesHtml = `<div class="absolute -top-3 right-4 flex items-center gap-1.5">${topBadgeHtml}${statusBadgeHtml}</div>`;

    const perksList = tier.perks
      .map(
        (perk) => `
      <li class="flex items-start gap-2 text-xs text-slate-300">
        <svg class="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
        <span>${perk}</span>
      </li>
    `
      )
      .join('');

    let buttonClass =
      'w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center text-center ';
    if (tier.ctaAction === 'current' || tier.ctaAction === 'active') {
      buttonClass += 'bg-slate-800 text-slate-400 cursor-default border border-slate-700/60';
    } else if (tier.ctaAction === 'github_login') {
      buttonClass += 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25';
    } else if (tier.ctaAction === 'select_pro' || tier.ctaAction === 'select_gigachad' || tier.ctaAction === 'select_patron') {
      buttonClass += 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25';
    } else if (tier.ctaAction === 'star') {
      buttonClass += 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30';
    } else if (tier.ctaAction === 'sponsor') {
      buttonClass += 'bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-400 text-white shadow-lg shadow-pink-600/20';
    }

    let recheckBtnHtml = '';
    if (isAuthenticated && tier.isLocked) {
      if (tier.id === 'gigachad') {
        recheckBtnHtml = `<button type="button" class="w-full mt-2 py-1.5 px-2 rounded-lg text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/20 transition-all flex items-center justify-center gap-1" data-action="recheck_star"><span>⭐ Re-check Star Status</span></button>`;
      } else if (tier.id === 'patron') {
        recheckBtnHtml = `<button type="button" class="w-full mt-2 py-1.5 px-2 rounded-lg text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-pink-300 border border-pink-500/20 transition-all flex items-center justify-center gap-1" data-action="recheck_sponsor"><span>💖 Re-check Sponsor Status</span></button>`;
      }
    }

    card.innerHTML = `
      ${headerBadgesHtml}
      <div class="space-y-3">
        <div>
          <h3 class="text-base font-bold text-white">${tier.name}</h3>
          <div class="flex items-baseline gap-1 mt-1">
            <span class="text-2xl font-extrabold text-white">${tier.price}</span>
            <span class="text-xs text-slate-400">${tier.period}</span>
          </div>
          <p class="text-[11px] font-mono text-indigo-400 font-semibold mt-1">${tier.limitText}</p>
        </div>
        <ul class="space-y-2 pt-2 border-t border-slate-800">
          ${perksList}
        </ul>
      </div>
      <div class="pt-5 flex flex-col">
        <button type="button" class="${buttonClass}" data-action="${tier.ctaAction}">
          ${tier.ctaText}
        </button>
        ${recheckBtnHtml}
      </div>
    `;

    pricingCardsContainer.appendChild(card);
  });

  pricingCardsContainer.querySelectorAll('button[data-action]').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      const action = (e.currentTarget as HTMLElement).getAttribute('data-action');
      if (action === 'github_login') {
        pricingModal.classList.add('hidden');
        initiateGitHubOAuth();
      } else if (action === 'star') {
        window.open('https://github.com/M5Devs/GitInfo', '_blank', 'noopener,noreferrer');
        if (isAuthenticated) {
          await runVerificationChecks();
          updateUserHeaderUI();
          renderPricingModal();
        }
      } else if (action === 'sponsor') {
        window.open('https://github.com/sponsors/M5Devs', '_blank', 'noopener,noreferrer');
        if (isAuthenticated) {
          await runVerificationChecks();
          updateUserHeaderUI();
          renderPricingModal();
        }
      } else if (action === 'select_gigachad') {
        setStoredPlan('gigachad');
        updateUserHeaderUI();
        renderPricingModal();
      } else if (action === 'select_patron') {
        setStoredPlan('patron');
        updateUserHeaderUI();
        renderPricingModal();
      } else if (action === 'select_pro') {
        setStoredPlan('pro');
        updateUserHeaderUI();
        renderPricingModal();
      } else if (action === 'recheck_star' || action === 'recheck_sponsor') {
        const currentBtn = e.currentTarget as HTMLButtonElement;
        currentBtn.innerText = 'Checking...';
        currentBtn.disabled = true;
        await runVerificationChecks();
        updateUserHeaderUI();
        renderPricingModal();
      }
    });
  });
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
    navigateTo(`/?repo=${encodeURIComponent(`${parsed.owner}/${parsed.repo}`)}`);
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
          navigateTo(`/?repo=${encodeURIComponent(`${parsed.owner}/${parsed.repo}`)}`);
          inspectRepo(parsed.owner, parsed.repo);
        }
      }
    });
  });

  shareLinkBtn?.addEventListener('click', () => {
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        showToast('Link copied to clipboard! 📋');
      }).catch(() => {
        showToast('Link copied to clipboard! 📋');
      });
    } else {
      showToast('Link copied to clipboard! 📋');
    }
  });

  copyShallowCmdBtn?.addEventListener('click', () => {
    const cmdText = shallowCloneCmd.textContent || '';
    if (navigator.clipboard && cmdText) {
      navigator.clipboard.writeText(cmdText).then(() => {
        showToast('Shallow clone command copied! 📋');
      }).catch(() => {
        showToast('Shallow clone command copied! 📋');
      });
    }
  });

  togglePatBtn?.addEventListener('click', () => {
    patModal.classList.toggle('hidden');
  });

  closePatModalBtn?.addEventListener('click', () => {
    patModal.classList.add('hidden');
  });

  patForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newToken = patInput.value.trim();
    setStoredPat(newToken);
    if (newToken) {
      await runVerificationChecks();
    }
    updatePatUI();
    updateUserHeaderUI();
    refreshRateLimitData();
    patModal.classList.add('hidden');

    const query = repoInput.value.trim();
    if (query) {
      const parsed = parseGitHubRepo(query);
      if (parsed) {
        inspectRepo(parsed.owner, parsed.repo);
      }
    }
  });

  clearPatBtn?.addEventListener('click', () => {
    setStoredPat('');
    runVerificationChecks();
    updatePatUI();
    updateUserHeaderUI();
    refreshRateLimitData();
  });

  openPricingBtn.addEventListener('click', async () => {
    if (getActiveToken()) {
      await runVerificationChecks();
      updateUserHeaderUI();
    }
    renderPricingModal();
    pricingModal.classList.remove('hidden');
  });

  closePricingModalBtn.addEventListener('click', () => {
    pricingModal.classList.add('hidden');
  });

  billingToggleBtn.addEventListener('click', () => {
    if (currentBillingCycle === 'monthly') {
      currentBillingCycle = 'annually';
      billingToggleBtn.classList.replace('bg-indigo-600', 'bg-emerald-600');
      billingToggleCircle.style.transform = 'translateX(24px)';
      billingMonthlyLabel.className = 'text-xs font-medium text-slate-400';
      billingAnnuallyLabel.className = 'text-xs font-bold text-white';
      pricingToast.classList.remove('hidden');
    } else {
      currentBillingCycle = 'monthly';
      billingToggleBtn.classList.replace('bg-emerald-600', 'bg-indigo-600');
      billingToggleCircle.style.transform = 'translateX(0px)';
      billingMonthlyLabel.className = 'text-xs font-bold text-white';
      billingAnnuallyLabel.className = 'text-xs font-medium text-slate-400';
      pricingToast.classList.add('hidden');
    }
    renderPricingModal();
  });

  rateLimitTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    rateLimitDropdown.classList.toggle('hidden');
    rateLimitDropdown.classList.toggle('flex');
  });

  document.addEventListener('click', (e) => {
    if (!rateLimitDropdown.contains(e.target as Node) && !rateLimitTrigger.contains(e.target as Node)) {
      rateLimitDropdown.classList.add('hidden');
      rateLimitDropdown.classList.remove('flex');
    }
  });

  refreshRateLimitBtn.addEventListener('click', async () => {
    if (getActiveToken()) {
      await runVerificationChecks();
      updateUserHeaderUI();
    }
    refreshRateLimitData();
  });

  dropdownChangeTokenBtn.addEventListener('click', () => {
    rateLimitDropdown.classList.add('hidden');
    rateLimitDropdown.classList.remove('flex');
    patModal.classList.remove('hidden');
    patInput.focus();
  });

  dropdownSigninGithubBtn.addEventListener('click', () => {
    rateLimitDropdown.classList.add('hidden');
    rateLimitDropdown.classList.remove('flex');
    initiateGitHubOAuth();
  });

  dropdownLogoutBtn.addEventListener('click', () => {
    signOut();
    updatePatUI();
    updateUserHeaderUI();
    refreshRateLimitData();
    rateLimitDropdown.classList.add('hidden');
    rateLimitDropdown.classList.remove('flex');
  });

  errorActionBtn.addEventListener('click', () => {
    patModal.classList.remove('hidden');
    patInput.focus();
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

async function inspectRepo(owner: string, repo: string): Promise<void> {
  showLoading();

  try {
    const data = await fetchRepoDetails(owner, repo);
    renderDashboard(data.repo, data.languages);
    refreshRateLimitData();
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

  if (formattedSize.weightCategory === 'feather') {
    weightBadge.textContent = 'Feather 🪶 Weight';
    weightBadge.className =
      'px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20';
  } else if (formattedSize.weightCategory === 'light') {
    weightBadge.textContent = 'Light 🟢 Weight';
    weightBadge.className =
      'px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-200 border border-emerald-500/30';
  } else if (formattedSize.weightCategory === 'medium') {
    weightBadge.textContent = 'Medium 🟡 Weight';
    weightBadge.className =
      'px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20';
  } else if (formattedSize.weightCategory === 'heavy') {
    weightBadge.textContent = 'Heavy 🟠 Weight';
    weightBadge.className =
      'px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/15 text-orange-300 border border-orange-500/30';
  } else if (formattedSize.weightCategory === 'titan') {
    weightBadge.textContent = 'Titan 🔴 Weight';
    weightBadge.className =
      'px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30';
  } else if (formattedSize.weightCategory === 'blackHole') {
    weightBadge.textContent = 'Black Hole 🕳️💀 Weight';
    weightBadge.className =
      'px-3 py-1 rounded-full text-xs font-extrabold bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/40 animate-pulse shadow-md shadow-fuchsia-500/20';
  }

  gaugeBar.style.width = '0%';
  setTimeout(() => {
    gaugeBar.style.width = `${formattedSize.gaugePercentage}%`;
  }, 100);

  if (repo.size > 102400) {
    shallowCloneCmd.textContent = `git clone --depth 1 https://github.com/${repo.owner.login}/${repo.name}.git`;
    shallowCloneBanner.classList.remove('hidden');
    shallowCloneBanner.classList.add('flex');
  } else {
    shallowCloneBanner.classList.add('hidden');
    shallowCloneBanner.classList.remove('flex');
  }

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

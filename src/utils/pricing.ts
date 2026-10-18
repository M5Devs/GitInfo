import { PlanTier } from './auth';

export interface VerificationStatus {
  isGigachad: boolean;
  isPatron: boolean;
}

export interface PricingTierInfo {
  id: PlanTier;
  name: string;
  badge?: string;
  price: string;
  period: string;
  limitText: string;
  perks: string[];
  ctaText: string;
  ctaAction:
    | 'current'
    | 'github_login'
    | 'star'
    | 'sponsor'
    | 'active'
    | 'select_gigachad'
    | 'select_patron'
    | 'select_pro'
    | 'recheck_star'
    | 'recheck_sponsor';
  popular?: boolean;
  isVerified?: boolean;
  isLocked?: boolean;
  lockPrompt?: string;
}

export function getPricingTiers(
  currentPlan: PlanTier,
  isAuthenticated: boolean,
  billingCycle: 'monthly' | 'annually',
  verification: VerificationStatus = { isGigachad: false, isPatron: false }
): PricingTierInfo[] {
  const saveText = billingCycle === 'annually' ? ' (0% discount applied!)' : '';

  const isGigachadVerified = verification.isGigachad;
  const isPatronVerified = verification.isPatron;

  return [
    {
      id: 'guest',
      name: 'The Guest',
      price: '$0',
      period: '/mo' + saveText,
      limitText: '60 requests / hour',
      perks: [
        'No login required',
        'Instant basic repo inspect',
        'High risk of rate limits 🚨',
        'Standard developer badge',
      ],
      ctaText: !isAuthenticated && currentPlan === 'guest' ? 'Current Plan' : 'Free Guest Tier',
      ctaAction: 'current',
    },
    {
      id: 'pro',
      name: 'Pro Developer',
      badge: 'Popular 🚀',
      popular: true,
      price: '$0',
      period: '/mo' + saveText,
      limitText: '5,000 requests / hour',
      perks: [
        '1-click GitHub OAuth login',
        'Instant rate limit relief (5,000 req/hr)',
        'Active Developer Badge',
        'Seamless account fuel gauge',
      ],
      ctaText: isAuthenticated && currentPlan === 'pro'
        ? 'Active Plan ✅'
        : isAuthenticated
        ? 'Switch to Pro Tier'
        : 'Upgrade for $0 (Sign in with GitHub)',
      ctaAction: isAuthenticated ? (currentPlan === 'pro' ? 'active' : 'select_pro') : 'github_login',
    },
    {
      id: 'gigachad',
      name: 'Open Source Gigachad',
      badge: isGigachadVerified ? 'Verified 🗿' : undefined,
      price: '$0',
      period: '/mo' + saveText,
      limitText: '5,000 requests / hour',
      perks: [
        'All Pro Developer perks',
        'Eternal respect & glory 🗿',
        'Explicit permission to open PRs',
        'Linus Torvalds official blessing 🙏',
      ],
      isVerified: isGigachadVerified,
      isLocked: !isGigachadVerified,
      lockPrompt: !isGigachadVerified ? 'Star M5Devs/GitInfo on GitHub to unlock this badge!' : undefined,
      ctaText: !isAuthenticated
        ? 'Sign in with GitHub to verify star'
        : isGigachadVerified
        ? (currentPlan === 'gigachad' ? 'Gigachad Active 🗿' : 'Activate Gigachad Tier 🗿')
        : 'Star M5Devs/GitInfo on GitHub to unlock this badge!',
      ctaAction: !isAuthenticated
        ? 'github_login'
        : isGigachadVerified
        ? (currentPlan === 'gigachad' ? 'active' : 'select_gigachad')
        : 'star',
    },
    {
      id: 'patron',
      name: 'Project Patron / Sponsor',
      badge: 'Patron 💖',
      price: 'Custom',
      period: '/ Any Amount' + saveText,
      limitText: '5,000 requests / hour',
      perks: [
        'Special "Patron 💖" gold/pink badge',
        'Hall of Fame mention in README & site',
        'Keeps GitInfo 100% free for everyone',
        'Immunity to corporate acquisition 🛡️',
      ],
      isVerified: isPatronVerified,
      isLocked: !isPatronVerified,
      lockPrompt: !isPatronVerified ? 'Become an active sponsor to unlock the Patron badge!' : undefined,
      ctaText: !isAuthenticated
        ? 'Sign in to check Patron status'
        : isPatronVerified
        ? (currentPlan === 'patron' ? 'Patron Active 💖' : 'Activate Patron Tier 💖')
        : 'Become an active sponsor to unlock the Patron badge!',
      ctaAction: !isAuthenticated
        ? 'github_login'
        : isPatronVerified
        ? (currentPlan === 'patron' ? 'active' : 'select_patron')
        : 'sponsor',
    },
  ];
}

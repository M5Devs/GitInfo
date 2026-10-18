import { PlanTier } from './auth';

export interface PricingTierInfo {
  id: PlanTier | 'gigachad';
  name: string;
  badge?: string;
  price: string;
  period: string;
  limitText: string;
  perks: string[];
  ctaText: string;
  ctaAction: 'current' | 'github_login' | 'star' | 'sponsor' | 'active';
  popular?: boolean;
}

export function getPricingTiers(currentPlan: PlanTier, isAuthenticated: boolean, billingCycle: 'monthly' | 'annually'): PricingTierInfo[] {
  const saveText = billingCycle === 'annually' ? ' (0% discount applied!)' : '';

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
      ctaText: !isAuthenticated ? 'Current Plan' : 'Free Guest Tier',
      ctaAction: !isAuthenticated ? 'current' : 'current',
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
        ? 'Included with Auth ✅'
        : 'Upgrade for $0 (Sign in with GitHub)',
      ctaAction: isAuthenticated ? 'active' : 'github_login',
    },
    {
      id: 'gigachad',
      name: 'Open Source Gigachad',
      price: '$0',
      period: '/mo' + saveText,
      limitText: '5,000 requests / hour',
      perks: [
        'All Pro Developer perks',
        'Eternal respect & glory 🗿',
        'Explicit permission to open PRs',
        'Linus Torvalds official blessing 🙏',
      ],
      ctaText: 'Subscribe with a Star ⭐',
      ctaAction: 'star',
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
      ctaText: currentPlan === 'patron' ? 'Patron Active 💖' : 'Sponsor on GitHub 💖',
      ctaAction: 'sponsor',
    },
  ];
}

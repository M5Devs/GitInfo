import { describe, it, expect } from 'vitest';
import { calculateFuelGauge, formatResetCountdown } from '../src/utils/rateLimit';
import { getPricingTiers } from '../src/utils/pricing';

describe('Rate Limit Fuel Gauge Calculator', () => {
  it('calculates green gauge for > 50% remaining requests', () => {
    const status = {
      limit: 5000,
      remaining: 4500,
      resetUnix: Math.floor(Date.now() / 1000) + 1800,
      used: 500,
    };

    const gauge = calculateFuelGauge(status);
    expect(gauge.percentageRemaining).toBe(90);
    expect(gauge.colorCategory).toBe('green');
    expect(gauge.barColorClass).toBe('bg-emerald-400');
    expect(gauge.warningMsg).toBeNull();
  });

  it('calculates yellow gauge for 10% - 50% remaining requests', () => {
    const status = {
      limit: 5000,
      remaining: 1500,
      resetUnix: Math.floor(Date.now() / 1000) + 600,
      used: 3500,
    };

    const gauge = calculateFuelGauge(status);
    expect(gauge.percentageRemaining).toBe(30);
    expect(gauge.colorCategory).toBe('yellow');
    expect(gauge.barColorClass).toBe('bg-amber-400');
    expect(gauge.warningMsg).toBeNull();
  });

  it('calculates pulsating red gauge and warning message for < 10% remaining', () => {
    const status = {
      limit: 60,
      remaining: 5,
      resetUnix: Math.floor(Date.now() / 1000) + 300,
      used: 55,
    };

    const gauge = calculateFuelGauge(status);
    expect(gauge.percentageRemaining).toBe(8);
    expect(gauge.colorCategory).toBe('red');
    expect(gauge.barColorClass).toContain('bg-rose-500');
    expect(gauge.warningMsg).toContain('Slow down, speedster!');
  });

  it('formats reset countdown timer correctly', () => {
    expect(formatResetCountdown(0)).toBe('Resets now');
    expect(formatResetCountdown(-10)).toBe('Resets now');
    expect(formatResetCountdown(45)).toBe('Resets in 45s');
    expect(formatResetCountdown(840)).toBe('Resets in 14 minutes');
    expect(formatResetCountdown(3700)).toBe('Resets in 1h 1m');
  });
});

describe('Pricing Tiers Logic', () => {
  it('generates 4 satirical pricing tiers with correct CTAs for guests', () => {
    const tiers = getPricingTiers('guest', false, 'monthly');
    expect(tiers).toHaveLength(4);
    expect(tiers[0].name).toBe('The Guest');
    expect(tiers[0].ctaText).toBe('Current Plan');

    expect(tiers[1].name).toBe('Pro Developer');
    expect(tiers[1].ctaText).toContain('Sign in with GitHub');

    expect(tiers[2].name).toBe('Open Source Gigachad');
    expect(tiers[2].ctaText).toContain('Subscribe with a Star');

    expect(tiers[3].name).toBe('Project Patron / Sponsor');
    expect(tiers[3].ctaText).toContain('Sponsor on GitHub');
  });

  it('shows active plan CTA for authenticated Pro users', () => {
    const tiers = getPricingTiers('pro', true, 'monthly');
    expect(tiers[1].ctaText).toBe('Active Plan ✅');
  });
});

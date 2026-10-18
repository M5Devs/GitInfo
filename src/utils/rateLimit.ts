import { RateLimitStatus } from '../api/github';

export interface FuelGaugeInfo {
  limit: number;
  remaining: number;
  used: number;
  percentageRemaining: number;
  colorCategory: 'green' | 'yellow' | 'red';
  colorClass: string;
  barColorClass: string;
  resetFormatted: string;
  warningMsg: string | null;
}

export function calculateFuelGauge(status: RateLimitStatus): FuelGaugeInfo {
  const { limit, remaining, resetUnix, used } = status;

  const pct = limit > 0 ? Math.max(0, Math.min(100, (remaining / limit) * 100)) : 0;

  let colorCategory: 'green' | 'yellow' | 'red';
  let colorClass: string;
  let barColorClass: string;
  let warningMsg: string | null = null;

  if (pct > 50) {
    colorCategory = 'green';
    colorClass = 'text-emerald-400';
    barColorClass = 'bg-emerald-400';
  } else if (pct >= 10) {
    colorCategory = 'yellow';
    colorClass = 'text-amber-400';
    barColorClass = 'bg-amber-400';
  } else {
    colorCategory = 'red';
    colorClass = 'text-rose-400';
    barColorClass = 'bg-rose-500 animate-pulse';
    warningMsg = 'Slow down, speedster! Rate limit approaching 🚒';
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  const secondsUntilReset = Math.max(0, resetUnix - nowSeconds);
  const resetFormatted = formatResetCountdown(secondsUntilReset);

  return {
    limit,
    remaining,
    used,
    percentageRemaining: Math.round(pct),
    colorCategory,
    colorClass,
    barColorClass,
    resetFormatted,
    warningMsg,
  };
}

export function formatResetCountdown(seconds: number): string {
  if (seconds <= 0) return 'Resets now';

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes > 60) {
    const hours = Math.floor(minutes / 60);
    const remMins = minutes % 60;
    return `Resets in ${hours}h ${remMins}m`;
  }

  if (minutes > 0) {
    return `Resets in ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
  }

  return `Resets in ${remainingSeconds}s`;
}

import { describe, it, expect } from 'vitest';
import { parseGitHubRepo } from '../src/utils/parser';
import { formatRepoSize, formatNumber, formatRelativeTime } from '../src/utils/formatters';
import { calculateLanguageBreakdown } from '../src/utils/languages';

describe('GitHub Repo Parser', () => {
  it('parses valid owner/repo formats', () => {
    expect(parseGitHubRepo('M5Devs/GitInfo')).toEqual({ owner: 'M5Devs', repo: 'GitInfo' });
    expect(parseGitHubRepo('facebook/react')).toEqual({ owner: 'facebook', repo: 'react' });
    expect(parseGitHubRepo('https://github.com/vercel/next.js')).toEqual({ owner: 'vercel', repo: 'next.js' });
    expect(parseGitHubRepo('http://github.com/tailwindlabs/tailwindcss.git')).toEqual({ owner: 'tailwindlabs', repo: 'tailwindcss' });
    expect(parseGitHubRepo('github.com/vitejs/vite/tree/main')).toEqual({ owner: 'vitejs', repo: 'vite' });
  });

  it('handles invalid inputs gracefully', () => {
    expect(parseGitHubRepo('')).toBeNull();
    expect(parseGitHubRepo('invalid')).toBeNull();
    expect(parseGitHubRepo('https://otherdomain.com/owner/repo')).toBeNull();
    expect(parseGitHubRepo('$$invalid$$/repo')).toBeNull();
  });
});

describe('Formatters', () => {
  describe('formatRepoSize', () => {
    it('formats sizes under 1024 KB as KB', () => {
      const result = formatRepoSize(450);
      expect(result.value).toBe(450);
      expect(result.unit).toBe('KB');
      expect(result.formattedString).toBe('450 KB');
      expect(result.weightCategory).toBe('light');
    });

    it('formats sizes between 1024 KB and 1048576 KB as MB with 2 decimal places', () => {
      const result = formatRepoSize(25088);
      expect(result.unit).toBe('MB');
      expect(result.formattedString).toBe('24.50 MB');
      expect(result.weightCategory).toBe('medium');
    });

    it('formats sizes over 1048576 KB as GB with 2 decimal places', () => {
      const result = formatRepoSize(1939865);
      expect(result.unit).toBe('GB');
      expect(result.formattedString).toBe('1.85 GB');
      expect(result.weightCategory).toBe('massive');
    });

    it('handles zero or negative sizes safely', () => {
      expect(formatRepoSize(0).formattedString).toBe('0 KB');
      expect(formatRepoSize(-10).formattedString).toBe('0 KB');
    });
  });

  describe('formatNumber', () => {
    it('formats numbers with commas', () => {
      expect(formatNumber(1234567)).toBe('1,234,567');
      expect(formatNumber(0)).toBe('0');
    });
  });

  describe('formatRelativeTime', () => {
    it('formats ISO dates relatively', () => {
      const now = new Date();
      const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString();
      expect(formatRelativeTime(threeDaysAgo)).toBe('3 days ago');
    });
  });
});

describe('Language Breakdown Calculator', () => {
  it('calculates accurate percentages and colors', () => {
    const rawLanguages = {
      TypeScript: 7000,
      JavaScript: 2000,
      CSS: 1000,
    };

    const breakdown = calculateLanguageBreakdown(rawLanguages);
    expect(breakdown).toHaveLength(3);
    expect(breakdown[0].name).toBe('TypeScript');
    expect(breakdown[0].formattedPercentage).toBe('70.0%');
    expect(breakdown[0].color).toBe('#3178c6');

    expect(breakdown[1].name).toBe('JavaScript');
    expect(breakdown[1].formattedPercentage).toBe('20.0%');

    expect(breakdown[2].name).toBe('CSS');
    expect(breakdown[2].formattedPercentage).toBe('10.0%');
  });

  it('handles empty input gracefully', () => {
    expect(calculateLanguageBreakdown({})).toEqual([]);
  });
});

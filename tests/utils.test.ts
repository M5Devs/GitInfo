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

describe('Formatters & 6-Tier Weight Classification', () => {
  describe('formatRepoSize', () => {
    it('classifies sizes < 1 MB as Feather 🪶', () => {
      const result = formatRepoSize(450);
      expect(result.value).toBe(450);
      expect(result.unit).toBe('KB');
      expect(result.formattedString).toBe('450 KB');
      expect(result.weightCategory).toBe('feather');
    });

    it('classifies sizes 1 MB - 20 MB as Light 🟢', () => {
      const result = formatRepoSize(15360); // 15 MB
      expect(result.unit).toBe('MB');
      expect(result.formattedString).toBe('15.00 MB');
      expect(result.weightCategory).toBe('light');
    });

    it('classifies sizes 20 MB - 100 MB as Medium 🟡', () => {
      const result = formatRepoSize(51200); // 50 MB
      expect(result.unit).toBe('MB');
      expect(result.formattedString).toBe('50.00 MB');
      expect(result.weightCategory).toBe('medium');
    });

    it('classifies sizes 100 MB - 1 GB as Heavy 🟠', () => {
      const result = formatRepoSize(524288); // 512 MB
      expect(result.unit).toBe('MB');
      expect(result.formattedString).toBe('512.00 MB');
      expect(result.weightCategory).toBe('heavy');
    });

    it('classifies sizes 1 GB - 10 GB as Titan 🔴', () => {
      const result = formatRepoSize(3145728); // 3 GB
      expect(result.unit).toBe('GB');
      expect(result.formattedString).toBe('3.00 GB');
      expect(result.weightCategory).toBe('titan');
    });

    it('classifies sizes > 10 GB as Black Hole 🕳️💀 (e.g., Chromium 64 GB)', () => {
      const result = formatRepoSize(67108864); // 64 GB
      expect(result.unit).toBe('GB');
      expect(result.formattedString).toBe('64.00 GB');
      expect(result.weightCategory).toBe('blackHole');
      expect(result.gaugePercentage).toBe(100);
    });

    it('handles zero or negative sizes safely', () => {
      expect(formatRepoSize(0).formattedString).toBe('0 KB');
      expect(formatRepoSize(0).weightCategory).toBe('feather');
      expect(formatRepoSize(-10).formattedString).toBe('0 KB');
      expect(formatRepoSize(-10).weightCategory).toBe('feather');
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

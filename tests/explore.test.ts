import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  FALLBACK_RANKINGS,
  SUPPORTED_LANGUAGES,
  filterRankings,
  sortRankings,
  renderExploreHTML,
  initExploreEvents,
  fetchRankingsData,
} from '../src/explore';

describe('Explore Page - Rankings Engine Logic', () => {
  it('contains valid FALLBACK_RANKINGS with all required properties', () => {
    expect(FALLBACK_RANKINGS.length).toBeGreaterThan(5);
    FALLBACK_RANKINGS.forEach((repo) => {
      expect(repo).toHaveProperty('id');
      expect(repo).toHaveProperty('name');
      expect(repo).toHaveProperty('full_name');
      expect(repo.owner).toHaveProperty('login');
      expect(repo.owner).toHaveProperty('avatar_url');
      expect(repo).toHaveProperty('stargazers_count');
      expect(repo).toHaveProperty('forks_count');
      expect(repo).toHaveProperty('language');
      expect(repo).toHaveProperty('size');
      expect(repo).toHaveProperty('sizeFormatted');
      expect(repo).toHaveProperty('weightCategory');
      expect(repo).toHaveProperty('weightLabel');
    });
  });

  describe('filterRankings', () => {
    it('returns all repos when language is "All" or empty', () => {
      expect(filterRankings(FALLBACK_RANKINGS, 'All')).toHaveLength(FALLBACK_RANKINGS.length);
      expect(filterRankings(FALLBACK_RANKINGS, '')).toHaveLength(FALLBACK_RANKINGS.length);
    });

    it('filters repos by specific languages correctly', () => {
      const tsRepos = filterRankings(FALLBACK_RANKINGS, 'TypeScript');
      expect(tsRepos.length).toBeGreaterThan(0);
      tsRepos.forEach((repo) => {
        expect(repo.language.toLowerCase()).toBe('typescript');
      });

      const rustRepos = filterRankings(FALLBACK_RANKINGS, 'Rust');
      expect(rustRepos.length).toBeGreaterThan(0);
      rustRepos.forEach((repo) => {
        expect(repo.language.toLowerCase()).toBe('rust');
      });

      const cppRepos = filterRankings(FALLBACK_RANKINGS, 'C++');
      expect(cppRepos.length).toBeGreaterThan(0);
      cppRepos.forEach((repo) => {
        expect(repo.language.toLowerCase()).toBe('c++');
      });
    });

    it('handles case insensitivity when filtering', () => {
      const pyReposLower = filterRankings(FALLBACK_RANKINGS, 'python');
      const pyReposMixed = filterRankings(FALLBACK_RANKINGS, 'PyThOn');
      expect(pyReposLower.length).toBe(pyReposMixed.length);
      expect(pyReposLower.length).toBeGreaterThan(0);
    });
  });

  describe('sortRankings', () => {
    it('sorts repositories descending by stars', () => {
      const sorted = sortRankings(FALLBACK_RANKINGS, 'stars');
      for (let i = 0; i < sorted.length - 1; i++) {
        expect(sorted[i].stargazers_count).toBeGreaterThanOrEqual(sorted[i + 1].stargazers_count);
      }
    });

    it('sorts repositories descending by forks', () => {
      const sorted = sortRankings(FALLBACK_RANKINGS, 'forks');
      for (let i = 0; i < sorted.length - 1; i++) {
        expect(sorted[i].forks_count).toBeGreaterThanOrEqual(sorted[i + 1].forks_count);
      }
    });

    it('sorts repositories descending by size (heaviest to lightest)', () => {
      const sorted = sortRankings(FALLBACK_RANKINGS, 'size');
      for (let i = 0; i < sorted.length - 1; i++) {
        expect(sorted[i].size).toBeGreaterThanOrEqual(sorted[i + 1].size);
      }
      expect(sorted[0].full_name).toBe('chromium/chromium');
    });
  });

  describe('fetchRankingsData', () => {
    it('falls back to FALLBACK_RANKINGS when fetch fails', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));
      const data = await fetchRankingsData();
      expect(data).toEqual(FALLBACK_RANKINGS);
      vi.unstubAllGlobals();
    });

    it('returns parsed rankings from rankings.json when fetch succeeds', async () => {
      const mockData = {
        lastUpdated: '2025-01-01T00:00:00.000Z',
        repos: [
          {
            id: 99,
            name: 'test-repo',
            full_name: 'test/test-repo',
            owner: { login: 'test', avatar_url: 'https://example.com/avatar.png', html_url: 'https://github.com/test' },
            html_url: 'https://github.com/test/test-repo',
            description: 'A test repo',
            stargazers_count: 5000,
            forks_count: 500,
            language: 'TypeScript',
            size: 1024,
            sizeFormatted: '1.00 MB',
            weightCategory: 'light',
            weightLabel: 'Light 🟢',
          },
        ],
      };

      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: async () => mockData,
        })
      );

      const data = await fetchRankingsData();
      expect(data).toHaveLength(1);
      expect(data[0].full_name).toBe('test/test-repo');
      vi.unstubAllGlobals();
    });
  });
});

describe('Explore Page - UI & DOM Rendering', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.innerHTML = renderExploreHTML();
  });

  it('renders language filter pills for all supported languages', () => {
    SUPPORTED_LANGUAGES.forEach((lang) => {
      const pill = container.querySelector(`[data-lang="${lang}"]`);
      expect(pill).not.toBeNull();
    });
  });

  it('renders sort control buttons for stars, forks, and size', () => {
    expect(container.querySelector('[data-sort="stars"]')).not.toBeNull();
    expect(container.querySelector('[data-sort="forks"]')).not.toBeNull();
    expect(container.querySelector('[data-sort="size"]')).not.toBeNull();
  });

  it('initializes explore events and renders ranking cards', async () => {
    initExploreEvents(container);

    const cards = container.querySelectorAll('.ranking-card');
    expect(cards.length).toBeGreaterThan(0);

    // Test language pill click
    const rustPill = container.querySelector('[data-lang="Rust"]') as HTMLButtonElement;
    expect(rustPill).not.toBeNull();
    rustPill.click();

    const filteredCards = container.querySelectorAll('.ranking-card');
    expect(filteredCards.length).toBeGreaterThan(0);
    expect(container.textContent).toContain('Rust');

    // Reset back to All
    const allPill = container.querySelector('[data-lang="All"]') as HTMLButtonElement;
    expect(allPill).not.toBeNull();
    allPill.click();

    // Test size sort
    const sizeSortBtn = container.querySelector('[data-sort="size"]') as HTMLButtonElement;
    expect(sizeSortBtn).not.toBeNull();
    sizeSortBtn.click();

    expect(container.textContent).toContain('chromium/chromium');
  });
});

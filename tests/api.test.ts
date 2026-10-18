import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  fetchRepoDetails,
  checkUserStarredRepo,
  checkUserSponsoringAccount,
  GitHubApiError,
  setStoredPat,
  getStoredPat,
  PAT_STORAGE_KEY,
} from '../src/api/github';

describe('GitHub API Module', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('manages PAT in localStorage', () => {
    setStoredPat('ghp_test123');
    expect(getStoredPat()).toBe('ghp_test123');
    expect(localStorage.getItem(PAT_STORAGE_KEY)).toBe('ghp_test123');

    setStoredPat('');
    expect(getStoredPat()).toBeNull();
  });

  it('fetches repo and languages successfully', async () => {
    const mockRepoData = {
      id: 1,
      name: 'react',
      full_name: 'facebook/react',
      owner: { login: 'facebook', avatar_url: '', html_url: '' },
      html_url: 'https://github.com/facebook/react',
      description: 'The library for web and native user interfaces.',
      homepage: 'https://react.dev',
      size: 180000,
      stargazers_count: 220000,
      watchers_count: 220000,
      forks_count: 45000,
      open_issues_count: 1200,
      language: 'JavaScript',
      license: { key: 'mit', name: 'MIT License', spdx_id: 'MIT' },
      default_branch: 'main',
      pushed_at: '2025-02-15T10:00:00Z',
      created_at: '2013-05-24T16:15:54Z',
      updated_at: '2025-02-15T10:00:00Z',
    };

    const mockLanguages = { JavaScript: 800000, HTML: 20000 };

    (fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockRepoData,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockLanguages,
      });

    const result = await fetchRepoDetails('facebook', 'react');

    expect(result.repo.name).toBe('react');
    expect(result.repo.size).toBe(180000);
    expect(result.languages).toEqual(mockLanguages);
  });

  it('throws GitHubApiError with 404 status when repo is not found', async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      headers: new Headers(),
    });

    await expect(fetchRepoDetails('nonexistent', 'repo')).rejects.toThrow(GitHubApiError);
  });

  it('throws rate limit error when status is 403 and rate limit is reached', async () => {
    const headers = new Headers();
    headers.set('x-ratelimit-remaining', '0');

    (fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 403,
      statusText: 'Forbidden',
      headers,
    });

    try {
      await fetchRepoDetails('facebook', 'react');
    } catch (err: any) {
      expect(err).toBeInstanceOf(GitHubApiError);
      expect(err.status).toBe(403);
      expect(err.isRateLimit).toBe(true);
    }
  });

  describe('checkUserStarredRepo', () => {
    it('returns true when user has starred repo (HTTP 204)', async () => {
      (fetch as any).mockResolvedValueOnce({
        status: 204,
      });

      const isStarred = await checkUserStarredRepo('M5Devs', 'GitInfo', 'test_token');
      expect(isStarred).toBe(true);
      expect(fetch).toHaveBeenCalledWith(
        'https://api.github.com/user/starred/M5Devs/GitInfo',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test_token',
          }),
        })
      );
    });

    it('returns false when user has not starred repo (HTTP 404)', async () => {
      (fetch as any).mockResolvedValueOnce({
        status: 404,
      });

      const isStarred = await checkUserStarredRepo('M5Devs', 'GitInfo', 'test_token');
      expect(isStarred).toBe(false);
    });

    it('returns false when no token is provided', async () => {
      const isStarred = await checkUserStarredRepo('M5Devs', 'GitInfo');
      expect(isStarred).toBe(false);
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe('checkUserSponsoringAccount', () => {
    it('returns true when user is sponsoring account via GraphQL', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            viewer: {
              isSponsoring: true,
            },
          },
        }),
      });

      const isSponsoring = await checkUserSponsoringAccount('M5Devs', 'test_token');
      expect(isSponsoring).toBe(true);
      expect(fetch).toHaveBeenCalledWith(
        'https://api.github.com/graphql',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer test_token',
          }),
        })
      );
    });

    it('returns false when user is not sponsoring account via GraphQL', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            viewer: {
              isSponsoring: false,
            },
          },
        }),
      });

      const isSponsoring = await checkUserSponsoringAccount('M5Devs', 'test_token');
      expect(isSponsoring).toBe(false);
    });

    it('returns false when API call fails or errors occur', async () => {
      (fetch as any).mockRejectedValueOnce(new Error('Network failure'));

      const isSponsoring = await checkUserSponsoringAccount('M5Devs', 'test_token');
      expect(isSponsoring).toBe(false);
    });
  });
});

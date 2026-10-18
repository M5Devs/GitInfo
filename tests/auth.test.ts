import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  setStoredOAuthToken,
  getStoredOAuthToken,
  setStoredPat,
  getStoredPat,
  getActiveToken,
  getAuthType,
  setStoredUserProfile,
  getStoredUserProfile,
  setStoredPlan,
  getStoredPlan,
  getStoredGigachadVerified,
  setStoredGigachadVerified,
  getStoredPatronVerified,
  setStoredPatronVerified,
  signOut,
  handleOAuthCallback,
  fetchGitHubUserProfile,
} from '../src/utils/auth';

describe('Auth Utility Module', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('handles OAuth token storage correctly', () => {
    expect(getStoredOAuthToken()).toBeNull();
    setStoredOAuthToken('gho_testoauth123');
    expect(getStoredOAuthToken()).toBe('gho_testoauth123');

    setStoredOAuthToken('');
    expect(getStoredOAuthToken()).toBeNull();
  });

  it('determines active token and auth type priority', () => {
    expect(getAuthType()).toBe('guest');
    expect(getActiveToken()).toBeNull();

    setStoredPat('ghp_testpat');
    expect(getAuthType()).toBe('pat');
    expect(getActiveToken()).toBe('ghp_testpat');

    // OAuth token takes precedence over PAT
    setStoredOAuthToken('gho_testoauth');
    expect(getAuthType()).toBe('oauth');
    expect(getActiveToken()).toBe('gho_testoauth');
  });

  it('manages user profile JSON in localStorage', () => {
    const profile = {
      login: 'octocat',
      avatar_url: 'https://github.com/images/error/octocat_happy.gif',
      html_url: 'https://github.com/octocat',
      name: 'monalisa octocat',
      bio: 'There once was a github octocat...',
      public_repos: 8,
    };

    setStoredUserProfile(profile);
    expect(getStoredUserProfile()).toEqual(profile);

    setStoredUserProfile(null);
    expect(getStoredUserProfile()).toBeNull();
  });

  it('handles user plan tier setting and fallbacks', () => {
    expect(getStoredPlan()).toBe('guest');

    setStoredPlan('pro');
    expect(getStoredPlan()).toBe('pro');

    setStoredPlan('gigachad');
    expect(getStoredPlan()).toBe('gigachad');

    setStoredPlan('patron');
    expect(getStoredPlan()).toBe('patron');
  });

  it('manages gigachad and patron verification storage', () => {
    expect(getStoredGigachadVerified()).toBe(false);
    expect(getStoredPatronVerified()).toBe(false);

    setStoredGigachadVerified(true);
    expect(getStoredGigachadVerified()).toBe(true);

    setStoredPatronVerified(true);
    expect(getStoredPatronVerified()).toBe(true);
  });

  it('clears all credentials and verifications on signOut', () => {
    setStoredOAuthToken('gho_test');
    setStoredPat('ghp_test');
    setStoredUserProfile({
      login: 'user',
      avatar_url: '',
      html_url: '',
      name: null,
      bio: null,
      public_repos: 0,
    });
    setStoredPlan('patron');
    setStoredGigachadVerified(true);
    setStoredPatronVerified(true);

    signOut();

    expect(getStoredOAuthToken()).toBeNull();
    expect(getStoredPat()).toBeNull();
    expect(getStoredUserProfile()).toBeNull();
    expect(getStoredPlan()).toBe('guest');
    expect(getStoredGigachadVerified()).toBe(false);
    expect(getStoredPatronVerified()).toBe(false);
  });

  it('cleans OAuth code parameter from URL using replaceState', async () => {
    const replaceStateSpy = vi.spyOn(window.history, 'replaceState');

    // Simulate returning with ?code=12345
    delete (window as any).location;
    (window as any).location = new URL('http://localhost/?code=12345&state=test');

    (fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: 'gho_newtoken' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          login: 'testuser',
          avatar_url: '',
          html_url: '',
          name: 'Test',
          bio: '',
          public_repos: 5,
        }),
      });

    const result = await handleOAuthCallback();

    expect(replaceStateSpy).toHaveBeenCalledWith({}, expect.any(String), '/');
    expect(result?.token).toBe('gho_newtoken');
    expect(getStoredOAuthToken()).toBe('gho_newtoken');
  });

  it('invokes signOut on 401 response in fetchGitHubUserProfile', async () => {
    setStoredOAuthToken('gho_invalid');

    (fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 401,
    });

    await expect(fetchGitHubUserProfile('gho_invalid')).rejects.toThrow();
    expect(getStoredOAuthToken()).toBeNull();
  });
});

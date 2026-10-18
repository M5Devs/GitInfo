export interface UserProfile {
  login: string;
  avatar_url: string;
  html_url: string;
  name: string | null;
  bio: string | null;
  public_repos: number;
}

export type PlanTier = 'guest' | 'pro' | 'gigachad' | 'patron';

export const OAUTH_TOKEN_KEY = 'gitinfo_github_oauth_token';
export const PAT_STORAGE_KEY = 'gitinfo_github_pat';
export const USER_PROFILE_KEY = 'gitinfo_user_profile';
export const USER_PLAN_KEY = 'gitinfo_user_plan';
export const GIGACHAD_VERIFIED_KEY = 'gitinfo_gigachad_verified';
export const PATRON_VERIFIED_KEY = 'gitinfo_patron_verified';

// Default Client ID for GitHub OAuth app if not set in Vite env
export const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID || 'Ov23liGitInfoDefault';

export function getStoredOAuthToken(): string | null {
  try {
    return localStorage.getItem(OAUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredOAuthToken(token: string | null): void {
  try {
    if (token && token.trim()) {
      localStorage.setItem(OAUTH_TOKEN_KEY, token.trim());
    } else {
      localStorage.removeItem(OAUTH_TOKEN_KEY);
    }
  } catch {
    // Ignore storage errors
  }
}

export function getStoredPat(): string | null {
  try {
    return localStorage.getItem(PAT_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredPat(pat: string | null): void {
  try {
    if (pat && pat.trim()) {
      localStorage.setItem(PAT_STORAGE_KEY, pat.trim());
    } else {
      localStorage.removeItem(PAT_STORAGE_KEY);
    }
  } catch {
    // Ignore storage errors
  }
}

export function getActiveToken(): string | null {
  return getStoredOAuthToken() || getStoredPat();
}

export function getAuthType(): 'oauth' | 'pat' | 'guest' {
  if (getStoredOAuthToken()) return 'oauth';
  if (getStoredPat()) return 'pat';
  return 'guest';
}

export function getStoredUserProfile(): UserProfile | null {
  try {
    const data = localStorage.getItem(USER_PROFILE_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function setStoredUserProfile(profile: UserProfile | null): void {
  try {
    if (profile) {
      localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
    } else {
      localStorage.removeItem(USER_PROFILE_KEY);
    }
  } catch {
    // Ignore storage errors
  }
}

export function getStoredGigachadVerified(): boolean {
  try {
    return localStorage.getItem(GIGACHAD_VERIFIED_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setStoredGigachadVerified(verified: boolean): void {
  try {
    localStorage.setItem(GIGACHAD_VERIFIED_KEY, String(verified));
  } catch {
    // Ignore storage errors
  }
}

export function getStoredPatronVerified(): boolean {
  try {
    return localStorage.getItem(PATRON_VERIFIED_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setStoredPatronVerified(verified: boolean): void {
  try {
    localStorage.setItem(PATRON_VERIFIED_KEY, String(verified));
  } catch {
    // Ignore storage errors
  }
}

export function getStoredPlan(): PlanTier {
  try {
    const plan = localStorage.getItem(USER_PLAN_KEY) as PlanTier;
    if (plan && ['guest', 'pro', 'gigachad', 'patron'].includes(plan)) {
      return plan;
    }
  } catch {
    // Fallthrough
  }
  return getActiveToken() ? 'pro' : 'guest';
}

export function setStoredPlan(plan: PlanTier): void {
  try {
    localStorage.setItem(USER_PLAN_KEY, plan);
  } catch {
    // Ignore storage errors
  }
}

export function signOut(): void {
  setStoredOAuthToken(null);
  setStoredPat(null);
  setStoredUserProfile(null);
  setStoredPlan('guest');
  setStoredGigachadVerified(false);
  setStoredPatronVerified(false);
}

export async function fetchGitHubUserProfile(token: string): Promise<UserProfile> {
  const res = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (!res.ok) {
    if (res.status === 401) {
      signOut();
    }
    throw new Error(`Failed to fetch GitHub profile (${res.status})`);
  }

  const data = await res.json();
  return {
    login: data.login,
    avatar_url: data.avatar_url,
    html_url: data.html_url,
    name: data.name || null,
    bio: data.bio || null,
    public_repos: data.public_repos || 0,
  };
}

export async function exchangeOAuthCode(code: string): Promise<string> {
  const endpoint = '/api/auth/github';
  const res = await fetch(`${endpoint}?code=${encodeURIComponent(code)}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    let errorMsg = 'OAuth exchange failed';
    try {
      const errData = await res.json();
      errorMsg = errData.error_description || errData.error || errorMsg;
    } catch {
      // JSON parse failed
    }
    throw new Error(errorMsg);
  }

  const data = await res.json();
  if (!data.access_token) {
    throw new Error('No access_token returned from OAuth endpoint');
  }

  return data.access_token;
}

export function initiateGitHubOAuth(clientId = GITHUB_CLIENT_ID): void {
  const redirectUri = window.location.origin + window.location.pathname;
  const scope = 'read:user';
  const authUrl = `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(
    clientId
  )}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`;

  window.location.href = authUrl;
}

export async function handleOAuthCallback(): Promise<{ token: string; profile: UserProfile } | null> {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');

  if (!code) {
    return null;
  }

  // Clean code from URL immediately without refreshing or re-submitting code on page refresh
  const url = new URL(window.location.href);
  url.searchParams.delete('code');
  url.searchParams.delete('state');
  const cleanSearch = url.searchParams.toString();
  const cleanPath = window.location.pathname + (cleanSearch ? `?${cleanSearch}` : '');
  window.history.replaceState({}, document.title, cleanPath);

  try {
    const token = await exchangeOAuthCode(code);
    setStoredOAuthToken(token);

    const profile = await fetchGitHubUserProfile(token);
    setStoredUserProfile(profile);

    // Default plan for signed in OAuth user is 'pro' unless already patron or gigachad
    if (getStoredPlan() === 'guest') {
      setStoredPlan('pro');
    }

    return { token, profile };
  } catch (err) {
    console.error('OAuth callback error:', err);
    throw err;
  }
}

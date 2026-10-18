import { getActiveToken, getStoredPat, setStoredPat, PAT_STORAGE_KEY } from '../utils/auth';

export { getStoredPat, setStoredPat, PAT_STORAGE_KEY };

export interface GitHubRepoData {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    avatar_url: string;
    html_url: string;
  };
  html_url: string;
  description: string | null;
  homepage: string | null;
  size: number;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string | null;
  license: {
    key: string;
    name: string;
    spdx_id: string | null;
  } | null;
  default_branch: string;
  pushed_at: string;
  created_at: string;
  updated_at: string;
  subscribers_count?: number;
  network_count?: number;
}

export type GitHubLanguagesData = Record<string, number>;

export interface RepoDetails {
  repo: GitHubRepoData;
  languages: GitHubLanguagesData;
}

export interface RateLimitStatus {
  limit: number;
  remaining: number;
  resetUnix: number;
  used: number;
}

export class GitHubApiError extends Error {
  status: number;
  isRateLimit: boolean;
  isNotFound: boolean;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'GitHubApiError';
    this.status = status;
    this.isRateLimit = status === 403 || status === 429;
    this.isNotFound = status === 404;
  }
}

export async function fetchRateLimit(customToken?: string): Promise<RateLimitStatus> {
  const token = customToken !== undefined ? customToken : getActiveToken();
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token.trim()}`;
  }

  const res = await fetch('https://api.github.com/rate_limit', { headers });

  if (!res.ok) {
    throw new GitHubApiError(`Failed to fetch rate limit (${res.status})`, res.status);
  }

  const data = await res.json();
  const core = data.resources?.core || { limit: token ? 5000 : 60, remaining: token ? 5000 : 60, reset: Math.floor(Date.now() / 1000) + 3600, used: 0 };

  return {
    limit: core.limit,
    remaining: core.remaining,
    resetUnix: core.reset,
    used: core.used || (core.limit - core.remaining),
  };
}

export async function fetchRepoDetails(owner: string, repo: string, customPat?: string): Promise<RepoDetails> {
  const pat = customPat !== undefined ? customPat : getActiveToken();

  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  };

  if (pat) {
    headers.Authorization = `Bearer ${pat.trim()}`;
  }

  const baseUrl = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;

  try {
    const [repoRes, languagesRes] = await Promise.all([
      fetch(baseUrl, { headers }),
      fetch(`${baseUrl}/languages`, { headers }),
    ]);

    if (!repoRes.ok) {
      if (repoRes.status === 404) {
        throw new GitHubApiError(
          `Repository "${owner}/${repo}" was not found or is private.`,
          404
        );
      } else if (repoRes.status === 403) {
        const rateLimitRemaining = repoRes.headers.get('x-ratelimit-remaining');
        if (rateLimitRemaining === '0') {
          throw new GitHubApiError(
            'GitHub API rate limit exceeded. Please add a Personal Access Token (PAT) or sign in with GitHub to continue.',
            403
          );
        } else {
          throw new GitHubApiError(
            'Access forbidden. If this repository is private, a valid token is required.',
            403
          );
        }
      } else {
        throw new GitHubApiError(
          `GitHub API error (${repoRes.status}): ${repoRes.statusText}`,
          repoRes.status
        );
      }
    }

    const repoData: GitHubRepoData = await repoRes.json();
    let languagesData: GitHubLanguagesData = {};

    if (languagesRes.ok) {
      languagesData = await languagesRes.json();
    }

    return {
      repo: repoData,
      languages: languagesData,
    };
  } catch (error) {
    if (error instanceof GitHubApiError) {
      throw error;
    }

    throw new GitHubApiError(
      'Network error. Please check your internet connection and try again.',
      0
    );
  }
}

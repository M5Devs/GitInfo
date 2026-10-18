export interface ParsedRepo {
  owner: string;
  repo: string;
}

export function parseGitHubRepo(input: string): ParsedRepo | null {
  if (!input || typeof input !== 'string') {
    return null;
  }

  let cleaned = input.trim();

  if (!cleaned) {
    return null;
  }

  cleaned = cleaned.replace(/^https?:\/\//i, '');
  cleaned = cleaned.replace(/^(www\.)?github\.com\//i, '');
  cleaned = cleaned.split('?')[0].split('#')[0];
  cleaned = cleaned.replace(/\/+$/g, '');

  if (cleaned.endsWith('.git')) {
    cleaned = cleaned.slice(0, -4);
  }

  const parts = cleaned.split('/').filter(Boolean);

  if (parts.length < 2) {
    return null;
  }

  const owner = parts[0];
  const repo = parts[1];

  const ownerRegex = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/;
  const repoRegex = /^[a-zA-Z0-9_.-]+$/;

  if (!ownerRegex.test(owner) || !repoRegex.test(repo)) {
    return null;
  }

  return { owner, repo };
}

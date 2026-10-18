#!/usr/bin/env node

// GitInfo CLI Companion - Terminal Repository Inspector

const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  indigo: '\x1b[38;2;99;102;241m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  orange: '\x1b[38;2;249;115;22m',
  red: '\x1b[31m',
  fuchsia: '\x1b[35m',
  gray: '\x1b[90m',
  white: '\x1b[37m',
};

function printUsage() {
  console.log(`
${colors.bold}${colors.indigo}GitInfo CLI Companion v1.0.0${colors.reset}
Inspect repository size, weight tier, metrics, and languages right from your terminal.

${colors.bold}Usage:${colors.reset}
  node cli/bin.js <owner/repo>
  npx . <owner/repo>

${colors.bold}Examples:${colors.reset}
  node cli/bin.js facebook/react
  node cli/bin.js https://github.com/torvalds/linux
`);
}

function parseRepoInput(input) {
  if (!input) return null;
  let str = input.trim();
  if (str.startsWith('https://') || str.startsWith('http://')) {
    try {
      const url = new URL(str);
      const parts = url.pathname.replace(/^\//, '').replace(/\.git$/, '').split('/');
      if (parts.length >= 2) {
        return { owner: parts[0], repo: parts[1] };
      }
    } catch {
      return null;
    }
  }

  const clean = str.replace(/\.git$/, '');
  const parts = clean.split('/');
  if (parts.length === 2 && parts[0] && parts[1]) {
    return { owner: parts[0], repo: parts[1] };
  }
  return null;
}

function formatSize(sizeInKB) {
  if (isNaN(sizeInKB) || sizeInKB < 0) return { string: '0 KB', tier: 'Feather 🪶', color: colors.green };

  const MB_THRESHOLD = 1024;
  const GB_THRESHOLD = 1048576;

  let string = '';
  if (sizeInKB < MB_THRESHOLD) {
    string = `${Math.round(sizeInKB)} KB`;
  } else if (sizeInKB <= GB_THRESHOLD) {
    string = `${(sizeInKB / MB_THRESHOLD).toFixed(2)} MB`;
  } else {
    string = `${(sizeInKB / GB_THRESHOLD).toFixed(2)} GB`;
  }

  let tier = 'Feather 🪶';
  let color = colors.green;

  if (sizeInKB < 1024) {
    tier = 'Feather 🪶';
    color = colors.green;
  } else if (sizeInKB < 20480) {
    tier = 'Light 🟢';
    color = colors.green;
  } else if (sizeInKB < 102400) {
    tier = 'Medium 🟡';
    color = colors.yellow;
  } else if (sizeInKB < 1048576) {
    tier = 'Heavy 🟠';
    color = colors.orange;
  } else if (sizeInKB < 10485760) {
    tier = 'Titan 🔴';
    color = colors.red;
  } else {
    tier = 'Black Hole 🕳️💀';
    color = colors.fuchsia;
  }

  return { string, tier, color };
}

async function run() {
  const args = process.argv.slice(2);
  if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
    printUsage();
    process.exit(0);
  }

  const parsed = parseRepoInput(args[0]);
  if (!parsed) {
    console.error(`${colors.red}Error: Invalid repository input "${args[0]}". Expected "owner/repo" format.${colors.reset}`);
    process.exit(1);
  }

  const { owner, repo } = parsed;
  console.log(`${colors.indigo}${colors.bold}🔍 GitInfo: Inspecting ${owner}/${repo}...${colors.reset}\n`);

  const headers = {
    'User-Agent': 'GitInfo-CLI',
    Accept: 'application/vnd.github.v3+json',
  };

  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const [repoRes, langRes] = await Promise.all([
      fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers }),
      fetch(`https://api.github.com/repos/${owner}/${repo}/languages`, { headers }),
    ]);

    if (!repoRes.ok) {
      if (repoRes.status === 404) {
        console.error(`${colors.red}Error: Repository "${owner}/${repo}" not found on GitHub.${colors.reset}`);
      } else if (repoRes.status === 403) {
        console.error(`${colors.red}Error: GitHub API rate limit reached. Set GITHUB_TOKEN environment variable to bypass.${colors.reset}`);
      } else {
        console.error(`${colors.red}Error: GitHub API responded with status ${repoRes.status}.${colors.reset}`);
      }
      process.exit(1);
    }

    const repoData = await repoRes.json();
    const langData = langRes.ok ? await langRes.json() : {};

    const formattedSize = formatSize(repoData.size);

    console.log(`${colors.bold}${colors.white}${repoData.full_name}${colors.reset}`);
    if (repoData.description) {
      console.log(`${colors.gray}${repoData.description}${colors.reset}`);
    }
    console.log(`${colors.gray}https://github.com/${repoData.full_name}${colors.reset}\n`);

    console.log(`${colors.bold}--- SIZE & WEIGHT TIER ---${colors.reset}`);
    console.log(`Size:   ${colors.bold}${formattedSize.color}${formattedSize.string}${colors.reset} (${repoData.size.toLocaleString()} KB raw)`);
    console.log(`Weight: ${formattedSize.color}${formattedSize.tier}${colors.reset}\n`);

    console.log(`${colors.bold}--- KEY METRICS ---${colors.reset}`);
    console.log(`⭐ Stars:     ${colors.yellow}${repoData.stargazers_count.toLocaleString()}${colors.reset}`);
    console.log(`🍴 Forks:     ${colors.cyan}${repoData.forks_count.toLocaleString()}${colors.reset}`);
    console.log(`👀 Watchers:  ${colors.white}${(repoData.subscribers_count ?? repoData.watchers_count).toLocaleString()}${colors.reset}`);
    console.log(`⚠️ Issues:    ${colors.orange}${repoData.open_issues_count.toLocaleString()}${colors.reset}`);
    console.log(`🛡️ License:   ${colors.gray}${repoData.license?.spdx_id || repoData.license?.name || 'N/A'}${colors.reset}\n`);

    // Languages breakdown
    const totalBytes = Object.values(langData).reduce((acc, b) => acc + b, 0);
    if (totalBytes > 0) {
      console.log(`${colors.bold}--- LANGUAGES ---${colors.reset}`);
      const topLangs = Object.entries(langData)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      topLangs.forEach(([langName, bytes]) => {
        const pct = ((bytes / totalBytes) * 100).toFixed(1);
        console.log(`• ${langName.padEnd(14)} ${pct}%`);
      });
      console.log();
    }

    // Auto-suggest shallow clone if size > 100 MB (102400 KB)
    if (repoData.size > 102400) {
      console.log(`${colors.bold}${colors.yellow}💡 Bandwidth Saver Suggestion (>100 MB Codebase):${colors.reset}`);
      console.log(`${colors.green}git clone --depth 1 https://github.com/${repoData.full_name}.git${colors.reset}\n`);
    }

  } catch (err) {
    console.error(`${colors.red}Error fetching repository details: ${err.message}${colors.reset}`);
    process.exit(1);
  }
}

run();

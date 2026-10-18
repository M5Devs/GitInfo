import fs from 'fs';
import path from 'path';

const LANGUAGES = [
  'JavaScript',
  'TypeScript',
  'Python',
  'Rust',
  'Go',
  'C++',
  'C'
];

function formatRepoSize(sizeInKB) {
  if (isNaN(sizeInKB) || sizeInKB < 0) {
    return { formattedString: '0 KB', weightCategory: 'feather', weightLabel: 'Feather 🪶' };
  }
  let formattedString;
  const MB_THRESHOLD = 1024;
  const GB_THRESHOLD = 1048576;

  if (sizeInKB < MB_THRESHOLD) {
    formattedString = `${Math.round(sizeInKB)} KB`;
  } else if (sizeInKB <= GB_THRESHOLD) {
    formattedString = `${(sizeInKB / MB_THRESHOLD).toFixed(2)} MB`;
  } else {
    formattedString = `${(sizeInKB / GB_THRESHOLD).toFixed(2)} GB`;
  }

  let weightCategory;
  let weightLabel;
  if (sizeInKB < 1024) {
    weightCategory = 'feather';
    weightLabel = 'Feather 🪶';
  } else if (sizeInKB < 20480) {
    weightCategory = 'light';
    weightLabel = 'Light 🟢';
  } else if (sizeInKB < 102400) {
    weightCategory = 'medium';
    weightLabel = 'Medium 🟡';
  } else if (sizeInKB < 1048576) {
    weightCategory = 'heavy';
    weightLabel = 'Heavy 🟠';
  } else if (sizeInKB < 10485760) {
    weightCategory = 'titan';
    weightLabel = 'Titan 🔴';
  } else {
    weightCategory = 'blackHole';
    weightLabel = 'Black Hole 🕳️';
  }

  return { formattedString, weightCategory, weightLabel };
}

async function fetchReposForQuery(query) {
  const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=30`;
  const headers = {
    'User-Agent': 'GitInfo-Rankings-Bot',
    'Accept': 'application/vnd.github.v3+json',
  };

  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
  }

  try {
    const res = await fetch(url, { headers });
    if (!res.ok) {
      console.warn(`Failed to fetch for query "${query}": ${res.status} ${res.statusText}`);
      return [];
    }
    const data = await res.json();
    return data.items || [];
  } catch (err) {
    console.error(`Error fetching query "${query}":`, err);
    return [];
  }
}

async function run() {
  console.log('Fetching GitHub Rankings...');
  const repoMap = new Map();

  // 1. Fetch top repos overall
  console.log('Fetching top overall repos...');
  const topOverall = await fetchReposForQuery('stars:>10000');
  for (const item of topOverall) {
    repoMap.set(item.full_name, item);
  }

  // 2. Fetch top repos for each language
  for (const lang of LANGUAGES) {
    console.log(`Fetching top repos for ${lang}...`);
    const items = await fetchReposForQuery(`stars:>5000 language:${lang}`);
    for (const item of items) {
      if (!repoMap.has(item.full_name)) {
        repoMap.set(item.full_name, item);
      }
    }
  }

  const repos = Array.from(repoMap.values()).map((repo) => {
    const formatted = formatRepoSize(repo.size);
    return {
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      owner: {
        login: repo.owner.login,
        avatar_url: repo.owner.avatar_url,
        html_url: repo.owner.html_url,
      },
      html_url: repo.html_url,
      description: repo.description || '',
      stargazers_count: repo.stargazers_count,
      forks_count: repo.forks_count,
      language: repo.language || 'Other',
      size: repo.size,
      sizeFormatted: formatted.formattedString,
      weightCategory: formatted.weightCategory,
      weightLabel: formatted.weightLabel,
    };
  });

  // Sort descending by stars
  repos.sort((a, b) => b.stargazers_count - a.stargazers_count);

  const outputDir = path.resolve(process.cwd(), 'public/data');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, 'rankings.json');

  if (repos.length > 0) {
    const output = {
      lastUpdated: new Date().toISOString(),
      repos,
    };
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8');
    console.log(`Successfully saved ${repos.length} repos to ${outputPath}`);
  } else {
    console.warn('No repos fetched (possibly rate limited). Checking existing file...');
    if (!fs.existsSync(outputPath)) {
      console.log('Creating empty structure for rankings.json');
      fs.writeFileSync(outputPath, JSON.stringify({ lastUpdated: new Date().toISOString(), repos: [] }, null, 2), 'utf-8');
    }
  }
}

run();

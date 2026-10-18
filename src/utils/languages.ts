export interface LanguageBreakdown {
  name: string;
  bytes: number;
  percentage: number;
  formattedPercentage: string;
  color: string;
}

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Rust: '#dea584',
  Go: '#00ADD8',
  Java: '#b07219',
  'C++': '#f34b7d',
  C: '#555555',
  'C#': '#178600',
  Ruby: '#701516',
  PHP: '#4F5D95',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Vue: '#41b883',
  Svelte: '#ff3e00',
  Shell: '#89e051',
  Dart: '#00B4AB',
  Elixir: '#6e4a7e',
  Zig: '#ec915c',
  Scala: '#c22d40',
  Lua: '#000080',
  Docker: '#384d54',
  Dockerfile: '#384d54',
};

const FALLBACK_COLORS = [
  '#6366f1',
  '#ec4899',
  '#10b981',
  '#f59e0b',
  '#8b5cf6',
  '#06b6d4',
  '#14b8a6',
  '#f97316',
  '#84cc16',
  '#e11d48',
];

export function calculateLanguageBreakdown(languages: Record<string, number>): LanguageBreakdown[] {
  if (!languages || typeof languages !== 'object') {
    return [];
  }

  const entries = Object.entries(languages).filter(([_, bytes]) => typeof bytes === 'number' && bytes > 0);
  const totalBytes = entries.reduce((acc, [_, bytes]) => acc + bytes, 0);

  if (totalBytes === 0) {
    return [];
  }

  entries.sort((a, b) => b[1] - a[1]);

  let fallbackColorIndex = 0;

  return entries.map(([name, bytes]) => {
    const rawPercentage = (bytes / totalBytes) * 100;
    const percentage = Math.round(rawPercentage * 10) / 10;
    const formattedPercentage = percentage < 0.1 ? '<0.1%' : `${percentage.toFixed(1)}%`;

    let color = LANGUAGE_COLORS[name];
    if (!color) {
      color = FALLBACK_COLORS[fallbackColorIndex % FALLBACK_COLORS.length];
      fallbackColorIndex++;
    }

    return {
      name,
      bytes,
      percentage: Math.max(0.1, percentage),
      formattedPercentage,
      color,
    };
  });
}

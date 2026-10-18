export type WeightCategory = 'feather' | 'light' | 'medium' | 'heavy' | 'titan' | 'blackHole';

export interface FormattedSize {
  value: number;
  unit: 'KB' | 'MB' | 'GB';
  formattedString: string;
  weightCategory: WeightCategory;
  gaugePercentage: number;
}

export function formatRepoSize(sizeInKB: number): FormattedSize {
  if (isNaN(sizeInKB) || sizeInKB < 0) {
    return {
      value: 0,
      unit: 'KB',
      formattedString: '0 KB',
      weightCategory: 'feather',
      gaugePercentage: 0,
    };
  }

  let value: number;
  let unit: 'KB' | 'MB' | 'GB';
  let formattedString: string;

  const MB_THRESHOLD = 1024;
  const GB_THRESHOLD = 1048576;

  if (sizeInKB < MB_THRESHOLD) {
    value = Math.round(sizeInKB);
    unit = 'KB';
    formattedString = `${value} KB`;
  } else if (sizeInKB <= GB_THRESHOLD) {
    value = sizeInKB / MB_THRESHOLD;
    unit = 'MB';
    formattedString = `${value.toFixed(2)} MB`;
  } else {
    value = sizeInKB / GB_THRESHOLD;
    unit = 'GB';
    formattedString = `${value.toFixed(2)} GB`;
  }

  let weightCategory: WeightCategory;

  // Tier Thresholds in KB:
  // 1. Feather: < 1 MB (1024 KB)
  // 2. Light: 1 MB - 20 MB (1024 KB - 20480 KB)
  // 3. Medium: 20 MB - 100 MB (20480 KB - 102400 KB)
  // 4. Heavy: 100 MB - 1 GB (102400 KB - 1048576 KB)
  // 5. Titan: 1 GB - 10 GB (1048576 KB - 10485760 KB)
  // 6. Black Hole: > 10 GB (>= 10485760 KB)

  if (sizeInKB < 1024) {
    weightCategory = 'feather';
  } else if (sizeInKB < 20480) {
    weightCategory = 'light';
  } else if (sizeInKB < 102400) {
    weightCategory = 'medium';
  } else if (sizeInKB < 1048576) {
    weightCategory = 'heavy';
  } else if (sizeInKB < 10485760) {
    weightCategory = 'titan';
  } else {
    weightCategory = 'blackHole';
  }

  let gaugePercentage: number;

  if (sizeInKB <= 0) {
    gaugePercentage = 0;
  } else {
    // Max scale up to 64 GB (67,108,864 KB) for Black Hole scale
    const maxLog = Math.log10(67108864);
    const currentLog = Math.log10(Math.max(1, sizeInKB));
    gaugePercentage = Math.min(100, Math.max(5, Math.round((currentLog / maxLog) * 100)));
  }

  return {
    value,
    unit,
    formattedString,
    weightCategory,
    gaugePercentage,
  };
}

export function formatNumber(num: number): string {
  if (isNaN(num) || num === null || num === undefined) {
    return '0';
  }
  return num.toLocaleString('en-US');
}

export function formatRelativeTime(isoDateString: string): string {
  if (!isoDateString) return 'N/A';

  const date = new Date(isoDateString);
  if (isNaN(date.getTime())) return 'N/A';

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 0) {
    return 'just now';
  }

  if (diffInSeconds < 60) {
    return `${diffInSeconds} ${diffInSeconds === 1 ? 'second' : 'seconds'} ago`;
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'} ago`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} ${diffInYears === 1 ? 'year' : 'years'} ago`;
}


export interface ZipSnapshotEstimate {
  estimatedZipKB: number;
  formattedZipSize: string;
  savingsPercentage: number;
  comparisonText: string;
}

export function estimateZipSnapshot(sizeInKB: number): ZipSnapshotEstimate {
  if (isNaN(sizeInKB) || sizeInKB <= 0) {
    return {
      estimatedZipKB: 0,
      formattedZipSize: "~0 KB",
      savingsPercentage: 0,
      comparisonText: "0% lighter — no Git history included",
    };
  }

  const estimatedZipKB = Math.max(1, Math.round(sizeInKB * 0.18));
  const formattedZip = formatRepoSize(estimatedZipKB);
  const formattedFull = formatRepoSize(sizeInKB);
  const savingsPercentage = Math.min(99, Math.max(50, Math.round((1 - estimatedZipKB / sizeInKB) * 100)));

  return {
    estimatedZipKB,
    formattedZipSize: `~${formattedZip.formattedString}`,
    savingsPercentage,
    comparisonText: `vs ${formattedFull.formattedString} Full Clone — no Git history included`,
  };
}

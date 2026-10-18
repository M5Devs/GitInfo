export interface FormattedSize {
  value: number;
  unit: 'KB' | 'MB' | 'GB';
  formattedString: string;
  weightCategory: 'light' | 'medium' | 'heavy' | 'massive';
  gaugePercentage: number;
}

export function formatRepoSize(sizeInKB: number): FormattedSize {
  if (isNaN(sizeInKB) || sizeInKB < 0) {
    return {
      value: 0,
      unit: 'KB',
      formattedString: '0 KB',
      weightCategory: 'light',
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

  let weightCategory: 'light' | 'medium' | 'heavy' | 'massive';
  let gaugePercentage: number;

  if (sizeInKB < 1024) {
    weightCategory = 'light';
  } else if (sizeInKB < 51200) {
    weightCategory = 'medium';
  } else if (sizeInKB < 524288) {
    weightCategory = 'heavy';
  } else {
    weightCategory = 'massive';
  }

  if (sizeInKB <= 0) {
    gaugePercentage = 0;
  } else {
    const maxLog = Math.log10(10485760);
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

import { describe, it, expect } from 'vitest';
import { estimateZipSnapshot } from '../src/utils/formatters';

describe('ZIP Snapshot Calculation & Formatting', () => {
  it('handles invalid or zero repository sizes gracefully', () => {
    const zeroRes = estimateZipSnapshot(0);
    expect(zeroRes.estimatedZipKB).toBe(0);
    expect(zeroRes.formattedZipSize).toBe('~0 KB');

    const nanRes = estimateZipSnapshot(NaN);
    expect(nanRes.estimatedZipKB).toBe(0);
    expect(nanRes.formattedZipSize).toBe('~0 KB');
  });

  it('calculates estimated ZIP size and percentage savings correctly for small repos', () => {
    // 10,000 KB (~10 MB full clone)
    const res = estimateZipSnapshot(10000);
    expect(res.estimatedZipKB).toBe(1800);
    expect(res.formattedZipSize).toBe('~1.76 MB');
    expect(res.savingsPercentage).toBe(82);
    expect(res.comparisonText).toContain('vs 9.77 MB Full Clone');
  });

  it('calculates estimated ZIP size and percentage savings for large repos', () => {
    // 409,600 KB (~400 MB full clone)
    const res = estimateZipSnapshot(409600);
    expect(res.estimatedZipKB).toBe(73728);
    expect(res.formattedZipSize).toBe('~72.00 MB');
    expect(res.savingsPercentage).toBe(82);
    expect(res.comparisonText).toContain('vs 400.00 MB Full Clone');
  });
});

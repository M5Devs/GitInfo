import { describe, it, expect } from 'vitest';
import { calculateWeightComparison, renderCompareHTML } from '../src/compare';

describe('Compare Module', () => {
  it('calculates weight ratio correctly when Repo A is lighter', () => {
    const result = calculateWeightComparison(10000, 32000, 'facebook/react', 'vuejs/core');
    expect(result.lighterRepo).toBe('A');
    expect(result.ratioText).toBe('facebook/react is 3.2x lighter than vuejs/core');
  });

  it('calculates weight ratio correctly when Repo B is lighter', () => {
    const result = calculateWeightComparison(150000, 50000, 'torvalds/linux', 'facebook/react');
    expect(result.lighterRepo).toBe('B');
    expect(result.ratioText).toBe('facebook/react is 3.0x lighter than torvalds/linux');
  });

  it('handles equal repository sizes', () => {
    const result = calculateWeightComparison(5000, 5000, 'owner/repo1', 'owner/repo2');
    expect(result.lighterRepo).toBe('equal');
    expect(result.ratioText).toBe('Both repositories are identical in size');
  });

  it('handles edge case invalid size inputs', () => {
    const result = calculateWeightComparison(-50, NaN, 'a', 'b');
    expect(result.lighterRepo).toBe('equal');
    expect(result.ratioText).toBe('Invalid size comparison');
  });

  it('renders compare HTML template container', () => {
    const html = renderCompareHTML();
    expect(html).toContain('Repository Comparison');
    expect(html).toContain('compare-form');
    expect(html).toContain('weight-ratio-badge');
  });
});

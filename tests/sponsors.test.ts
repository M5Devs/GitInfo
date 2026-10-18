import { describe, it, expect } from 'vitest';
import { VIP_SPONSORS, isVipSponsor } from '../src/utils/sponsors';

describe('Sponsors Module', () => {
  it('contains ClausValcaTD in VIP_SPONSORS', () => {
    expect(VIP_SPONSORS).toContain('ClausValcaTD');
  });

  it('correctly identifies VIP sponsors case-insensitively', () => {
    expect(isVipSponsor('ClausValcaTD')).toBe(true);
    expect(isVipSponsor('clausvalcatd')).toBe(true);
    expect(isVipSponsor('CLAUSVALCATD')).toBe(true);
  });

  it('returns false for non-sponsors or missing usernames', () => {
    expect(isVipSponsor('random_user')).toBe(false);
    expect(isVipSponsor(null)).toBe(false);
    expect(isVipSponsor(undefined)).toBe(false);
    expect(isVipSponsor('')).toBe(false);
  });
});

export const VIP_SPONSORS: string[] = ['ClausValcaTD'];

export function isVipSponsor(username: string | null | undefined): boolean {
  if (!username) return false;
  const lowerUsername = username.toLowerCase();
  return VIP_SPONSORS.some((sponsor) => sponsor.toLowerCase() === lowerUsername);
}

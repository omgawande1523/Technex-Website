/**
 * Festival pass tiers.
 *
 * TODO: confirm value — no pass tiers exist in the repo or the backend API.
 * Registration today is per event (/register/<slug>) and per workshop
 * (/workshops/<slug>/register), with fees served by the backend. /passes lists
 * those real options; add tiers here once the organisers define them.
 */
export interface PassTier {
  id: string;
  name: string;
  /** Price in paise, as the backend uses. null = TBA. */
  pricePaise: number | null;
  perks: string[];
  /** Where the pass is bought: an existing registration route. */
  href: string;
}

export const passTiers: PassTier[] = [];

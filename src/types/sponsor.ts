export interface Sponsor {
  id: string;
  name: string;
  logo: string;
  /** Logo artwork is light on transparency and needs a dark backing plate. */
  onDark?: boolean;
}

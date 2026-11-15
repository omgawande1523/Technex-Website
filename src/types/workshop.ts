export interface WorkshopAttack {
  name: string;
  description: string;
  damage: string | number;
  cost?: string[];
}

export interface Workshop {
  id: string;
  slug?: string;
  title: string;
  category?: string;
  description?: string;
  image?: string;
  cover: string;
  character: string;
  accent: string;
  element?: string;
  elementIcon?: string;
  hp?: number;
  holoNumber?: string;
  attacks?: WorkshopAttack[];
  weakness?: string;
  resistance?: string;
  /** Festival day (1-based). TODO: confirm value — not in the repo yet, so unset for every workshop. */
  day?: number | null;
}

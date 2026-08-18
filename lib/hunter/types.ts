export type HunterDeal = {
  title: string;
  description?: string;
  originalPrice?: number;
  dealPrice?: number;
  currency?: string;
  discount?: number;
  store?: string;
  category?: string;
  dealUrl: string;
  imageUrl?: string;
  source: string;
};

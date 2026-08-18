export type HunterDeal = {
  title: string;
  slug?: string;
  description?: string;

  originalPrice?: number;
  dealPrice?: number;
  currency?: string;
  discount?: number;

  store?: string;
  dealUrl: string;
  image?: string;

  category?: string;
  dealScore?: number;

  verified?: boolean;
  status?: "PENDING" | "ACTIVE" | "REJECTED";

  expiresAt?: Date;
};

export type DealSource = {
  name: string;
  type: "RSS" | "API" | "OFFICIAL";
  url: string;
  category: string;
  enabled: boolean;
};
import type { HunterDeal } from "./types";

export function getTestDeals(): HunterDeal[] {
  return [
    {
      title: "AI Productivity Tool - 50% Off",
      description:
        "Limited-time discount on an AI productivity platform.",
      originalPrice: 999,
      dealPrice: 499,
      currency: "INR",
      discount: 50,
      store: "Official",
      category: "AI Tools",
      dealUrl: "https://example.com/ai-deal",
      source: "official",
    },

    {
      title: "Gaming Mouse Flash Deal",
      description:
        "Gaming mouse available at a heavily discounted price.",
      originalPrice: 1999,
      dealPrice: 799,
      currency: "INR",
      discount: 60,
      store: "Gaming Store",
      category: "Gaming",
      dealUrl: "https://example.com/gaming-mouse",
      source: "official",
    },

    {
      title: "Web Hosting 67% Off",
      description:
        "Limited-time web hosting promotion.",
      originalPrice: 2999,
      dealPrice: 999,
      currency: "INR",
      discount: 67,
      store: "Hosting Provider",
      category: "Hosting",
      dealUrl: "https://example.com/hosting",
      source: "official",
    },
  ];
}
import type { HunterTrial } from "./trial-types";

export function getTestTrials(): HunterTrial[] {
  return [
    {
      title: "AI Writing Tool - 14 Day Free Trial",
      description:
        "Try an AI writing platform free for 14 days.",
      company: "Example AI",
      category: "AI Tools",
      trialDays: 14,
      priceAfterTrial: 999,
      currency: "INR",
      trialUrl: "https://example.com/ai-trial",
    },

    {
      title: "Design Software - 30 Day Free Trial",
      description:
        "Explore professional design tools with a 30-day trial.",
      company: "Example Design",
      category: "Design",
      trialDays: 30,
      priceAfterTrial: 1499,
      currency: "INR",
      trialUrl: "https://example.com/design-trial",
    },

    {
      title: "Cloud Hosting - 7 Day Free Trial",
      description:
        "Test cloud hosting services for 7 days.",
      company: "Example Hosting",
      category: "Hosting",
      trialDays: 7,
      priceAfterTrial: 799,
      currency: "INR",
      trialUrl: "https://example.com/hosting-trial",
    },
  ];
}
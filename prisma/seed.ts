import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DIRECT_URL;

if (!connectionString) {
  throw new Error("DIRECT_URL is not defined");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log("Adding test data...");

  await prisma.deal.createMany({
    data: [
      {
        title: "AI Writing Tool - 50% Off",
        slug: "ai-writing-tool-50-off",
        description:
          "Test deal for an AI writing tool.",
        originalPrice: 999,
        dealPrice: 499,
        currency: "INR",
        discount: 50,
        store: "Test Store",
        dealUrl: "https://example.com",
        category: "AI Tools",
        dealScore: 82,
        verified: true,
        status: "ACTIVE",
      },
      {
        title: "Gaming Mouse Flash Deal",
        slug: "gaming-mouse-flash-deal",
        description:
          "Test gaming mouse discount.",
        originalPrice: 1999,
        dealPrice: 799,
        currency: "INR",
        discount: 60,
        store: "Test Store",
        dealUrl: "https://example.com",
        category: "Gaming",
        dealScore: 91,
        verified: true,
        status: "ACTIVE",
      },
      {
        title: "Web Hosting Deal",
        slug: "web-hosting-deal",
        description:
          "Test web hosting offer.",
        originalPrice: 2999,
        dealPrice: 999,
        currency: "INR",
        discount: 67,
        store: "Test Hosting",
        dealUrl: "https://example.com",
        category: "Hosting",
        dealScore: 88,
        verified: true,
        status: "ACTIVE",
      },
    ],
  });

  await prisma.trial.createMany({
    data: [
      {
        name: "AI Productivity Tool",
        slug: "ai-productivity-tool",
        description:
          "Test free trial for an AI productivity platform.",
        category: "AI",
        trialDays: 14,
        priceAfterTrial: 999,
        currency: "INR",
        cardRequired: true,
        autoRenew: true,
        officialUrl: "https://example.com",
        verified: true,
        status: "ACTIVE",
      },
      {
        name: "Design Software Trial",
        slug: "design-software-trial",
        description:
          "Test free trial for design software.",
        category: "Design",
        trialDays: 30,
        priceAfterTrial: 1499,
        currency: "INR",
        cardRequired: false,
        autoRenew: false,
        officialUrl: "https://example.com",
        verified: true,
        status: "ACTIVE",
      },
    ],
  });

  console.log("Test data added successfully!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
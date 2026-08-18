import { prisma } from "@/lib/db";
import { verifyUrl } from "./verify-url";

type SaveDealInput = {
  title: string;
  slug?: string;
  description?: string;
  originalPrice?: number;
  dealPrice?: number;
  currency?: string;
  discount?: number;
  store?: string;
  category?: string;
  dealUrl: string;
  image?: string;
  dealScore?: number;
  status?: string;
  verified?: boolean;
  expiresAt?: Date;
};

function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 180);
}

export async function saveDeal(deal: SaveDealInput) {
  // --------------------------------
  // 1. Make sure we have a slug
  // --------------------------------
  const slug =
    deal.slug?.trim() ||
    createSlug(deal.title);

  // --------------------------------
  // 2. Check duplicate by slug
  // --------------------------------
  const existingSlug = await prisma.deal.findUnique({
    where: {
      slug,
    },
  });

  if (existingSlug) {
    return {
      created: false,
      reason: "duplicate-slug",
      deal: existingSlug,
    };
  }

  // --------------------------------
  // 3. Check duplicate by URL
  // --------------------------------
  const existingUrl = await prisma.deal.findFirst({
    where: {
      dealUrl: deal.dealUrl,
    },
  });

  if (existingUrl) {
    return {
      created: false,
      reason: "duplicate-url",
      deal: existingUrl,
    };
  }

  // --------------------------------
  // 4. Verify URL
  // --------------------------------
  console.log(`🔗 Checking URL: ${deal.dealUrl}`);

  const validUrl = await verifyUrl(deal.dealUrl);

  if (!validUrl) {
    console.log(`⚠️ Invalid URL: ${deal.dealUrl}`);

    return {
      created: false,
      reason: "invalid-url",
      deal: null,
    };
  }

  // --------------------------------
  // 5. Create deal
  // --------------------------------
  const created = await prisma.deal.create({
    data: {
      title: deal.title,

      slug,

      description: deal.description ?? null,

      originalPrice:
        deal.originalPrice ?? null,

      dealPrice:
        deal.dealPrice ?? null,

      currency:
        deal.currency ?? "INR",

      discount:
        deal.discount ?? null,

      store:
        deal.store ?? null,

      category:
        deal.category ?? null,

      dealUrl:
        deal.dealUrl,

      image:
        deal.image ?? null,

      dealScore:
        deal.dealScore ?? 0,

      status:
        deal.status ?? "PENDING",

      verified:
        deal.verified ?? false,

      expiresAt:
        deal.expiresAt ?? null,
    },
  });

  console.log(`✅ Saved: ${created.title}`);

  return {
    created: true,
    reason: "created",
    deal: created,
  };
}
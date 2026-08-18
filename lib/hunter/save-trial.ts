import { prisma } from "@/lib/db";
import type { HunterTrial } from "./trial-types";

function createSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function saveTrial(trial: HunterTrial) {
  const slug = createSlug(trial.title);

  const existing = await prisma.trial.findFirst({
    where: {
      OR: [
        {
          slug,
        },
        {
          officialUrl: trial.trialUrl,
        },
      ],
    },
  });

  if (existing) {
    return {
      created: false,
      trial: existing,
    };
  }

  const created = await prisma.trial.create({
    data: {
      name: trial.title,

      slug,

      description:
        trial.description ?? null,

      image:
        trial.imageUrl ?? null,

      category:
        trial.category ?? "General",

      trialDays:
        trial.trialDays ?? null,

      priceAfterTrial:
        trial.priceAfterTrial ?? null,

      currency:
        trial.currency ?? "INR",

      cardRequired:
        false,

      autoRenew:
        false,

      officialUrl:
        trial.trialUrl,

      verified: false,

      status: "PENDING",
    },
  });

  return {
    created: true,
    trial: created,
  };
}
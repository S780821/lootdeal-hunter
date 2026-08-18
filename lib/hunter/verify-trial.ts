import { prisma } from "@/lib/db";

type VerificationResult = {
  success: boolean;
  verified: boolean;
  status: string;
  reason: string;
};

export async function verifyTrial(
  trialId: string
): Promise<VerificationResult> {
  const trial = await prisma.trial.findUnique({
    where: {
      id: trialId,
    },
  });

  if (!trial) {
    throw new Error("Trial not found");
  }

  let response: Response;

  try {
    response = await fetch(trial.officialUrl, {
      method: "HEAD",
      redirect: "follow",
      headers: {
        "User-Agent":
          "LootDealHunter/1.0 (+deal verification)",
      },
    });
  } catch {
    await prisma.trial.update({
      where: {
        id: trialId,
      },
      data: {
        verified: false,
        status: "REJECTED",
      },
    });

    return {
      success: false,
      verified: false,
      status: "REJECTED",
      reason: "Unable to reach the official trial URL.",
    };
  }

  const validStatus =
    response.status >= 200 &&
    response.status < 400;

  if (!validStatus) {
    await prisma.trial.update({
      where: {
        id: trialId,
      },
      data: {
        verified: false,
        status: "REJECTED",
      },
    });

    return {
      success: true,
      verified: false,
      status: "REJECTED",
      reason: `Official URL returned HTTP ${response.status}.`,
    };
  }

  const updated = await prisma.trial.update({
    where: {
      id: trialId,
    },
    data: {
      verified: true,
      status: "ACTIVE",
    },
  });

  return {
    success: true,
    verified: true,
    status: updated.status,
    reason: "Official trial URL is reachable.",
  };
}
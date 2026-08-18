import { prisma } from "@/lib/db";
import { verifyTrial } from "@/lib/hunter/verify-trial";

async function main() {
  console.log("");
  console.log("🔍 TRIAL VERIFICATION");
  console.log("=====================");
  console.log("");

  const trials = await prisma.trial.findMany({
    where: {
      status: "PENDING",
    },
  });

  console.log(
    `Found ${trials.length} pending trials.`
  );

  console.log("");

  for (const trial of trials) {
    console.log(`Checking: ${trial.name}`);

    try {
      const result = await verifyTrial(trial.id);

      if (result.verified) {
        console.log("✅ VERIFIED");
      } else {
        console.log("❌ REJECTED");
      }

      console.log(`   ${result.reason}`);
    } catch (error) {
      console.log("❌ Verification failed");
      console.error(error);
    }

    console.log("");
  }

  console.log("=====================");
  console.log("Verification finished.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function TrialPage({ params }: Props) {
  const { slug } = await params;

  const trial = await prisma.trial.findUnique({
    where: {
      slug,
    },
  });

  if (!trial || trial.status !== "ACTIVE") {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="bg-black px-6 py-10 text-white">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/free-trials"
            className="text-sm text-gray-400 hover:text-white"
          >
            ← Back to Free Trials
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-12">
        <div className="overflow-hidden rounded-3xl border bg-white shadow-lg">
          <div className="bg-black p-8 text-white">
            <span className="rounded-full bg-green-500 px-4 py-2 text-sm font-black">
              🎁 FREE TRIAL
            </span>

            <h1 className="mt-8 text-4xl font-black md:text-6xl">
              {trial.name}
            </h1>

            {trial.category && (
              <p className="mt-4 text-gray-300">
                {trial.category}
              </p>
            )}
          </div>

          <div className="p-8 md:p-10">
            {trial.description && (
              <p className="max-w-3xl text-lg leading-8 text-gray-600">
                {trial.description}
              </p>
            )}

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl bg-green-50 p-5">
                <p className="text-sm text-green-700">
                  Free Period
                </p>

                <p className="mt-1 text-3xl font-black text-green-700">
                  {trial.trialDays ?? 0} days
                </p>
              </div>

              <div className="rounded-2xl bg-gray-50 p-5">
                <p className="text-sm text-gray-500">
                  After Trial
                </p>

                <p className="mt-1 text-2xl font-black">
                  {trial.priceAfterTrial !== null
                    ? `₹${trial.priceAfterTrial}`
                    : "Varies"}
                </p>
              </div>

              <div className="rounded-2xl bg-gray-50 p-5">
                <p className="text-sm text-gray-500">
                  Card Required
                </p>

                <p className="mt-1 text-2xl font-black">
                  {trial.cardRequired ? "Yes" : "No"}
                </p>
              </div>

              <div className="rounded-2xl bg-gray-50 p-5">
                <p className="text-sm text-gray-500">
                  Auto Renew
                </p>

                <p className="mt-1 text-2xl font-black">
                  {trial.autoRenew ? "Yes" : "No"}
                </p>
              </div>
            </div>

            <div className="mt-10 max-w-md">
              <a
                href={trial.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-xl bg-black px-6 py-4 text-center font-black text-white hover:bg-gray-800"
              >
                Start Free Trial →
              </a>

              <p className="mt-4 text-center text-xs text-gray-500">
                Check the provider's terms before starting.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
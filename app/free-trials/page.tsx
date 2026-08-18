import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function FreeTrialsPage() {
  const trials = await prisma.trial.findMany({
    where: {
      status: "ACTIVE",
      verified: true,
    },
    orderBy: {
      trialDays: "desc",
    },
  });

  return (
    <main className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <section className="bg-black px-6 py-16 text-white">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/"
            className="text-sm text-gray-400 hover:text-white"
          >
            ← Back to LootDeal Hunter
          </Link>

          <div className="mt-10">
            <div className="text-5xl">🎁</div>

            <h1 className="mt-4 text-5xl font-black">
              Free Trials
            </h1>

            <p className="mt-4 max-w-2xl text-lg text-gray-300">
              Discover verified free trials for AI tools,
              software, design platforms, hosting and more.
            </p>
          </div>
        </div>
      </section>

      {/* TRIALS */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        {trials.length === 0 ? (
          <div className="rounded-2xl border bg-white p-12 text-center">
            <div className="text-5xl">🎁</div>

            <h2 className="mt-4 text-2xl font-black">
              No verified free trials found
            </h2>

            <p className="mt-2 text-gray-500">
              We are hunting for new free trials. Check back soon.
            </p>

            <Link
              href="/"
              className="mt-6 inline-block rounded-xl bg-black px-6 py-3 font-bold text-white"
            >
              Back Home
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {trials.map((trial) => (
              <article
                key={trial.id}
                className="overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                {/* TOP */}
                <div className="bg-black px-5 py-4 text-white">
                  <div className="flex items-center justify-between">
                    <span className="font-black">
                      🎁 FREE TRIAL
                    </span>

                    <span className="rounded-full bg-green-500/20 px-3 py-1 text-sm font-bold text-green-300">
                      ✓ Verified
                    </span>
                  </div>
                </div>

                {/* CONTENT */}
                <div className="p-6">
                  {/* BADGES */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-bold text-green-700">
                      {trial.trialDays ?? 0} DAYS FREE
                    </span>

                    {trial.category && (
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                        {trial.category}
                      </span>
                    )}
                  </div>

                  {/* TITLE */}
                  <h2 className="mt-5 text-2xl font-black text-gray-900">
                    {trial.name}
                  </h2>

                  {/* DESCRIPTION */}
                  {trial.description && (
                    <p className="mt-3 text-sm leading-6 text-gray-600">
                      {trial.description}
                    </p>
                  )}

                  {/* DETAILS */}
                  <div className="mt-5 rounded-xl bg-gray-50 p-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">
                        Free period
                      </span>

                      <span className="font-bold">
                        {trial.trialDays
                          ? `${trial.trialDays} days`
                          : "Varies"}
                      </span>
                    </div>

                    <div className="mt-2 flex justify-between text-sm">
                      <span className="text-gray-500">
                        After trial
                      </span>

                      <span className="font-bold">
                        {trial.priceAfterTrial !== null
                          ? `₹${trial.priceAfterTrial}/month`
                          : "Price varies"}
                      </span>
                    </div>

                    <div className="mt-2 flex justify-between text-sm">
                      <span className="text-gray-500">
                        Card required
                      </span>

                      <span className="font-bold">
                        {trial.cardRequired ? "Yes" : "No"}
                      </span>
                    </div>

                    <div className="mt-2 flex justify-between text-sm">
                      <span className="text-gray-500">
                        Auto renew
                      </span>

                      <span className="font-bold">
                        {trial.autoRenew ? "Yes" : "No"}
                      </span>
                    </div>
                  </div>

                  {/* CTA */}
                  <Link
                    href={`/free-trials/${trial.slug}`}
                    className="mt-6 block rounded-xl bg-black px-5 py-3 text-center font-bold text-white transition hover:bg-gray-800"
                  >
                    View Free Trial →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* DISCLAIMER */}
      <section className="border-t bg-white px-6 py-10">
        <div className="mx-auto max-w-4xl text-center text-sm text-gray-500">
          <p>
            Trial terms, pricing, renewal rules and availability
            can change. Always check the provider&apos;s official
            terms before starting a trial.
          </p>
        </div>
      </section>
    </main>
  );
}
import { prisma } from "@/lib/db";
import AdminActions from "@/components/AdminActions";
import HunterButton from "@/components/HunterButton";

function getDealQuality(score: number) {
  if (score >= 90) {
    return {
      label: "🔥 AMAZING DEAL",
      className: "bg-orange-100 text-orange-700",
    };
  }

  if (score >= 80) {
    return {
      label: "🟢 GREAT DEAL",
      className: "bg-green-100 text-green-700",
    };
  }

  if (score >= 70) {
    return {
      label: "🟡 GOOD DEAL",
      className: "bg-yellow-100 text-yellow-700",
    };
  }

  if (score >= 60) {
    return {
      label: "⚪ FAIR DEAL",
      className: "bg-gray-100 text-gray-700",
    };
  }

  return {
    label: "🔴 WEAK DEAL",
    className: "bg-red-100 text-red-700",
  };
}

export default async function AdminPage() {
  const pendingDeals = await prisma.deal.findMany({
    where: {
      status: "PENDING",
    },
    orderBy: [
      {
        dealScore: "desc",
      },
      {
        createdAt: "desc",
      },
    ],
  });

  const pendingTrials = await prisma.trial.findMany({
    where: {
      status: "PENDING",
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const activeDeals = await prisma.deal.count({
    where: {
      status: "ACTIVE",
    },
  });

  const activeTrials = await prisma.trial.count({
    where: {
      status: "ACTIVE",
    },
  });

  return (
    <main className="min-h-screen bg-gray-100 px-6 py-10">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="mb-10">
          <h1 className="text-4xl font-black">
            LootDeal Hunter Admin
          </h1>

          <p className="mt-2 text-gray-600">
            Review and manage discovered deals and free trials.
          </p>
        </div>

        {/* HUNTER */}
        <section className="mb-8">
          <HunterButton />
        </section>

        {/* STATS */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Pending Deals
            </p>

            <p className="mt-2 text-4xl font-black">
              {pendingDeals.length}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Pending Trials
            </p>

            <p className="mt-2 text-4xl font-black">
              {pendingTrials.length}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Active Deals
            </p>

            <p className="mt-2 text-4xl font-black">
              {activeDeals}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Active Trials
            </p>

            <p className="mt-2 text-4xl font-black">
              {activeTrials}
            </p>
          </div>

        </div>

        {/* DEALS */}
        <section className="mt-10">

          <div className="mb-5">
            <h2 className="text-2xl font-black">
              🔎 Pending Deals
            </h2>

            <p className="text-sm text-gray-500">
              Review deals before publishing.
            </p>
          </div>

          {pendingDeals.length === 0 ? (
            <div className="rounded-2xl bg-white p-8 text-center text-gray-500">
              No pending deals.
            </div>
          ) : (
            <div className="space-y-4">

              {pendingDeals.map((deal) => {
                const quality = getDealQuality(
                  deal.dealScore
                );

                return (
                  <div
                    key={deal.id}
                    className="rounded-2xl bg-white p-6 shadow-sm"
                  >
                    <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                      <div className="min-w-0">

                        {/* TITLE */}
                        <h3 className="text-xl font-black">
                          {deal.title}
                        </h3>

                        {/* BADGES */}
                        <div className="mt-3 flex flex-wrap gap-2 text-sm">

                          <span className="rounded-full bg-gray-100 px-3 py-1">
                            {deal.category ?? "General"}
                          </span>

                          <span
                            className={`rounded-full px-3 py-1 font-bold ${quality.className}`}
                          >
                            {quality.label}
                          </span>

                          <span className="rounded-full bg-black px-3 py-1 font-bold text-white">
                            Score {deal.dealScore}
                          </span>

                          {deal.discount !== null && (
                            <span className="rounded-full bg-red-100 px-3 py-1 font-bold text-red-700">
                              {deal.discount}% OFF
                            </span>
                          )}

                        </div>

                        {/* PRICE */}
                        <div className="mt-4 flex flex-wrap items-center gap-4">

                          {deal.dealPrice !== null && (
                            <span className="text-2xl font-black">
                              {deal.currency}{" "}
                              {deal.dealPrice}
                            </span>
                          )}

                          {deal.originalPrice !== null && (
                            <span className="text-sm text-gray-400 line-through">
                              {deal.currency}{" "}
                              {deal.originalPrice}
                            </span>
                          )}

                        </div>

                        {/* STORE */}
                        <p className="mt-3 text-sm text-gray-500">
                          Store:{" "}
                          <span className="font-bold text-gray-700">
                            {deal.store ?? "Unknown"}
                          </span>
                        </p>

                        {/* LINK */}
                        <a
                          href={deal.dealUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-block text-sm font-bold underline"
                        >
                          Open deal →
                        </a>

                      </div>

                      {/* ACTIONS */}
                      <div className="shrink-0">
                        <AdminActions
                          type="deal"
                          id={deal.id}
                        />
                      </div>

                    </div>
                  </div>
                );
              })}

            </div>
          )}

        </section>

        {/* TRIALS */}
        <section className="mt-12">

          <div className="mb-5">
            <h2 className="text-2xl font-black">
              🎁 Pending Trials
            </h2>

            <p className="text-sm text-gray-500">
              Review trials before publishing.
            </p>
          </div>

          {pendingTrials.length === 0 ? (
            <div className="rounded-2xl bg-white p-8 text-center text-gray-500">
              No pending trials.
            </div>
          ) : (
            <div className="space-y-4">

              {pendingTrials.map((trial) => (
                <div
                  key={trial.id}
                  className="rounded-2xl bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                    <div>

                      {/* TITLE */}
                      <h3 className="text-xl font-black">
                        {trial.name}
                      </h3>

                      {/* BADGES */}
                      <div className="mt-2 flex flex-wrap gap-2 text-sm">

                        <span className="rounded-full bg-gray-100 px-3 py-1">
                          {trial.category ?? "General"}
                        </span>

                        <span className="rounded-full bg-green-100 px-3 py-1 font-bold text-green-700">
                          {trial.trialDays ?? 0} days
                        </span>

                      </div>

                      {/* CARD REQUIRED */}
                      <p className="mt-3 text-sm text-gray-500">
                        Card required:{" "}
                        {trial.cardRequired
                          ? "Yes"
                          : "No"}
                      </p>

                      {/* OFFICIAL LINK */}
                      <a
                        href={trial.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-block text-sm font-bold underline"
                      >
                        Open official page →
                      </a>

                    </div>

                    {/* ACTIONS */}
                    <AdminActions
                      type="trial"
                      id={trial.id}
                    />

                  </div>
                </div>
              ))}

            </div>
          )}

        </section>

      </div>
    </main>
  );
}

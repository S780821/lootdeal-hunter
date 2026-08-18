import Link from "next/link";
import { prisma } from "@/lib/db";
import DealCard from "@/components/DealCard";

export default async function Home() {
  const deals = await prisma.deal.findMany({
    where: {
      status: "ACTIVE",
    },
    orderBy: {
      dealScore: "desc",
    },
    take: 6,
  });

  return (
    <main className="min-h-screen bg-gray-50">
      {/* HERO */}
      <section className="bg-black px-6 py-20 text-white">
        <div className="mx-auto max-w-6xl text-center">
          <div className="mb-6 inline-block rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm">
            🔥 Deals • Free Trials • Loot Alerts
          </div>

          <h1 className="text-5xl font-black tracking-tight md:text-7xl">
            Find the Deals
            <br />
            Worth Grabbing.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-300">
            LootDeal Hunter discovers amazing discounts,
            free trials and limited-time offers from around
            the web.
          </p>

          {/* SEARCH */}
          <form
            action="/deals"
            method="GET"
            className="mx-auto mt-8 flex max-w-2xl overflow-hidden rounded-2xl bg-white"
          >
            <input
              type="text"
              name="q"
              placeholder="Search deals, apps, AI tools..."
              className="flex-1 px-5 py-4 text-black outline-none"
            />

            <button
              type="submit"
              className="bg-white px-6 text-2xl text-black transition hover:bg-gray-100"
            >
              🔎
            </button>
          </form>

          {/* BUTTONS */}
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/deals"
              className="rounded-xl bg-white px-6 py-3 font-bold text-black transition hover:bg-gray-200"
            >
              🔥 Browse Deals
            </Link>

            <Link
              href="/free-trials"
              className="rounded-xl border border-white/30 px-6 py-3 font-bold transition hover:bg-white/10"
            >
              🎁 Free Trials
            </Link>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
          {[
            ["🔥", "Loot", "/deals"],
            ["🎁", "Trials", "/free-trials"],
            ["🤖", "AI", "/deals?category=AI%20Tools"],
            ["🎮", "Gaming", "/deals?category=Gaming"],
            ["💻", "Software", "/deals?category=Software"],
            ["📱", "Electronics", "/deals?category=Electronics"],
            ["☁️", "Hosting", "/deals?category=Hosting"],
            ["🎨", "Design", "/deals?category=Design"],
          ].map(([icon, name, href]) => (
            <Link
              key={name}
              href={href}
              className="rounded-2xl border bg-white p-6 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="text-3xl">{icon}</div>

              <div className="mt-3 font-bold text-gray-900">
                {name}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* TOP DEALS */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-black">
              🔥 Top Deals
            </h2>

            <p className="mt-2 text-gray-600">
              Highest-rated deals right now.
            </p>
          </div>

          <Link
            href="/deals"
            className="font-bold underline"
          >
            View all →
          </Link>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {deals.map((deal) => (
            <DealCard
              key={deal.id}
              deal={deal}
            />
          ))}
        </div>
      </section>

      {/* FREE TRIAL CTA */}
      <section className="bg-white px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <div className="text-5xl">🎁</div>

          <h2 className="mt-5 text-4xl font-black">
            Looking for Free Trials?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-gray-600">
            Discover legitimate free trials for AI tools,
            software, hosting, design platforms and more.
          </p>

          <Link
            href="/free-trials"
            className="mt-7 inline-block rounded-xl bg-black px-7 py-3 font-bold text-white transition hover:bg-gray-800"
          >
            Explore Free Trials →
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-black px-6 py-8 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} LootDeal Hunter.
        Deals worth grabbing.
      </footer>
    </main>
  );
}
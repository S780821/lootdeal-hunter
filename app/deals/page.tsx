import Link from "next/link";
import { prisma } from "@/lib/db";
import DealCard from "@/components/DealCard";

type Props = {
  searchParams: Promise<{
    q?: string;
    category?: string;
    sort?: string;
  }>;
};

export default async function DealsPage({
  searchParams,
}: Props) {
  const params = await searchParams;

  const q = params.q?.trim() || "";
  const category = params.category || "";
  const sort = params.sort || "score";

  const where = {
    status: "ACTIVE",
    ...(q
      ? {
          OR: [
            {
              title: {
                contains: q,
                mode: "insensitive" as const,
              },
            },
            {
              description: {
                contains: q,
                mode: "insensitive" as const,
              },
            },
            {
              store: {
                contains: q,
                mode: "insensitive" as const,
              },
            },
            {
              category: {
                contains: q,
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : {}),
    ...(category
      ? {
          category: {
            equals: category,
            mode: "insensitive" as const,
          },
        }
      : {}),
  };

  let orderBy:
    | { dealScore: "asc" | "desc" }
    | { discount: "asc" | "desc" }
    | { createdAt: "asc" | "desc" };

  if (sort === "discount") {
    orderBy = {
      discount: "desc",
    };
  } else if (sort === "newest") {
    orderBy = {
      createdAt: "desc",
    };
  } else {
    orderBy = {
      dealScore: "desc",
    };
  }

  const deals = await prisma.deal.findMany({
    where,
    orderBy,
  });

  const categories = [
    "AI Tools",
    "Gaming",
    "Hosting",
    "Software",
    "Electronics",
    "Design",
  ];

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
            <div className="text-5xl">🔥</div>

            <h1 className="mt-4 text-5xl font-black">
              Loot Deals
            </h1>

            <p className="mt-4 max-w-2xl text-lg text-gray-300">
              Find discounts, offers and deals worth grabbing.
            </p>
          </div>
        </div>
      </section>

      {/* FILTERS */}
      <section className="border-b bg-white px-6 py-6">
        <div className="mx-auto max-w-6xl">
          <form
            method="GET"
            action="/deals"
            className="grid gap-4 md:grid-cols-[1fr_auto_auto]"
          >
            {/* SEARCH */}
            <div className="flex overflow-hidden rounded-xl border bg-white">
              <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder="Search deals, AI tools, gaming..."
                className="min-w-0 flex-1 px-4 py-3 outline-none"
              />

              <button
                type="submit"
                className="px-5 text-xl"
              >
                🔎
              </button>
            </div>

            {/* CATEGORY */}
            <select
              name="category"
              defaultValue={category}
              className="rounded-xl border px-4 py-3 font-semibold outline-none"
            >
              <option value="">All Categories</option>

              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            {/* SORT */}
            <select
              name="sort"
              defaultValue={sort}
              className="rounded-xl border px-4 py-3 font-semibold outline-none"
            >
              <option value="score">
                Highest Loot Score
              </option>

              <option value="discount">
                Biggest Discount
              </option>

              <option value="newest">
                Newest
              </option>
            </select>
          </form>

          {/* CATEGORY BUTTONS */}
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href="/deals"
              className={`rounded-full px-4 py-2 text-sm font-bold ${
                !category
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              All
            </Link>

            {categories.map((item) => (
              <Link
                key={item}
                href={`/deals?category=${encodeURIComponent(
                  item
                )}`}
                className={`rounded-full px-4 py-2 text-sm font-bold ${
                  category === item
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* RESULTS */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black">
              {q
                ? `Search results for "${q}"`
                : category
                  ? `${category} Deals`
                  : "Latest Loot"}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {deals.length}{" "}
              {deals.length === 1 ? "deal" : "deals"} found
            </p>
          </div>

          {(q || category) && (
            <Link
              href="/deals"
              className="font-bold underline"
            >
              Clear filters
            </Link>
          )}
        </div>

        {deals.length === 0 ? (
          <div className="rounded-3xl border bg-white p-16 text-center">
            <div className="text-6xl">🔍</div>

            <h2 className="mt-5 text-2xl font-black">
              No deals found
            </h2>

            <p className="mt-2 text-gray-500">
              Try another search or category.
            </p>

            <Link
              href="/deals"
              className="mt-6 inline-block rounded-xl bg-black px-6 py-3 font-bold text-white"
            >
              Show All Deals
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {deals.map((deal) => (
              <DealCard
                key={deal.id}
                deal={deal}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

function getDealQuality(score: number) {
  if (score >= 90) {
    return {
      label: "🔥 AMAZING DEAL",
      className: "bg-orange-100 text-orange-700",
    };
  }

  if (score >= 80) {
    return {
      label: "🔥 HOT DEAL",
      className: "bg-red-100 text-red-700",
    };
  }

  if (score >= 70) {
    return {
      label: "🟢 GREAT DEAL",
      className: "bg-green-100 text-green-700",
    };
  }

  if (score >= 60) {
    return {
      label: "🟡 GOOD DEAL",
      className: "bg-yellow-100 text-yellow-700",
    };
  }

  return {
    label: "⚪ DEAL",
    className: "bg-gray-100 text-gray-700",
  };
}

function formatPrice(
  currency: string,
  price: number
) {
  if (currency === "INR" || currency === "₹") {
    return `₹${price}`;
  }

  if (currency === "USD" || currency === "$") {
    return `$${price}`;
  }

  if (currency === "EUR" || currency === "€") {
    return `€${price}`;
  }

  if (currency === "GBP" || currency === "£") {
    return `£${price}`;
  }

  return `${currency} ${price}`;
}

async function getDeal(slug: string) {
  return prisma.deal.findUnique({
    where: {
      slug,
    },
  });
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { slug } = await params;

  const deal = await getDeal(slug);

  if (!deal || deal.status !== "ACTIVE") {
    return {
      title: "Deal Not Found | LootDeal Hunter",
      description:
        "The requested deal could not be found.",
    };
  }

  const description =
    deal.description?.slice(0, 155) ||
    `${deal.title} — discover this deal on LootDeal Hunter.`;

  return {
    title: `${deal.title} | LootDeal Hunter`,
    description,

    keywords: [
      deal.title,
      deal.category ?? "deals",
      deal.store ?? "online deals",
      "discount",
      "offers",
      "best deals",
      "LootDeal Hunter",
    ],

    openGraph: {
      title: deal.title,
      description,
      type: "website",
      ...(deal.image
        ? {
            images: [
              {
                url: deal.image,
              },
            ],
          }
        : {}),
    },

    twitter: {
      card: "summary_large_image",
      title: deal.title,
      description,
      ...(deal.image
        ? {
            images: [deal.image],
          }
        : {}),
    },
  };
}

export default async function DealPage({
  params,
}: Props) {
  const { slug } = await params;

  const deal = await getDeal(slug);

  if (!deal || deal.status !== "ACTIVE") {
    notFound();
  }

  const quality = getDealQuality(
    deal.dealScore
  );

  const price =
    deal.dealPrice !== null
      ? formatPrice(
          deal.currency,
          deal.dealPrice
        )
      : "FREE";

  const originalPrice =
    deal.originalPrice !== null
      ? formatPrice(
          deal.currency,
          deal.originalPrice
        )
      : null;

  return (
    <main className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <section className="bg-black px-6 py-10 text-white">
        <div className="mx-auto max-w-5xl">

          <Link
            href="/deals"
            className="text-sm text-gray-400 transition hover:text-white"
          >
            ← Back to Deals
          </Link>

        </div>
      </section>

      {/* DEAL */}
      <section className="mx-auto max-w-5xl px-6 py-12">

        <article className="overflow-hidden rounded-3xl border bg-white shadow-lg">

          {/* TOP */}
          <div className="bg-black p-8 text-white md:p-10">

            <div className="flex flex-wrap items-center justify-between gap-4">

              <span
                className={`rounded-full px-4 py-2 text-sm font-black ${quality.className}`}
              >
                {quality.label}
              </span>

              <span className="rounded-full bg-white px-4 py-2 text-sm font-black text-black">
                Loot Score {deal.dealScore}/100
              </span>

              {deal.verified && (
                <span className="rounded-full bg-green-500 px-4 py-2 text-sm font-bold text-white">
                  ✓ Verified Deal
                </span>
              )}

            </div>

            <h1 className="mt-8 text-4xl font-black leading-tight md:text-6xl">
              {deal.title}
            </h1>

            {deal.store && (
              <p className="mt-4 text-gray-300">
                Available at{" "}
                <span className="font-bold text-white">
                  {deal.store}
                </span>
              </p>
            )}

          </div>

          {/* IMAGE */}
          {deal.image && (
            <div className="border-b bg-gray-50 p-6">
              <div className="flex justify-center">
                <img
                  src={deal.image}
                  alt={deal.title}
                  className="max-h-[420px] w-auto max-w-full rounded-2xl object-contain"
                />
              </div>
            </div>
          )}

          {/* CONTENT */}
          <div className="p-8 md:p-10">

            <div className="grid gap-10 md:grid-cols-3">

              {/* MAIN */}
              <div className="md:col-span-2">

                {deal.description && (
                  <section>
                    <h2 className="text-2xl font-black">
                      About This Deal
                    </h2>

                    <p className="mt-4 whitespace-pre-line leading-7 text-gray-600">
                      {deal.description}
                    </p>
                  </section>
                )}

                {/* PRICE */}
                <div className="mt-8 grid gap-4 sm:grid-cols-2">

                  <div className="rounded-2xl bg-gray-50 p-5">

                    <p className="text-sm text-gray-500">
                      Original Price
                    </p>

                    <p className="mt-1 text-2xl font-black text-gray-400 line-through">
                      {originalPrice ?? "—"}
                    </p>

                  </div>

                  <div className="rounded-2xl bg-green-50 p-5">

                    <p className="text-sm font-bold text-green-700">
                      Deal Price
                    </p>

                    <p className="mt-1 text-3xl font-black text-green-700">
                      {price}
                    </p>

                  </div>

                </div>

                {/* DISCOUNT */}
                {deal.discount !== null && (
                  <div className="mt-6 rounded-2xl border p-5">

                    <div className="flex items-center justify-between gap-4">

                      <span className="font-bold">
                        Discount
                      </span>

                      <span className="text-2xl font-black text-red-600">
                        {deal.discount}% OFF
                      </span>

                    </div>

                  </div>
                )}

              </div>

              {/* SIDEBAR */}
              <aside className="h-fit rounded-2xl bg-gray-50 p-6">

                {/* CATEGORY */}
                <p className="text-sm text-gray-500">
                  Category
                </p>

                <p className="mt-1 font-black">
                  {deal.category || "General"}
                </p>

                <div className="my-6 border-t" />

                {/* STORE */}
                <p className="text-sm text-gray-500">
                  Store
                </p>

                <p className="mt-1 font-black">
                  {deal.store || "Unknown"}
                </p>

                <div className="my-6 border-t" />

                {/* SCORE */}
                <p className="text-sm text-gray-500">
                  Loot Score
                </p>

                <p className="mt-1 text-4xl font-black">
                  {deal.dealScore}
                  <span className="text-lg text-gray-400">
                    /100
                  </span>
                </p>

                {/* CTA */}
                <a
                  href={deal.dealUrl}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="mt-7 block rounded-xl bg-black px-5 py-4 text-center font-black text-white transition hover:bg-gray-800"
                >
                  Get This Deal →
                </a>

                <p className="mt-4 text-center text-xs leading-5 text-gray-500">
                  You'll be redirected to the seller's website.
                  Always verify the final price and terms before
                  purchasing.
                </p>

              </aside>

            </div>

          </div>

        </article>

      </section>

      {/* DISCLAIMER */}
      <section className="mx-auto max-w-5xl px-6 pb-16">

        <div className="rounded-2xl border bg-white p-5 text-sm leading-6 text-gray-500">
          Prices, discounts and availability can change at any
          time. LootDeal Hunter collects and evaluates publicly
          available deal information. Always verify the final
          price, availability and terms on the seller's website
          before purchasing.
        </div>

      </section>

    </main>
  );
}

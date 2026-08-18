import Link from "next/link";

type Deal = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  originalPrice: number | null;
  dealPrice: number | null;
  currency: string;
  discount: number | null;
  store: string | null;
  dealUrl: string;
  category: string | null;
  dealScore: number;
};

function getScoreBadge(score: number) {
  if (score >= 90) {
    return {
      label: "🔥 AMAZING LOOT",
      className: "bg-orange-500 text-white",
    };
  }

  if (score >= 80) {
    return {
      label: "🔥 HOT DEAL",
      className: "bg-red-500 text-white",
    };
  }

  if (score >= 70) {
    return {
      label: "🟢 GREAT DEAL",
      className: "bg-green-500 text-white",
    };
  }

  if (score >= 60) {
    return {
      label: "🟡 GOOD DEAL",
      className: "bg-yellow-400 text-black",
    };
  }

  return {
    label: "⚪ DEAL",
    className: "bg-gray-200 text-gray-800",
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

  return `${currency} ${price}`;
}

export default function DealCard({
  deal,
}: {
  deal: Deal;
}) {
  const badge = getScoreBadge(deal.dealScore);

  return (
    <article className="group overflow-hidden rounded-2xl border bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl">
      {/* SCORE HEADER */}
      <div className="flex items-center justify-between bg-black px-5 py-3 text-white">
        <span className="rounded-full px-3 py-1 text-xs font-black">
          {badge.label}
        </span>

        <span className="text-sm font-bold">
          {deal.dealScore}/100
        </span>
      </div>

      <div className="p-5">
        {/* CATEGORY + DISCOUNT */}
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-black text-red-600">
            {deal.discount !== null
              ? `${deal.discount}% OFF`
              : "DEAL"}
          </span>

          {deal.category && (
            <span className="truncate text-xs font-semibold text-gray-500">
              {deal.category}
            </span>
          )}
        </div>

        {/* TITLE */}
        <h3 className="mt-5 line-clamp-2 text-xl font-black text-gray-900">
          {deal.title}
        </h3>

        {/* DESCRIPTION */}
        {deal.description && (
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-600">
            {deal.description}
          </p>
        )}

        {/* PRICE */}
        <div className="mt-5 flex min-h-10 items-end gap-3">
          {deal.dealPrice !== null && (
            <span className="text-3xl font-black text-gray-900">
              {formatPrice(
                deal.currency,
                deal.dealPrice
              )}
            </span>
          )}

          {deal.originalPrice !== null && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(
                deal.currency,
                deal.originalPrice
              )}
            </span>
          )}
        </div>

        {/* STORE */}
        {deal.store && (
          <p className="mt-3 text-xs text-gray-500">
            Store:{" "}
            <span className="font-bold text-gray-700">
              {deal.store}
            </span>
          </p>
        )}

        {/* BUTTON */}
        <Link
          href={`/deals/${deal.slug}`}
          className="mt-5 block rounded-xl bg-black px-5 py-3 text-center font-bold text-white transition hover:bg-gray-800"
        >
          View Deal →
        </Link>
      </div>
    </article>
  );
}
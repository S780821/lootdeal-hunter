"use client";

import { useState } from "react";

type Props = {
  type: "deal" | "trial";
  id: string;
};

export default function AdminActions({
  type,
  id,
}: Props) {
  const [loading, setLoading] = useState(false);

  async function update(action: "APPROVE" | "REJECT") {
    setLoading(true);

    try {
      const endpoint =
        type === "deal"
          ? "/api/admin/deals/action"
          : "/api/admin/trials/action";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          action,
        }),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      window.location.reload();
    } catch (error) {
      console.error(error);

      alert(
        "Something went wrong. Please try again."
      );

      setLoading(false);
    }
  }

  return (
    <div className="flex gap-3">
      <button
        onClick={() => update("APPROVE")}
        disabled={loading}
        className="rounded-xl bg-green-600 px-5 py-3 font-bold text-white transition hover:bg-green-700 disabled:opacity-50"
      >
        ✓ Approve
      </button>

      <button
        onClick={() => update("REJECT")}
        disabled={loading}
        className="rounded-xl bg-red-600 px-5 py-3 font-bold text-white transition hover:bg-red-700 disabled:opacity-50"
      >
        ✕ Reject
      </button>
    </div>
  );
}
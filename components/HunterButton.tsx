"use client";

import { useState } from "react";

export default function HunterButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function runHunter() {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        "/api/admin/run-hunter",
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Hunter failed"
        );
      }

      setMessage(
        `✅ Found ${data.found} deals • Added ${data.added} • Skipped ${data.skipped}`
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? `❌ ${error.message}`
          : "❌ Hunter failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-black">
            🔥 Deal Hunter
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Search connected sources for new deals.
          </p>
        </div>

        <button
          type="button"
          onClick={runHunter}
          disabled={loading}
          className="rounded-xl bg-black px-6 py-3 font-bold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "🔎 Hunting..."
            : "🔥 Run Hunter Now"}
        </button>
      </div>

      {message && (
        <div className="mt-4 rounded-xl bg-gray-50 p-4 text-sm font-semibold">
          {message}
        </div>
      )}
    </div>
  );
}
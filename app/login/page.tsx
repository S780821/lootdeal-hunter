"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "/api/admin/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error ?? "Login failed"
        );

        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError(
        "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <div className="text-center">
          <div className="text-5xl">🔐</div>

          <h1 className="mt-5 text-3xl font-black">
            Admin Login
          </h1>

          <p className="mt-2 text-gray-500">
            LootDeal Hunter
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8"
        >
          <label
            htmlFor="password"
            className="text-sm font-bold"
          >
            Admin Password
          </label>

          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            placeholder="Enter admin password"
            className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-black"
            required
          />

          {error && (
            <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-black px-5 py-3 font-bold text-white transition hover:bg-gray-800 disabled:opacity-50"
          >
            {loading
              ? "Signing in..."
              : "Sign In"}
          </button>
        </form>
      </div>
    </main>
  );
}
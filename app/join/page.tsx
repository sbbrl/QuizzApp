"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function JoinForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [code, setCode] = useState(searchParams.get("code") || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 4) {
      alert("Code must be 4 characters");
      return;
    }

    setLoading(true);
    router.push(`/quiz/${code.toUpperCase()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-red-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <Link href="/" className="text-sm text-gray-600 hover:text-gray-800 mb-4 inline-block">
          ← Back to Home
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-red-600 mb-2">
            💕 Join Quiz 💕
          </h1>
          <p className="text-gray-600">
            Enter the 4-character code to join the quiz session
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
              Session Code
            </label>
            <input
              id="code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-center text-3xl font-bold tracking-widest text-gray-900"
              maxLength={4}
              required
              placeholder="XXXX"
            />
          </div>

          <button
            type="submit"
            disabled={loading || code.length !== 4}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xl"
          >
            {loading ? "Joining..." : "Join Session →"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Get the code from your quiz host</p>
        </div>
      </div>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-pink-100 to-red-100 flex items-center justify-center">
        <div className="text-xl text-gray-800">Loading...</div>
      </div>
    }>
      <JoinForm />
    </Suspense>
  );
}

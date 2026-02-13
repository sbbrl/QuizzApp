"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/admin/templates"
            className="bg-white rounded-lg shadow-md p-8 hover:shadow-xl transition-shadow"
          >
            <div className="text-center">
              <div className="text-5xl mb-4">📝</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Create Template
              </h2>
              <p className="text-gray-600">
                Build quiz templates with custom questions
              </p>
            </div>
          </Link>

          <Link
            href="/admin/sessions/start"
            className="bg-white rounded-lg shadow-md p-8 hover:shadow-xl transition-shadow"
          >
            <div className="text-center">
              <div className="text-5xl mb-4">🚀</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Start Session
              </h2>
              <p className="text-gray-600">
                Begin a new quiz session with a template
              </p>
            </div>
          </Link>

          <Link
            href="/admin/sessions"
            className="bg-white rounded-lg shadow-md p-8 hover:shadow-xl transition-shadow"
          >
            <div className="text-center">
              <div className="text-5xl mb-4">📊</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Manage Sessions
              </h2>
              <p className="text-gray-600">
                View results, lock/unlock, and manage sessions
              </p>
            </div>
          </Link>
        </div>

        <div className="mt-12 bg-white rounded-lg shadow-md p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Welcome, {session.user?.name}! 👋
          </h2>
          <p className="text-gray-600">
            Use the admin panel to create quiz templates, start sessions, and manage participant responses.
            The system makes it easy to run compatibility quizzes for your Valentine's Day event!
          </p>
        </div>
      </main>
    </div>
  );
}

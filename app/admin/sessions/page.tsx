"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Session {
  id: string;
  code: string;
  status: string;
  createdAt: string;
  template: {
    name: string;
  };
  _count: {
    responses: number;
  };
}

export default function ManageSessionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchSessions();
    }
  }, [session]);

  const fetchSessions = async () => {
    try {
      const response = await fetch("/api/sessions");
      if (response.ok) {
        const data = await response.json();
        setSessions(data);
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "unlocked":
        return "bg-green-100 text-green-800";
      case "locked":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (status === "loading" || loading) {
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
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/admin" className="text-xl font-bold text-gray-800 hover:text-gray-600">
            ← Back to Admin
          </Link>
          <Link
            href="/admin/sessions/start"
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            + Start New Session
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Manage Quiz Sessions
        </h1>

        {sessions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">🚀</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              No sessions yet
            </h2>
            <p className="text-gray-600 mb-6">
              Start your first quiz session to get started!
            </p>
            <Link
              href="/admin/sessions/start"
              className="inline-block bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Start Session
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-3xl font-bold text-blue-600 mb-1">
                      {session.code}
                    </div>
                    <div className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getStatusColor(session.status)}`}>
                      {session.status.toUpperCase()}
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {session.template.name}
                </h3>

                <div className="text-sm text-gray-600 mb-4">
                  <div>Responses: {session._count.responses}</div>
                  <div>Created: {new Date(session.createdAt).toLocaleDateString()}</div>
                </div>

                <Link
                  href={`/admin/sessions/${session.id}`}
                  className="block w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded text-center transition-colors"
                >
                  Manage
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

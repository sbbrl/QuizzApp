"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Response {
  id: string;
  participantName: string;
  participantEmail: string | null;
  submittedAt: string;
  timeSpent: number | null;
  answers: string;
}

interface SessionData {
  id: string;
  code: string;
  status: string;
  timeLimit: number | null;
  unlockTime: string | null;
  createdAt: string;
  template: {
    name: string;
    questions: any[];
  };
  responses: Response[];
}

export default function SessionDetailPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const params = useParams();
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [authStatus, router]);

  useEffect(() => {
    if (session && params.id) {
      fetchSession();
    }
  }, [session, params.id]);

  const fetchSession = async () => {
    try {
      const response = await fetch(`/api/sessions/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setSessionData(data);
      }
    } catch (error) {
      console.error("Error fetching session:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    setUpdating(true);
    try {
      const response = await fetch(`/api/sessions/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        await fetchSession();
      } else {
        alert("Failed to update status");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred");
    } finally {
      setUpdating(false);
    }
  };

  const copyJoinLink = () => {
    const link = `${window.location.origin}/join?code=${sessionData?.code}`;
    navigator.clipboard.writeText(link);
    alert("Join link copied to clipboard!");
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

  if (authStatus === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!session || !sessionData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Session not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/admin/sessions" className="text-xl font-bold text-gray-800 hover:text-gray-600">
            ← Back to Sessions
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Session Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-4">
                {sessionData.template.name}
              </h1>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <div className="text-sm text-gray-600">Join Code</div>
                  <div className="text-4xl font-bold text-blue-600">
                    {sessionData.code}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Status</div>
                  <div className={`inline-block px-3 py-1 rounded text-sm font-semibold mt-2 ${getStatusColor(sessionData.status)}`}>
                    {sessionData.status.toUpperCase()}
                  </div>
                </div>
              </div>

              <button
                onClick={copyJoinLink}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-colors mb-4"
              >
                📋 Copy Join Link
              </button>

              <div className="text-sm text-gray-600 space-y-1">
                <div>Questions: {sessionData.template.questions.length}</div>
                <div>Responses: {sessionData.responses.length}</div>
                {sessionData.timeLimit && <div>Time Limit: {sessionData.timeLimit} minutes</div>}
                {sessionData.unlockTime && (
                  <div>Unlock Time: {new Date(sessionData.unlockTime).toLocaleString()}</div>
                )}
                <div>Created: {new Date(sessionData.createdAt).toLocaleString()}</div>
              </div>
            </div>

            {/* Responses */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Participant Responses
              </h2>

              {sessionData.responses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No responses yet. Share the join code with participants!
                </div>
              ) : (
                <div className="space-y-4">
                  {sessionData.responses.map((response) => {
                    const answers = JSON.parse(response.answers);
                    return (
                      <div
                        key={response.id}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-semibold text-gray-800">
                              {response.participantName}
                            </div>
                            {response.participantEmail && (
                              <div className="text-sm text-gray-600">
                                {response.participantEmail}
                              </div>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(response.submittedAt).toLocaleString()}
                          </div>
                        </div>

                        {response.timeSpent && (
                          <div className="text-sm text-gray-600 mb-2">
                            Time spent: {Math.floor(response.timeSpent / 60)}m {response.timeSpent % 60}s
                          </div>
                        )}

                        <div className="mt-3 space-y-2">
                          {sessionData.template.questions.map((question, idx) => (
                            <div key={question.id} className="text-sm">
                              <div className="font-medium text-gray-700">
                                Q{idx + 1}: {question.text}
                              </div>
                              <div className="text-gray-600 ml-4">
                                {answers[question.id] || "(No answer)"}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Session Controls
              </h2>

              <div className="space-y-3">
                {sessionData.status === "locked" && (
                  <button
                    onClick={() => updateStatus("unlocked")}
                    disabled={updating}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
                  >
                    🔓 Unlock Session
                  </button>
                )}

                {sessionData.status === "unlocked" && (
                  <button
                    onClick={() => updateStatus("locked")}
                    disabled={updating}
                    className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
                  >
                    🔒 Lock Session
                  </button>
                )}

                {sessionData.status !== "completed" && (
                  <button
                    onClick={() => updateStatus("completed")}
                    disabled={updating}
                    className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
                  >
                    ✓ Mark as Completed
                  </button>
                )}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">
                Quick Stats
              </h3>
              <div className="text-sm text-blue-800 space-y-1">
                <div>Total Participants: {sessionData.responses.length}</div>
                <div>
                  Avg Time: {
                    sessionData.responses.length > 0
                      ? Math.floor(
                          sessionData.responses
                            .filter(r => r.timeSpent)
                            .reduce((acc, r) => acc + (r.timeSpent || 0), 0) /
                          sessionData.responses.filter(r => r.timeSpent).length / 60
                        )
                      : 0
                  }m
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

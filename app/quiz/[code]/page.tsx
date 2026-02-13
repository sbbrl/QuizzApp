"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Question {
  id: string;
  text: string;
  type: string;
  options: string | null;
  required: boolean;
}

interface QuizData {
  id: string;
  code: string;
  status: string;
  unlockTime: string | null;
  timeLimit: number | null;
  template: {
    name: string;
    description: string;
    questions: Question[];
  };
}

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [participantName, setParticipantName] = useState("");
  const [participantEmail, setParticipantEmail] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [started, setStarted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  useEffect(() => {
    fetchQuiz();
    const interval = setInterval(fetchQuiz, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, [params.code]);

  useEffect(() => {
    if (started && quizData?.timeLimit) {
      const limit = quizData.timeLimit * 60; // Convert to seconds
      setTimeRemaining(limit);
    }
  }, [started, quizData]);

  useEffect(() => {
    if (timeRemaining !== null && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => (prev !== null ? prev - 1 : null));
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeRemaining === 0) {
      autoSubmit();
    }
  }, [timeRemaining]);

  const autoSubmit = async () => {
    // Check required questions
    const unanswered = quizData?.template.questions.filter(
      (q) => q.required && !answers[q.id]
    );

    if (unanswered && unanswered.length > 0) {
      alert(`Time's up! Please answer all required questions (${unanswered.length} remaining)`);
      return;
    }

    setSubmitting(true);
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);

    try {
      const response = await fetch("/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: quizData?.id,
          participantName,
          participantEmail: participantEmail || null,
          answers,
          timeSpent,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to submit quiz");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const fetchQuiz = async () => {
    try {
      const response = await fetch(`/api/quiz/${params.code}`);
      if (response.ok) {
        const data = await response.json();
        setQuizData(data);
      } else {
        alert("Quiz session not found");
        router.push("/join");
      }
    } catch (error) {
      console.error("Error fetching quiz:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = () => {
    if (!participantName.trim()) {
      alert("Please enter your name");
      return;
    }
    setStarted(true);
    setStartTime(Date.now());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check required questions
    const unanswered = quizData?.template.questions.filter(
      (q) => q.required && !answers[q.id]
    );

    if (unanswered && unanswered.length > 0) {
      alert(`Please answer all required questions (${unanswered.length} remaining)`);
      return;
    }

    setSubmitting(true);
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);

    try {
      const response = await fetch("/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: quizData?.id,
          participantName,
          participantEmail: participantEmail || null,
          answers,
          timeSpent,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to submit quiz");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getCountdown = () => {
    if (!quizData?.unlockTime) return null;
    const unlock = new Date(quizData.unlockTime);
    const now = new Date();
    const diff = Math.floor((unlock.getTime() - now.getTime()) / 1000);
    return diff > 0 ? diff : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 to-red-100 flex items-center justify-center">
        <div className="text-xl text-gray-800">Loading...</div>
      </div>
    );
  }

  if (!quizData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 to-red-100 flex items-center justify-center">
        <div className="text-xl text-gray-800">Quiz not found</div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 to-red-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-green-600 mb-4">
            Submitted Successfully!
          </h1>
          <p className="text-gray-600 mb-8">
            Thank you for completing the quiz, {participantName}!
          </p>
          <Link
            href="/"
            className="inline-block bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (quizData.status === "locked") {
    const countdown = getCountdown();
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 to-red-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-3xl font-bold text-red-600 mb-4">
            Quiz Locked
          </h1>
          <p className="text-gray-600 mb-4">
            This quiz session is currently locked.
          </p>
          {countdown !== null && countdown > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600 mb-2">Unlocks in:</p>
              <p className="text-3xl font-bold text-blue-600">
                {formatTime(countdown)}
              </p>
            </div>
          )}
          <p className="text-sm text-gray-500">
            Checking every 30 seconds...
          </p>
          <Link
            href="/join"
            className="inline-block mt-6 text-red-500 hover:text-red-600"
          >
            ← Back to Join
          </Link>
        </div>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 to-red-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
          <h1 className="text-3xl font-bold text-red-600 mb-2 text-center">
            {quizData.template.name}
          </h1>
          {quizData.template.description && (
            <p className="text-gray-600 text-center mb-6">
              {quizData.template.description}
            </p>
          )}

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Name *
              </label>
              <input
                type="text"
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email (Optional)
              </label>
              <input
                type="email"
                value={participantEmail}
                onChange={(e) => setParticipantEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900"
                placeholder="your@email.com"
              />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">Quiz Info</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>Questions: {quizData.template.questions.length}</li>
              {quizData.timeLimit && (
                <li>Time Limit: {quizData.timeLimit} minutes</li>
              )}
              <li>
                Required Questions:{" "}
                {quizData.template.questions.filter((q) => q.required).length}
              </li>
            </ul>
          </div>

          <button
            onClick={handleStart}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition-colors text-xl"
          >
            Start Quiz →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-red-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              {quizData.template.name}
            </h1>
            {timeRemaining !== null && (
              <div className={`text-xl font-bold ${timeRemaining < 60 ? "text-red-600" : "text-blue-600"}`}>
                ⏱️ {formatTime(timeRemaining)}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {quizData.template.questions.map((question, index) => {
              const options = question.options ? JSON.parse(question.options) : [];
              
              return (
                <div
                  key={question.id}
                  className="border border-gray-200 rounded-lg p-6"
                >
                  <label className="block text-lg font-medium text-gray-800 mb-3">
                    {index + 1}. {question.text}
                    {question.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </label>

                  {question.type === "text" && (
                    <textarea
                      value={answers[question.id] || ""}
                      onChange={(e) =>
                        setAnswers({ ...answers, [question.id]: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900"
                      rows={3}
                      required={question.required}
                    />
                  )}

                  {question.type === "dropdown" && (
                    <select
                      value={answers[question.id] || ""}
                      onChange={(e) =>
                        setAnswers({ ...answers, [question.id]: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900"
                      required={question.required}
                    >
                      <option value="">Select an option...</option>
                      {options.map((option: string, idx: number) => (
                        <option key={idx} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  )}

                  {question.type === "radio" && (
                    <div className="space-y-2">
                      {options.map((option: string, idx: number) => (
                        <label
                          key={idx}
                          className="flex items-center space-x-3 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name={question.id}
                            value={option}
                            checked={answers[question.id] === option}
                            onChange={(e) =>
                              setAnswers({
                                ...answers,
                                [question.id]: e.target.value,
                              })
                            }
                            className="h-4 w-4 text-red-600 focus:ring-red-500"
                            required={question.required}
                          />
                          <span className="text-gray-900">{option}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-lg transition-colors disabled:opacity-50 text-xl"
            >
              {submitting ? "Submitting..." : "Submit Quiz ✓"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Question {
  id: string;
  text: string;
  type: "text" | "dropdown" | "radio";
  options?: string[];
  required: boolean;
}

export default function CreateTemplatePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [status, router]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: Date.now().toString(),
        text: "",
        type: "text",
        required: false,
      },
    ]);
  };

  const updateQuestion = (id: string, field: string, value: any) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, [field]: value } : q))
    );
  };

  const moveQuestion = (index: number, direction: "up" | "down") => {
    const newQuestions = [...questions];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    
    if (newIndex >= 0 && newIndex < questions.length) {
      [newQuestions[index], newQuestions[newIndex]] = [
        newQuestions[newIndex],
        newQuestions[index],
      ];
      setQuestions(newQuestions);
    }
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const exportTemplate = () => {
    const templateData = {
      name,
      description,
      questions: questions.map((q, index) => ({
        text: q.text,
        type: q.type,
        options: q.options || [],
        required: q.required,
        position: index + 1,
      })),
      _format: {
        version: "1.0",
        description: "QuizzApp Template Format",
        questionTypes: ["text", "dropdown", "radio"],
        notes: "Position field indicates the order of questions in the quiz (starting from 1)"
      }
    };

    const jsonString = JSON.stringify(templateData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${name || "template"}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importTemplate = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const templateData = JSON.parse(content);

        if (!templateData.questions || !Array.isArray(templateData.questions)) {
          alert("Invalid template format: missing questions array");
          return;
        }

        setName(templateData.name || "");
        setDescription(templateData.description || "");
        
        // Sort by position if available, otherwise use array order
        const sortedQuestions = [...templateData.questions].sort((a, b) => {
          const posA = a.position || 0;
          const posB = b.position || 0;
          return posA - posB;
        });

        const importedQuestions = sortedQuestions.map((q: any) => ({
          id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
          text: q.text || "",
          type: q.type || "text",
          options: q.options || [],
          required: q.required || false,
        }));

        setQuestions(importedQuestions);
        alert("Template imported successfully!");
      } catch (error) {
        console.error("Import error:", error);
        alert("Failed to import template. Please check the JSON format.");
      }
    };
    reader.readAsText(file);
    // Reset the input so the same file can be imported again if needed
    event.target.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (questions.length === 0) {
      alert("Please add at least one question");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          questions: questions.map((q) => ({
            text: q.text,
            type: q.type,
            options: q.options,
            required: q.required,
          })),
        }),
      });

      if (response.ok) {
        router.push("/admin/templates");
      } else {
        alert("Failed to create template");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred");
    } finally {
      setSaving(false);
    }
  };

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
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/admin/templates" className="text-xl font-bold text-gray-800 hover:text-gray-600">
            ← Back to Templates
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Create Quiz Template
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Template Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  required
                  placeholder="e.g., Gottman Relationship Quiz"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  rows={3}
                  placeholder="Brief description of the quiz"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Questions</h2>
              <div className="flex gap-2">
                <label className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded transition-colors cursor-pointer">
                  📥 Import JSON
                  <input
                    type="file"
                    accept=".json"
                    onChange={importTemplate}
                    className="hidden"
                  />
                </label>
                <button
                  type="button"
                  onClick={exportTemplate}
                  disabled={questions.length === 0 && !name}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title={questions.length === 0 && !name ? "Add questions or template name to export" : "Export template as JSON"}
                >
                  📤 Export JSON
                </button>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition-colors"
                >
                  + Add Question
                </button>
              </div>
            </div>

            {questions.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <p className="text-gray-600">
                  No questions yet. Click "Add Question" to get started.
                </p>
              </div>
            ) : (
              questions.map((question, index) => (
                <div
                  key={question.id}
                  className="bg-white rounded-lg shadow-md p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Question {index + 1}
                    </h3>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => moveQuestion(index, "up")}
                        disabled={index === 0}
                        className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Move Up"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => moveQuestion(index, "down")}
                        disabled={index === questions.length - 1}
                        className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Move Down"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => removeQuestion(question.id)}
                        className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded"
                        title="Remove"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Question Text *
                      </label>
                      <input
                        type="text"
                        value={question.text}
                        onChange={(e) =>
                          updateQuestion(question.id, "text", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        required
                        placeholder="Enter your question"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Question Type
                      </label>
                      <select
                        value={question.type}
                        onChange={(e) =>
                          updateQuestion(question.id, "type", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      >
                        <option value="" disabled className="text-gray-500">
                          Format: type: "text" | "radio" | "dropdown"
                        </option>
                        <option value="text">Text Answer</option>
                        <option value="radio">Multiple Choice (Radio)</option>
                        <option value="dropdown">Dropdown</option>
                      </select>
                    </div>

                    {(question.type === "radio" || question.type === "dropdown") && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Options (one per line)
                        </label>
                        <textarea
                          value={question.options?.join("\n") || ""}
                          onChange={(e) =>
                            updateQuestion(
                              question.id,
                              "options",
                              e.target.value.split("\n").filter((o) => o.trim())
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                          rows={4}
                          placeholder="Option 1&#10;Option 2&#10;Option 3"
                        />
                      </div>
                    )}

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`required-${question.id}`}
                        checked={question.required}
                        onChange={(e) =>
                          updateQuestion(question.id, "required", e.target.checked)
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor={`required-${question.id}`}
                        className="ml-2 block text-sm text-gray-700"
                      >
                        Required question
                      </label>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Template"}
            </button>
            <Link
              href="/admin/templates"
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-6 rounded-lg text-center transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}

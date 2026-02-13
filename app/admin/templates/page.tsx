"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Template {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  questions?: Array<{
    text: string;
    type: string;
    options: string | null;
    required: boolean;
    order: number;
  }>;
  _count: {
    sessions: number;
  };
}

export default function TemplatesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchTemplates();
    }
  }, [session]);

  const fetchTemplates = async () => {
    try {
      const response = await fetch("/api/templates");
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportTemplate = async (templateId: string, templateName: string) => {
    try {
      const response = await fetch(`/api/templates/${templateId}`);
      if (!response.ok) {
        alert("Failed to fetch template details");
        return;
      }

      const template = await response.json();
      
      const exportData = {
        name: template.name,
        description: template.description,
        questions: template.questions
          .sort((a: any, b: any) => a.order - b.order)
          .map((q: any, index: number) => ({
            text: q.text,
            type: q.type,
            options: q.options ? JSON.parse(q.options) : [],
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

      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${templateName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export template");
    }
  };

  const importTemplate = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const templateData = JSON.parse(content);

        if (!templateData.questions || !Array.isArray(templateData.questions)) {
          alert("Invalid template format: missing questions array");
          return;
        }

        // Sort by position if available
        const sortedQuestions = [...templateData.questions].sort((a, b) => {
          const posA = a.position || 0;
          const posB = b.position || 0;
          return posA - posB;
        });

        const response = await fetch("/api/templates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: templateData.name,
            description: templateData.description || "",
            questions: sortedQuestions.map((q: any) => ({
              text: q.text,
              type: q.type,
              options: q.options || [],
              required: q.required || false,
            })),
          }),
        });

        if (response.ok) {
          alert("Template imported successfully!");
          fetchTemplates();
        } else {
          alert("Failed to import template");
        }
      } catch (error) {
        console.error("Import error:", error);
        alert("Failed to import template. Please check the JSON format.");
      }
    };
    reader.readAsText(file);
    // Reset the input
    event.target.value = "";
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
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Quiz Templates</h1>
          <div className="flex gap-2">
            <label className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-lg transition-colors cursor-pointer">
              📥 Import Template
              <input
                type="file"
                accept=".json"
                onChange={importTemplate}
                className="hidden"
              />
            </label>
            <Link
              href="/admin/templates/create"
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              + Create New Template
            </Link>
          </div>
        </div>

        {templates.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No templates yet</h2>
            <p className="text-gray-600 mb-6">
              Create your first quiz template to get started!
            </p>
            <Link
              href="/admin/templates/create"
              className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Create Template
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <div
                key={template.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow"
              >
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {template.name}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {template.description || "No description"}
                </p>
                <div className="text-sm text-gray-500 mb-4">
                  Used in {template._count.sessions} session(s)
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/admin/templates/${template.id}`}
                    className="flex-1 bg-gray-800 hover:bg-gray-900 text-white font-bold py-2 px-4 rounded text-center transition-colors"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => exportTemplate(template.id, template.name)}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors"
                    title="Export as JSON"
                  >
                    📤
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

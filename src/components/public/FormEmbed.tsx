// components/public/FormEmbed.tsx
"use client";

import { useEffect, useState } from "react";

interface FormField {
  id:          string;
  type:        string;
  name:        string;
  label:       string;
  required:    boolean;
  placeholder?: string;
  options?:    string[];
  message?:    string;
}

interface PublicForm {
  id:                  number;
  slug:                string;
  fields:              FormField[];
  submitButtonLabel:   string;
  confirmationType:    string;
  confirmationMessage: string;
  redirectUrl:         string;
}

export function FormEmbed({ slug }: { slug: string }) {
  const [form, setForm]       = useState<PublicForm | null>(null);
  const [values, setValues]   = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError]     = useState("");

  useEffect(() => {
    fetch(`/api/form/slug/${slug}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setForm(d.data);
      });
  }, [slug]);

  if (!form) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res  = await fetch(`/api/form/submit/${slug}`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(values),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Submission failed");
        return;
      }

      if (data.data.confirmationType === "redirect" && data.data.redirectUrl) {
        window.location.href = data.data.redirectUrl;
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Network error — please try again");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="p-6 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
        {form.confirmationMessage || "Thank you for your submission!"}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {form.fields.map((field) => {
        if (field.type === "message") {
          return (
            <p key={field.id} className="text-sm text-gray-600">
              {field.message}
            </p>
          );
        }

        return (
          <div key={field.id}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>

            {field.type === "textarea" ? (
              <textarea
                name={field.name}
                required={field.required}
                placeholder={field.placeholder}
                rows={4}
                value={values[field.name] || ""}
                onChange={(e) =>
                  setValues({ ...values, [field.name]: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : field.type === "select" ? (
              <select
                name={field.name}
                required={field.required}
                value={values[field.name] || ""}
                onChange={(e) =>
                  setValues({ ...values, [field.name]: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select an option</option>
                {field.options?.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : field.type === "checkbox" ? (
              <input
                type="checkbox"
                name={field.name}
                checked={values[field.name] === "true"}
                onChange={(e) =>
                  setValues({
                    ...values,
                    [field.name]: e.target.checked ? "true" : "false",
                  })
                }
                className="rounded"
              />
            ) : (
              <input
                type={field.type}
                name={field.name}
                required={field.required}
                placeholder={field.placeholder}
                value={values[field.name] || ""}
                onChange={(e) =>
                  setValues({ ...values, [field.name]: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>
        );
      })}

      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Submitting..." : form.submitButtonLabel || "Submit"}
      </button>
    </form>
  );
}
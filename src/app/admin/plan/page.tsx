"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Check, 
  Plus, 
  X, 
  Star, 
  Loader2, 
  ChevronUp, 
  ChevronDown,
  GripVertical 
} from "lucide-react";

type BillingCycle = "MONTHLY" | "YEARLY" | "LIFETIME";

interface Feature {
  id: string;
  title: string;
  sortOrder?: number;
}

interface Plan {
  id: string;
  title: string;
  tagline: string;
  trialDays: number | null;
  description: string;
  price: number;
  billingCycle: BillingCycle;
  isFeatured: boolean;
  sortOrder: number;
  features: Feature[];
}

function formatUSD(val: number) {
  if (!val) return "Free";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(val);
}

function cycleLabel(cycle: BillingCycle) {
  if (cycle === "LIFETIME") return "one-time";
  if (cycle === "MONTHLY") return "/month";
  return "/year";
}

const emptyDraft = {
  title: "",
  tagline: "",
  description: "",
  price: "0",
  billingCycle: "MONTHLY" as BillingCycle,
  isFeatured: false,
  trialDays: "",
  sortOrder: "0",
};

export default function PlanManagementPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [draft, setDraft] = useState(emptyDraft);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [featureInput, setFeatureInput] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);

  const loadPlans = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/plans");
      if (!res.ok) throw new Error("Failed to load plans");
      const data = await res.json();
      // Sort plans by sortOrder
      const sortedPlans = (data.data ?? []).sort((a: Plan, b: Plan) => 
        (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
      );
      setPlans(sortedPlans);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  function addFeature() {
    const title = featureInput.trim();
    if (!title) return;
    setFeatures((prev) => [...prev, { id: crypto.randomUUID(), title }]);
    setFeatureInput("");
  }

  function removeFeature(id: string) {
    setFeatures((prev) => prev.filter((f) => f.id !== id));
  }

  function moveFeatureUp(index: number) {
    if (index === 0) return;
    const newFeatures = [...features];
    [newFeatures[index], newFeatures[index - 1]] = [newFeatures[index - 1], newFeatures[index]];
    setFeatures(newFeatures);
  }

  function moveFeatureDown(index: number) {
    if (index === features.length - 1) return;
    const newFeatures = [...features];
    [newFeatures[index], newFeatures[index + 1]] = [newFeatures[index + 1], newFeatures[index]];
    setFeatures(newFeatures);
  }

  // Move plan up in the list
  function movePlanUp(index: number) {
    if (index === 0) return;
    const newPlans = [...plans];
    [newPlans[index], newPlans[index - 1]] = [newPlans[index - 1], newPlans[index]];
    setPlans(newPlans);
    updateSortOrders(newPlans);
  }

  // Move plan down in the list
  function movePlanDown(index: number) {
    if (index === plans.length - 1) return;
    const newPlans = [...plans];
    [newPlans[index], newPlans[index + 1]] = [newPlans[index + 1], newPlans[index]];
    setPlans(newPlans);
    updateSortOrders(newPlans);
  }

  // Update sort orders in the database
  async function updateSortOrders(updatedPlans: Plan[]) {
    setReordering(true);
    try {
      // Update each plan's sortOrder
      for (let i = 0; i < updatedPlans.length; i++) {
        await fetch(`/api/plans/${updatedPlans[i].id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sortOrder: i + 1 }),
        });
      }
      // Reload plans to ensure consistency
      await loadPlans();
    } catch (err) {
      console.error("Failed to update sort orders:", err);
      setError("Failed to reorder plans. Please try again.");
    } finally {
      setReordering(false);
    }
  }

  function resetForm() {
    setDraft(emptyDraft);
    setFeatures([]);
    setEditingId(null);
  }

  async function handleSave() {
    if (!draft.title.trim()) return;
    setSaving(true);
    setError(null);

    const payload = {
      title: draft.title,
      tagline: draft.tagline,
      slug: draft.title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-"),
      description: draft.description,
      sortOrder: Number(draft.sortOrder) || (plans.length + 1),
      price: Number(draft.price) || 0,
      billingCycle: draft.billingCycle,
      isFeatured: draft.isFeatured,
      trialDays: draft.trialDays === "" ? null : Number(draft.trialDays),
      features: features.map((f, i) => ({ title: f.title, sortOrder: i })),
    };

    try {
      const res = await fetch(
        editingId ? `/api/plans/${editingId}` : "/api/plans",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to save plan");
      }

      await loadPlans();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(plan: Plan) {
    setDraft({
      title: plan.title,
      tagline: plan.tagline,
      description: plan.description,
      price: String(plan.price),
      billingCycle: plan.billingCycle,
      isFeatured: plan.isFeatured,
      sortOrder: String(plan.sortOrder ?? 0),
      trialDays: plan.trialDays?.toString() ?? "",
    });
    setFeatures(plan.features);
    setEditingId(plan.id);
  }

  async function handleDelete(id: string) {
    setError(null);
    try {
      const res = await fetch(`/api/plans/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to delete plan");
      }
      await loadPlans();
      if (editingId === id) resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ── Form ───────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 h-fit">
          <h1 className="text-xl font-semibold text-gray-900 mb-6">
            {editingId ? "Edit Plan" : "Create Plan"}
          </h1>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plan Title
              </label>
              <input
                value={draft.title}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, title: e.target.value }))
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                placeholder="Pro Plan"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tagline
              </label>
              <input
                value={draft.tagline}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, tagline: e.target.value }))
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                placeholder="For growing teams"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={draft.description}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, description: e.target.value }))
                }
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                placeholder="For growing teams"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price ($)
                </label>
                <input
                  type="number"
                  value={draft.price}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, price: e.target.value }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Billing Cycle
                </label>
                <select
                  value={draft.billingCycle}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      billingCycle: e.target.value as BillingCycle,
                    }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="MONTHLY">Monthly</option>
                  <option value="YEARLY">Yearly</option>
                  <option value="LIFETIME">Lifetime</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trial Days{" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="number"
                  value={draft.trialDays}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, trialDays: e.target.value }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="Uses global default"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={draft.isFeatured}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, isFeatured: e.target.checked }))
                }
              />
              Mark as Featured / Most Popular
            </label>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Features
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addFeature())
                  }
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="Unlimited projects"
                />
                <button
                  onClick={addFeature}
                  className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-1.5">
                {features.map((f, index) => (
                  <div
                    key={f.id}
                    className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-1.5"
                  >
                    <span className="text-sm text-gray-700">{f.title}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => moveFeatureUp(index)}
                        disabled={index === 0}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => moveFeatureDown(index)}
                        disabled={index === features.length - 1}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => removeFeature(f.id)}>
                        <X className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingId ? "Update Plan" : "Save Plan"}
              </button>
              {editingId && (
                <button
                  onClick={resetForm}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          {/* Existing plans list with Move Up/Down buttons */}
          <div className="mt-8 border-t border-gray-100 pt-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-700">
                Existing Plans {!loading && `(${plans.length})`}
              </p>
              {reordering && (
                <span className="text-xs text-blue-600 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Reordering...
                </span>
              )}
            </div>
            {loading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
              </div>
            ) : plans.length === 0 ? (
              <p className="text-sm text-gray-400">No plans yet</p>
            ) : (
              <div className="space-y-2">
                {plans.map((p, index) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 border border-gray-100 hover:border-gray-200 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {/* Drag handle (visual only) */}
                      <GripVertical className="w-4 h-4 text-gray-300" />
                      <div>
                        <span className="text-sm font-medium text-gray-900">
                          {p.title}
                        </span>
                        <span className="text-xs text-gray-500 ml-2">
                          {formatUSD(p.price)} {cycleLabel(p.billingCycle)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {/* Move Up Button */}
                      <button
                        onClick={() => movePlanUp(index)}
                        disabled={index === 0 || reordering}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move up"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      
                      {/* Move Down Button */}
                      <button
                        onClick={() => movePlanDown(index)}
                        disabled={index === plans.length - 1 || reordering}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move down"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>

                      {/* Order indicator */}
                      <span className="text-xs text-gray-400 mx-1">
                        #{index + 1}
                      </span>

                      <div className="w-px h-6 bg-gray-200 mx-1" />
                      
                      <button
                        onClick={() => handleEdit(p)}
                        className="text-xs text-blue-600 hover:underline px-2 py-1"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="text-xs text-red-600 hover:underline px-2 py-1"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Live Preview ───────────────────────────────────── */}
        <div>
          <p className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">
            Live Preview
          </p>
          <div
            className={`relative w-full max-w-sm rounded-xl border bg-white overflow-hidden ${
              draft.isFeatured
                ? "border-blue-500 shadow-md ring-2 ring-blue-100"
                : "border-gray-200 shadow-sm"
            }`}
          >
            {draft.isFeatured && (
              <div className="absolute top-3 left-3 z-10">
                <span className="inline-flex items-center gap-1 bg-blue-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                  <Star className="w-3 h-3" />
                  Most Popular
                </span>
              </div>
            )}

            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {draft.title || "Plan title"}
              </h3>

              <p className="text-sm text-blue-600 font-medium mb-3">
                {draft.tagline || "Plan tagline"}
              </p>

              <div className="mb-6">
                <span className="text-3xl font-bold text-gray-900">
                  {formatUSD(Number(draft.price) || 0)}
                </span>
                <span className="text-sm text-gray-500 ml-1">
                  {cycleLabel(draft.billingCycle)}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                {draft.description || "Plan description goes here"}
              </p>

              <button
                className={`w-full py-2.5 rounded-lg text-sm font-semibold mb-6 ${
                  draft.isFeatured
                    ? "bg-blue-600 text-white"
                    : "border border-gray-300 text-gray-800"
                }`}
              >
                Get Started
              </button>

              <div className="space-y-1.5">
                {features.length === 0 && (
                  <p className="text-sm text-gray-400 italic">
                    No features added yet
                  </p>
                )}
                {features.map((f) => (
                  <div key={f.id} className="flex items-start gap-2">
                    <div className="flex-shrink-0 h-4 w-4 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                      <Check className="h-2.5 w-2.5 text-blue-600" />
                    </div>
                    <span className="text-sm text-gray-700">{f.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
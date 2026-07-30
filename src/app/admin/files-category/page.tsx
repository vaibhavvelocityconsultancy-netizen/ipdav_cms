"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiMutations } from "@/src/lib/apimutation";
import { fetchers } from "@/src/lib/fetchers";
// import { apiMutations } from "@/src/lib/apiMutations";

type FileCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  parent?: { id: string; name: string } | null;
  _count?: { files: number; children: number } | null;
};

type FileCategoryTreeNode = FileCategory & {
  children: FileCategoryTreeNode[];
};

type CategoryOption = {
  id: string;
  label: string;
};

type CategoryFormPayload = {
  name: string;
  slug?: string;
  description: string | null;
  parentId: string | null;
};

type CategoryFormProps = {
  initial?: FileCategory | null;
  parentOptions: CategoryOption[];
  onSubmit: (payload: CategoryFormPayload) => void;
  onCancel: () => void;
  isSaving: boolean;
};

type CategoryRowProps = {
  node: FileCategoryTreeNode;
  depth: number;
  onEdit: (cat: FileCategoryTreeNode) => void;
  onDelete: (cat: FileCategoryTreeNode) => void;
  deletingId: string | null;
  isFetchingCategory: boolean;
};

// ─────────────────────────────────────────────────────────────
// Small helpers
// ─────────────────────────────────────────────────────────────

function buildTree(categories: FileCategory[]): FileCategoryTreeNode[] {
  const map = new Map<string, FileCategoryTreeNode>(
    categories.map((c) => [c.id, { ...c, children: [] }]),
  );
  const roots: FileCategoryTreeNode[] = [];

  for (const cat of map.values()) {
    if (cat.parentId && map.has(cat.parentId)) {
      const parent = map.get(cat.parentId);
      if (parent) {
        parent.children.push(cat);
      } else {
        roots.push(cat);
      }
    } else {
      roots.push(cat);
    }
  }
  return roots;
}

function flattenForSelect(
  nodes: FileCategoryTreeNode[],
  depth = 0,
  excludeId: string | null = null,
  out: CategoryOption[] = [],
): CategoryOption[] {
  for (const node of nodes) {
    if (node.id !== excludeId) {
      out.push({ id: node.id, label: `${"— ".repeat(depth)}${node.name}` });
    }
    flattenForSelect(node.children, depth + 1, excludeId, out);
  }
  return out;
}

// ─────────────────────────────────────────────────────────────
// Category form (create / edit)
// ─────────────────────────────────────────────────────────────

function CategoryForm({
  initial,
  parentOptions,
  onSubmit,
  onCancel,
  isSaving,
}: CategoryFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [parentId, setParentId] = useState(initial?.parentId ?? "");
  const [error, setError] = useState("");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    onSubmit({
      name: name.trim(),
      slug: slug.trim() || undefined,
      description: description.trim() || null,
      parentId: parentId || null,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-lg border border-gray-200 bg-white p-4"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Invoices"
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Slug</label>
        <input
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="invoices"
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Parent category <span className="text-gray-400">(optional)</span>
        </label>
        <select
          value={parentId}
          onChange={(e) => setParentId(e.target.value)}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">— None (top level) —</option>
          {parentOptions.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Description <span className="text-gray-400">(optional)</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isSaving
            ? "Saving..."
            : initial
              ? "Save changes"
              : "Create category"}
        </button>
      </div>
    </form>
  );
}

// ─────────────────────────────────────────────────────────────
// Tree row (recursive)
// ─────────────────────────────────────────────────────────────

function CategoryRow({
  node,
  depth,
  onEdit,
  onDelete,
  deletingId,
  isFetchingCategory,
}: CategoryRowProps) {
  // const [isFetchingCategory, setIsFetchingCategory] = useState(false);
  return (
    <>
      <tr className="border-b border-gray-100 last:border-0">
        <td
          className="py-2 pl-2 pr-4 text-sm text-gray-800"
          style={{ paddingLeft: `${depth * 20 + 8}px` }}
        >
          {depth > 0 && <span className="mr-1 text-gray-300">└</span>}
          {node.name}
        </td>
        <td className="py-2 px-4 text-sm text-gray-500">{node.slug}</td>
        <td className="py-2 px-4 text-sm text-gray-500">
          {node._count?.files ?? 0}
        </td>
        <td className="py-2 px-4 text-sm text-gray-500">
          {node._count?.children ?? 0}
        </td>
        <td className="py-2 px-4 text-right">
          <button
            onClick={() => onEdit(node)}
            disabled={isFetchingCategory}
            className="mr-3 text-sm font-medium text-blue-600 hover:underline disabled:opacity-50"
          >
            {isFetchingCategory ? "Loading..." : "Edit"}
          </button>
          <button
            onClick={() => onDelete(node)}
            disabled={deletingId === node.id}
            className="text-sm font-medium text-red-600 hover:underline disabled:opacity-50"
          >
            {deletingId === node.id ? "Deleting..." : "Delete"}
          </button>
        </td>
      </tr>
      {node.children.map((child) => (
        <CategoryRow
          key={child.id}
          node={child}
          depth={depth + 1}
          onEdit={onEdit}
          onDelete={onDelete}
          deletingId={deletingId}
          isFetchingCategory={isFetchingCategory}
        />
      ))}
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────

export default function FileCategoryManager() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<FileCategoryTreeNode | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [isFetchingCategory, setIsFetchingCategory] = useState(false);

  const { data, isLoading, isError } = useQuery<FileCategory[]>({
    queryKey: ["fileCategories"],
    queryFn: async () => {
      const res = await fetchers.fileCategories();
      return res.data as FileCategory[];
    },
  });

  const categories = data ?? [];
  const tree = useMemo(() => buildTree(categories), [categories]);

  const createMutation = useMutation({
    mutationFn: (payload: CategoryFormPayload) =>
      apiMutations.createFileCategory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fileCategories"] });
      setShowForm(false);
    },
    onError: (err: unknown) => {
      if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError("Something went wrong");
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: CategoryFormPayload;
    }) => apiMutations.updateFileCategory(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fileCategories"] });
      setEditingCategory(null);
    },
    onError: (err: unknown) => {
      if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError("Something went wrong");
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiMutations.deleteFileCategory(id),
    onMutate: (id: string) => setDeletingId(id),
    onSettled: () => setDeletingId(null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fileCategories"] });
    },
    onError: (err: unknown) => {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert("Something went wrong");
      }
    },
  });

  async function handleEdit(node: FileCategoryTreeNode) {
    setIsFetchingCategory(true);
    setFormError("");
    try {
      const res = await fetchers.fileCategory(node.id);
      setEditingCategory(res.data as FileCategoryTreeNode); // ✅ unwrap .data
      setShowForm(false);
    } catch (err) {
      if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError("Failed to load category details");
      }
    } finally {
      setIsFetchingCategory(false);
    }
  }

  function handleDelete(node: FileCategoryTreeNode) {
    if (!confirm(`Delete "${node.name}"? This cannot be undone.`)) return;
    deleteMutation.mutate(node.id);
  }

  function handleCreate(payload: CategoryFormPayload) {
    setFormError("");
    createMutation.mutate(payload);
  }

  function handleUpdate(payload: CategoryFormPayload) {
    setFormError("");
    if (!editingCategory) return;
    updateMutation.mutate({ id: editingCategory.id, payload });
  }

  const parentOptionsForCreate = useMemo(() => flattenForSelect(tree), [tree]);
  const parentOptionsForEdit = useMemo(
    () =>
      editingCategory ? flattenForSelect(tree, 0, editingCategory.id) : [],
    [tree, editingCategory],
  );

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">
            File categories
          </h1>
          <p className="text-sm text-gray-500">
            Organize uploaded files into categories and subcategories.
          </p>
        </div>
        {!showForm && !editingCategory && (
          <button
            onClick={() => setShowForm(true)}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            + New category
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-6">
          {formError && (
            <p className="mb-2 text-sm text-red-600">{formError}</p>
          )}
          <CategoryForm
            parentOptions={parentOptionsForCreate}
            onSubmit={handleCreate}
            onCancel={() => {
              setShowForm(false);
              setFormError("");
            }}
            isSaving={createMutation.isPending}
          />
        </div>
      )}

      {editingCategory && (
        <div className="mb-6">
          {formError && (
            <p className="mb-2 text-sm text-red-600">{formError}</p>
          )}
          <CategoryForm
            initial={editingCategory}
            parentOptions={parentOptionsForEdit}
            onSubmit={handleUpdate}
            onCancel={() => {
              setEditingCategory(null);
              setFormError("");
            }}
            isSaving={updateMutation.isPending}
          />
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-gray-200">
        {isLoading ? (
          <p className="p-6 text-sm text-gray-500">Loading categories...</p>
        ) : isError ? (
          <p className="p-6 text-sm text-red-600">Failed to load categories.</p>
        ) : tree.length === 0 ? (
          <p className="p-6 text-sm text-gray-500">
            No categories yet — create your first one above.
          </p>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-2 pl-2 pr-4 text-xs font-semibold uppercase text-gray-500">
                  Name
                </th>
                <th className="py-2 px-4 text-xs font-semibold uppercase text-gray-500">
                  Slug
                </th>
                <th className="py-2 px-4 text-xs font-semibold uppercase text-gray-500">
                  Files
                </th>
                <th className="py-2 px-4 text-xs font-semibold uppercase text-gray-500">
                  Subcategories
                </th>
                <th className="py-2 px-4 text-xs font-semibold uppercase text-gray-500 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {tree.map((node: any) => (
                <CategoryRow
                  key={node.id}
                  node={node}
                  depth={0}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  deletingId={deletingId}
                  isFetchingCategory={false}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

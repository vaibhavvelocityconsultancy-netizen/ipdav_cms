// CourseContentTab.tsx
import { useEffect, useState } from "react";
import useSWR from "swr";
import ContentHeader from "./ContentHeader";
import ModuleList from "./ModuleList";
import AddModuleButton from "./AddModuleButton";
import { fetchers } from "@/src/lib/fetchers";
import { apiMutations } from "@/src/lib/apimutation";
// import AddModuleButton from "./AddModuleButton";

export interface CourseVideo {
  id?: string | number;
  title: string;
  videoType: "URL" | "FILE";
  videoUrl: string;
  videoFile?: File | null;
  durationMinutes: number;
  sortOrder: number;
}

interface CourseContentTabProps {
  courseId: string;
}


export default function CourseContentTab({ courseId }: CourseContentTabProps) {
  const [modules, setModules] = useState<CourseVideo[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // TODO: Replace with real API call
  const { data, isLoading, error, mutate } = useSWR(
    courseId ? `course-content-${courseId}` : null,
    async () => {
      const res = await fetchers.getCoursecontentByID(courseId);
      return res.data.modules || [];
    },
  );
  // Initialize modules from fetched data
  useEffect(() => {
    if (data) {
      setModules(data);
    }
  }, [data]);

  const saveModules = async (updatedModules: CourseVideo[]) => {
    try {
      setModules(updatedModules);

      await apiMutations.updateModules(courseId, updatedModules);

      await mutate();
    } catch (error) {
      console.error(error);
    }
  };
  // TODO: Wire to API
  const addModule = (moduleData: Omit<CourseVideo, "id" | "sortOrder">) => {
    const updatedModules = [
      ...modules,
      {
        ...moduleData,
        sortOrder: modules.length,
      },
    ];

    saveModules(updatedModules);
    setShowAddForm(false);
  };

  // TODO: Wire to API
  const updateModule = (id: string, updatedData: Partial<CourseVideo>) => {
    const updatedModules = modules.map((mod) =>
      mod.id === id ? { ...mod, ...updatedData } : mod,
    );

    saveModules(updatedModules);
    setEditingId(null);
  };
  // TODO: Wire to API
  const deleteModule = (id: string) => {
    const updatedModules = modules
      .filter((mod) => mod.id !== id)
      .map((mod, idx) => ({
        ...mod,
        sortOrder: idx,
      }));

    saveModules(updatedModules);
    if (editingId === id) setEditingId(null);
  };

  // TODO: Wire to API
  const reorderModule = (id: string, direction: "up" | "down") => {
    const index = modules.findIndex((mod) => mod.id === id);
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === modules.length - 1)
    ) {
      return;
    }

    const newModules = [...modules];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    [newModules[index], newModules[swapIndex]] = [
      newModules[swapIndex],
      newModules[index],
    ];

    // Update sortOrder to match new positions
    newModules.forEach((mod, idx) => {
      mod.sortOrder = idx;
    });

    saveModules(newModules);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-sm text-muted-foreground">Loading content...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-sm text-destructive">Failed to load content</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ContentHeader count={modules.length} />

      <div className="space-y-4">
        <ModuleList
          modules={modules}
          editingId={editingId}
          onEdit={setEditingId}
          onUpdate={updateModule}
          onDelete={deleteModule}
          onReorder={reorderModule}
        />

        {!showAddForm ? (
          <AddModuleButton onClick={() => setShowAddForm(true)} />
        ) : (
          <AddModuleButton
            isAdding
            onAdd={addModule}
            onCancel={() => setShowAddForm(false)}
          />
        )}
      </div>
    </div>
  );
}

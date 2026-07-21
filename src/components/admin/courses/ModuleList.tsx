// ModuleList.tsx
// import { Card } from "@/components/ui/card";
import ModuleRow from "./ModuleRow";
import EmptyState from "./EmptyState";
import { CourseVideo } from "./CourseContentTab";
import { Card } from "@/src/ui/card";

interface ModuleListProps {
  modules: CourseVideo[];
  editingId: string | null;
  onEdit: (id: string) => void;
  onUpdate: (id: string, data: Partial<CourseVideo>) => void;
  onDelete: (id: string) => void;
  onReorder: (id: string, direction: "up" | "down") => void;
}

export default function ModuleList({
  modules,
  editingId,
  onEdit,
  onUpdate,
  onDelete,
  onReorder,
}: ModuleListProps) {
  if (modules.length === 0) {
    return <EmptyState />;
  }

  return (
    <Card className="overflow-hidden">
      <div className="divide-y">
        {modules.map((module, index) => {
          const moduleId =
            module.id !== undefined && module.id !== null
              ? String(module.id)
              : "";
          const moduleKey =
            moduleId ||
            `unsaved-${module.sortOrder}-${module.title}-${module.videoUrl}`;

          return (
            <ModuleRow
              key={moduleKey}
              module={module}
              isFirst={index === 0}
              isLast={index === modules.length - 1}
              isEditing={editingId === moduleId}
              onEdit={() => moduleId && onEdit(moduleId)}
              onCancel={() => onEdit("")}
              onUpdate={(data) => moduleId && onUpdate(moduleId, data)}
              onDelete={() => moduleId && onDelete(moduleId)}
              onReorder={(direction) =>
                moduleId && onReorder(moduleId, direction)
              }
            />
          );
        })}
      </div>
    </Card>
  );
}

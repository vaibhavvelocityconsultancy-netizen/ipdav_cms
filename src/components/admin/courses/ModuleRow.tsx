// ModuleRow.tsx
import { useState } from "react";
import {
  ChevronUp,
  ChevronDown,
  Pencil,
  Trash2,
  GripVertical,
  FileText,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/src/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/ui/alert-dialog";
import VideoTypeBadge from "./VideoTypeBadge";
import ModuleEditForm from "./ModuleEditForm";
import ModuleMaterials from "./ModuleMaterial";
import { CourseVideo } from "./CourseContentTab";

interface ModuleRowProps {
  module: CourseVideo;
  isFirst: boolean;
  isLast: boolean;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onUpdate: (data: Partial<CourseVideo>) => void;
  onDelete: () => void;
  onReorder: (direction: "up" | "down") => void;
  moduleId?: number;
}

export default function ModuleRow({
  module,
  moduleId,
  isFirst,
  isLast,
  isEditing,
  onEdit,
  onCancel,
  onUpdate,
  onDelete,
  onReorder,
}: ModuleRowProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showMaterials, setShowMaterials] = useState(false);

  // Only allow materials management for saved modules (need a numeric id)
  const savedModuleId =
    module.id && !String(module.id).startsWith("temp-") ? Number(module.id) : null;

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}min`
      : `${hours}h`;
  };

  if (isEditing) {
    return (
      <div className="px-4 py-4 bg-muted/30">
        <ModuleEditForm
          moduleId={Number(module.id)}
          initialValues={module}
          onSubmit={(data) => onUpdate(data)}
          onCancel={onCancel}
          isEdit
        />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex items-center gap-1 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => onReorder("up")}
                disabled={isFirst}
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => onReorder("down")}
                disabled={isLast}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
              <GripVertical className="h-4 w-4 text-muted-foreground ml-1" />
            </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium truncate">{module.title}</span>
              <VideoTypeBadge type={module.videoType} />
            </div>
          </div>
        </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium truncate">{module.title}</span>
                <VideoTypeBadge type={module.videoType} />
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  {formatDuration(module.durationMinutes)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0 ml-auto sm:ml-0">
            {savedModuleId != null && (
              <Button
                variant={showMaterials ? "secondary" : "ghost"}
                size="sm"
                className="h-8 gap-1.5 px-2 text-xs"
                onClick={() => setShowMaterials((s) => !s)}
                title="Study materials"
                data-testid={`module-materials-toggle-${savedModuleId}`}
              >
                <FileText className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Materials</span>
                <ChevronRight
                  className={`h-3.5 w-3.5 transition-transform ${
                    showMaterials ? "rotate-90" : ""
                  }`}
                />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={onEdit}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Materials panel — only for saved modules */}
        {showMaterials && savedModuleId != null && (
          <div className="px-4 pb-4 bg-muted/20 border-t border-dashed">
            <ModuleMaterials moduleId={savedModuleId} />
          </div>
        )}
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Video</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{module.title}"? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// AddModuleButton.tsx
import { Plus } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Card } from "@/components/ui/card";
import ModuleEditForm from "./ModuleEditForm";
import { CourseVideo } from "./CourseContentTab";
import { Card } from "@/src/ui/card";
import { Button } from "@/src/ui/button";

interface AddModuleButtonProps {
  isAdding?: boolean;
  onAdd?: (data: Omit<CourseVideo, "id" | "sortOrder">) => void;
  onCancel?: () => void;
  onClick?: () => void;
  moduleId?: number;
}

export default function AddModuleButton({
  isAdding = false,
  onAdd,
  moduleId,
  onCancel,
  onClick,
}: AddModuleButtonProps) {
  if (isAdding) {
    return (
      <Card className="border-2 border-dashed p-4">
        <ModuleEditForm
          moduleId={moduleId}
          initialValues={{
            title: "",
            videoType: "URL",
            videoUrl: "",
            durationMinutes: 0,
          }}
          onSubmit={(data) => {
            if (onAdd) {
              onAdd(data as Omit<CourseVideo, "id" | "sortOrder">);
            }
          }}
          onCancel={onCancel || (() => {})}
        />
      </Card>
    );
  }

  return (
    <Button
      variant="outline"
      className="w-full border-2 border-dashed h-12"
      onClick={onClick}
    >
      <Plus className="h-4 w-4 mr-2" />
      Add Video
    </Button>
  );
}

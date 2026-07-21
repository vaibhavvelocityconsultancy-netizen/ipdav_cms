    // EmptyState.tsx
import { Button } from "@/src/ui/button";
import { Video } from "lucide-react";
// import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onAddClick?: () => void;
}

export default function EmptyState({ onAddClick }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Video className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-1">No videos added yet</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Add your first video to get started
      </p>
      {onAddClick && (
        <Button onClick={onAddClick} variant="outline">
          Add Video
        </Button>
      )}
    </div>
  );
}
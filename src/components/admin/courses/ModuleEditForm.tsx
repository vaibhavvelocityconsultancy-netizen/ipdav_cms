// ModuleEditForm.tsx
import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
import { CourseVideo } from "./CourseContentTab";
import { Label } from "@/src/ui/label";
import { Input } from "@/src/ui/input";
import { Button } from "@/src/ui/button";
import { MediaPickerModal } from "../../media-manager/MediaPicker";
import ModuleMaterials from "./ModuleMaterial";

interface ModuleEditFormProps {
  initialValues: Partial<CourseVideo>;
  onSubmit: (data: Partial<CourseVideo>) => void;
  onCancel: () => void;
  moduleId?: number;
  isEdit?: boolean;
}

interface MediaItem {
  id: string;
  mimeType: string;
  url: string;
  publicId: string;
  originalName: string;
}

export default function ModuleEditForm({
  initialValues,
  onSubmit,
  onCancel,
  moduleId,

  isEdit = false,
}: ModuleEditFormProps) {
  const [title, setTitle] = useState(initialValues.title || "");
  const [videoType, setVideoType] = useState<"URL" | "FILE">(
    initialValues.videoType || "URL",
  );
  const [videoUrl, setVideoUrl] = useState(initialValues.videoUrl || "");
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [durationMinutes, setDurationMinutes] = useState(
    initialValues.durationMinutes?.toString() || "",
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formData: Partial<CourseVideo> = {
      title: title.trim(),
      videoType,
      durationMinutes: parseInt(durationMinutes) || 0,
    };

    formData.videoUrl = videoUrl.trim();
    onSubmit(formData);
  };

  const isValid = () => {
    if (!title.trim()) return false;
    if (videoType === "URL" && !videoUrl.trim()) return false;
    if (videoType === "FILE" && !videoUrl) return false;
    return true;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Video Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter video title"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Video Type</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={videoType === "URL" ? "default" : "outline"}
            size="sm"
            onClick={() => setVideoType("URL")}
            className="flex-1"
          >
            URL
          </Button>
          <Button
            type="button"
            variant={videoType === "FILE" ? "default" : "outline"}
            size="sm"
            onClick={() => setVideoType("FILE")}
            className="flex-1"
          >
            Upload File
          </Button>
        </div>
      </div>

      {videoType === "URL" ? (
        <div className="space-y-2">
          <Label htmlFor="videoUrl">Video Link</Label>
          <Input
            id="videoUrl"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="YouTube or Vimeo link"
            required
          />
        </div>
      ) : (
        <div className="space-y-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowMediaPicker(true)}
          >
            Select Video From Media Library
          </Button>

          {videoUrl && (
            <p className="text-sm text-green-600">✓ Video Selected</p>
          )}

          <MediaPickerModal
            open={showMediaPicker}
            onClose={() => setShowMediaPicker(false)}
            onSelect={(item) => {
              setVideoUrl(item.url);

              const video = document.createElement("video");
              video.preload = "metadata";

              video.onloadedmetadata = () => {
                const minutes = Math.ceil(video.duration / 60);
                setDurationMinutes(minutes.toString());
              };

              video.onerror = () => {
                console.error("Unable to read video duration");
              };

              video.src = item.url;

              setShowMediaPicker(false);
            }}
          />
        </div>
      )}

      {moduleId && <ModuleMaterials moduleId={moduleId} />}

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={!isValid()}>
          {isEdit ? "Save Changes" : "Add Video"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

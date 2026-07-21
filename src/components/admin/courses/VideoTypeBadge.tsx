// VideoTypeBadge.tsx
import { Badge } from "@/src/ui/badge";
import { Link, Upload } from "lucide-react";

interface VideoTypeBadgeProps {
  type: "URL" | "FILE";
}

export default function VideoTypeBadge({ type }: VideoTypeBadgeProps) {
  const isUrl = type === "URL";
  
  return (
    <Badge
      variant="secondary"
      className={`text-xs font-medium ${
        isUrl
          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
          : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
      }`}
    >
      {isUrl ? (
        <Link className="h-3 w-3 mr-1" />
      ) : (
        <Upload className="h-3 w-3 mr-1" />
      )}
      {isUrl ? "URL" : "File"}
    </Badge>
  );
}
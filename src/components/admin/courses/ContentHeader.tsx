// ContentHeader.tsx
// import { Badge } from "@/components/ui/badge";

import { Badge } from "@/src/ui/badge";

interface ContentHeaderProps {
  count: number;
}

export default function ContentHeader({ count }: ContentHeaderProps) {
  return (
    <div className="flex items-start justify-between">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">Course Content</h2>
        <p className="text-sm text-muted-foreground">
          Add the videos students will watch in this course
        </p>
      </div>
      <Badge variant="secondary" className="text-sm">
        {count} {count === 1 ? "video" : "videos"}
      </Badge>
    </div>
  );
}
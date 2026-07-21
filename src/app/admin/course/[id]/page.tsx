// src/app/admin/courses/[id]/page.tsx
"use client";

import { useCallback, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Info, Save } from "lucide-react";
import { Button } from "@/src/ui/button";
import CourseContentTab from "@/src/components/admin/courses/CourseContentTab";
import { CourseBasicInfoTab } from "@/src/components/admin/courses/CourseBasicInfo";
// import { CourseBasicInfoTab } from "@/components/admin/courses/CourseBasicInfoTab";
// import { CourseContentTab } from "@/components/admin/courses/content/CourseContentTab";

type TabKey = "basic-info" | "content";

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("basic-info");
  const [saveAction, setSaveAction] = useState<(() => Promise<void>) | null>(
    null,
  );
  const [saveState, setSaveState] = useState({ saving: false, canSave: false });
  const handleSaveActionChange = useCallback(
    (action: (() => Promise<void>) | null) => {
      setSaveAction(() => action);
    },
    [],
  );

  const tabs: { key: TabKey; label: string }[] = [
    { key: "basic-info", label: "Basic Info" },
    { key: "content", label: "Content" },
  ];

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      {/* Back nav */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        className="mb-4 gap-1.5 text-muted-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to courses
      </Button>

      {/* Tab switcher */}
      <div className="flex gap-1 border-b mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className={activeTab === "basic-info" ? "block" : "hidden"}>
        <CourseBasicInfoTab
          courseId={id}
          onSaveActionChange={handleSaveActionChange}
          onSaveStateChange={setSaveState}
        />
      </div>
      {activeTab === "content" && <CourseContentTab courseId={id} />}

      <div className="flex items-center justify-between gap-3 pt-6">
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Info className="h-3.5 w-3.5" />
          Changes are saved to both the course and its public pricing card.
        </p>
        <Button
          onClick={() => saveAction?.()}
          disabled={!saveAction || saveState.saving || !saveState.canSave}
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          {saveState.saving ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Page } from "../Cms";
import { PageEditorHeader } from "./PageEditorHeader";
import { PageEditorContent } from "./PageEditorContent";
import { PageEditorSidebar } from "./PageEditorSidebar";
import { SeoPanel } from "./seo-pannel";
// import { SeoPanel } from "./SeoPanel"; // Import the SEO panel

interface PageEditorProps {
  page: Page;
  pages: Page[];
  onChange: (page: Page) => void;
  onSave: (pageToSave?: Page) => Promise<void>;
  onCancel: () => void;
}

// Extend the Page type to include SEO data if not already defined
interface PageWithSeo extends Page {
  seoData?: {
    metaTitle?: string;
    metaDescription?: string;
    titleTemplate?: string;
    seprator?: string;
    focusKeywords?: string[];
    isPillarContent?: boolean;
    canonicalUrl?: string;
    robotsIndex?: boolean;
    robotsFollow?: boolean;
    robotsNoImageIndex?: boolean; // NEW
    robotsNoArchive?: boolean; // NEW
    robotsNoSnippet?: boolean; // NEW
    maxSnippet?: number; // NEW
    maxVideoPreview?: number; // NEW
    maxImagePreview?: "none" | "standard" | "large"; // NEW
    breadcrumbTitle?: string; // NEW
    redirectEnabled?: boolean; // NEW
    redirectUrl?: string; // NEW
    schemaType?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    twitterTitle?: string;
    twitterDescription?: string;
    twitterImage?: string;
  };
}

export function PageEditor({
  page,
  pages,
  onChange,
  onSave,
  onCancel,
}: PageEditorProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"general" | "seo">("general");

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(page);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    const updatedPage: Page = {
      ...page,
      status: "PUBLISHED",
    };

    onChange(updatedPage);

    setIsSaving(true);
    try {
      await onSave(updatedPage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSeoChange = (seoData: any) => {
    onChange({
      ...page,
      seoData: seoData,
    });
  };

  return (
    <div className="flex flex-col bg-background font-sans">
      <PageEditorHeader
        page={page}
        onChange={onChange}
        onCancel={onCancel}
        onSave={handleSave}
        isSaving={isSaving}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="flex flex-1 gap-6 p-6 max-w-375 w-full mx-auto">
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          {activeTab === "general" && (
            <PageEditorContent page={page} onChange={onChange} />
          )}
          {activeTab === "seo" && (
            <div className="border rounded-md p-4 bg-card">
              <h2 className="text-lg font-semibold mb-4">SEO Configuration</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Configure SEO settings for this page. The SEO panel on the right
                provides real-time analysis and recommendations.
              </p>
              <div className="p-4 border rounded bg-muted/20 text-center text-muted-foreground">
                <p>SEO settings are managed in the right sidebar</p>
                <p className="text-xs mt-2">
                  Use the SEO panel to optimize meta tags, keywords, and social
                  sharing
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="w-95 shrink-0 flex flex-col gap-4">
          {/* Toggle between Page Settings and SEO */}
          <div className="flex gap-2 border-b border-border">
            <button
              onClick={() => setActiveTab("general")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "general"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Page Settings
            </button>
            <button
              onClick={() => setActiveTab("seo")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "seo"
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              SEO Settings
            </button>
          </div>

          {activeTab === "general" && (
            <PageEditorSidebar
              page={page}
              pages={pages}
              onChange={onChange}
              onSave={handleSave}
              onPublish={handlePublish}
              isSaving={isSaving}
            />
          )}

          {activeTab === "seo" && (
            <SeoPanel
              pageTitle={page.title}
              pageSlug={page.slug}
              pageContent={page.html || ""}
              siteUrl={
                process.env.NEXT_PUBLIC_SITE_URL ||
                "https://next-crm-momemtums.vercel.app/"
              }
              siteName={process.env.NEXT_PUBLIC_SITE_NAME || "Your Site"} // ADD THIS
              initialData={(page as PageWithSeo).seoData}
              onChange={handleSeoChange}
            />
          )}
        </div>
      </div>
    </div>
  );
}

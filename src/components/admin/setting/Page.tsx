// app/admin/settings/page.tsx
"use client";

import { useState, useEffect } from "react";
import { SiteSettings } from "../Cms";
import { SettingsPage } from "../SettingsPage";

export default function AdminSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch(`/api/setting?t=${Date.now()}`);
      const data = await response.json();

      console.log("FETCH SETTINGS:", data);

      setSettings(data.data);
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (newSettings: Partial<SiteSettings>) => {
    const response = await fetch("/api/setting", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newSettings),
    });

    if (!response.ok) {
      throw new Error("Failed to save settings");
    }

    const updated = await response.json();
    setSettings(updated.data);
  };

  // ✅ Only ONE handleUpload function, defined inside the component
  const handleUpload = async (file: File): Promise<string> => {
    console.log("handleUpload called with file:", file.name);

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Upload failed");
    }

    const result = await response.json();
    console.log("Upload response:", result);

    // Fix: Access the nested data.url
    return result.data.url;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <SettingsPage
      initialSettings={settings || undefined}
      onSave={handleSave}
      onUpload={handleUpload}
    />
  );
}

"use client";
import { useEffect, useState } from "react";
import { Button } from "@/src/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/ui/card";
import { Input } from "@/src/ui/input";
import { Label } from "@/src/ui/label";
import { Switch } from "@/src/ui/switch";
export default function CookieConsentSettings() {
  const [data, setData] = useState<any>({ settings: {}, categories: [] });
  const [saving, setSaving] = useState(false);
  const load = () =>
    fetch("/api/cookie-consent")
      .then((r) => r.json())
      .then((r) =>
        setData({
          settings: r?.data?.settings ?? {},
          categories: Array.isArray(r?.data?.categories)
            ? r.data.categories
            : [],
        }),
      )
      .catch(() => setData({ settings: {}, categories: [] }));
  useEffect(() => {
    load();
  }, []);
  const update = (key: string, value: any) =>
    setData((current: any) => ({
      ...current,
      settings: { ...(current?.settings ?? {}), [key]: value },
      categories: Array.isArray(current?.categories) ? current.categories : [],
    }));
  const removeCategory = async (id: string) => {
    await fetch(`/api/cookie-consent/categories/${id}`, { method: "DELETE" });
    load();
  };
  const save = async () => {
    setSaving(true);
    await fetch("/api/cookie-consent", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data.settings),
    });
    setSaving(false);
  };
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Cookie Consent</h1>
        <p className="text-muted-foreground">
          Control visitor consent and optional cookie categories.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <label className="flex items-center gap-3">
            <Switch
              checked={Boolean(data.settings.enabled)}
              onCheckedChange={(v) => update("enabled", v)}
            />
            <span>Enable Cookie Consent</span>
          </label>
          <div>
            <Label>Consent Version</Label>
            <Input
              value={data.settings.consentVersion || "1"}
              onChange={(e) => update("consentVersion", e.target.value)}
            />
          </div>
          <div>
            <Label>Banner Title</Label>
            <Input
              value={data.settings.bannerTitle || ""}
              onChange={(e) => update("bannerTitle", e.target.value)}
            />
          </div>
          <div>
            <Label>Banner Description</Label>
            <Input
              value={data.settings.bannerDescription || ""}
              onChange={(e) => update("bannerDescription", e.target.value)}
            />
          </div>
          <div>
            <Label>Privacy Policy URL</Label>
            <Input
              value={data.settings.privacyPolicyUrl || ""}
              onChange={(e) => update("privacyPolicyUrl", e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <Button onClick={save} disabled={saving}>
              {saving ? "Saving…" : "Save Settings"}
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Cookie Categories</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {data.categories.map((category: any) => (
            <div
              key={category.id}
              className="flex items-center justify-between rounded-md border p-3"
            >
              <div>
                <p className="font-medium">
                  {category.name}
                  {category.required ? " · Required" : ""}
                </p>
                <p className="text-sm text-muted-foreground">
                  {category.description}
                </p>
                <p className="text-xs text-muted-foreground">
                  {category.cookies?.length || 0} cookie definitions
                </p>
              </div>
              <Button
                variant="ghost"
                className="text-destructive"
                onClick={() => removeCategory(category.id)}
              >
                Delete
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </main>
  );
}

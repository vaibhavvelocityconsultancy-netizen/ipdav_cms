// src/components/admin/courses/CourseBasicInfoTab.tsx
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import useSWR from "swr";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/ui/card";
import { Button } from "@/src/ui/button";
import { Input } from "@/src/ui/input";
import { Label } from "@/src/ui/label";
import { Textarea } from "@/src/ui/textarea";
import { Badge } from "@/src/ui/badge";
import {
  Image as ImageIcon,
  BookOpen,
  User,
  BarChart2,
  IndianRupee,
  Sparkles,
  Star,
  Eye,
  EyeOff,
  Check,
  Info,
} from "lucide-react";
import { toast } from "@/src/hooks/use-toast";
import { fetchers } from "@/src/lib/fetchers";
import { apiMutations } from "@/src/lib/apimutation";

type BillingCycle = "LIFETIME" | "MONTHLY" | "YEARLY";
type CourseLevel = "Beginner" | "Intermediate" | "Advanced";

interface CourseModule {
  id: number;
  title: string;
}

interface Pricing {
  price: number;
  durationHours: number;
  billingCycle: BillingCycle;
  isFeatured: boolean;
  isPublished: boolean;
}

interface CourseBasicInfo {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  longDescription: string;
  thumbnail: string;
  instructor: string;
  level: CourseLevel;
  modules: CourseModule[];
  pricing: Pricing;
}

interface CourseBasicInfoTabProps {
  courseId: string;
  onSaveActionChange?: (action: (() => Promise<void>) | null) => void;
  onSaveStateChange?: (state: { saving: boolean; canSave: boolean }) => void;
}

const defaultPricing = (): Pricing => ({
  price: 0,
  durationHours: 1,
  billingCycle: "LIFETIME",
  isFeatured: false,
  isPublished: true,
});

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function formatINR(val?: number | null) {
  const amount = Number(val ?? 0);
  if (amount === 0) return "₹0";
  return "₹" + amount.toLocaleString("en-IN");
}

function accessTypeLabel(billingCycle: BillingCycle) {
  if (billingCycle === "LIFETIME") return "Lifetime Access";
  if (billingCycle === "MONTHLY") return "Monthly Subscription";
  if (billingCycle === "YEARLY") return "Yearly Subscription";
  return billingCycle;
}

export function CourseBasicInfoTab({
  courseId,
  onSaveActionChange,
  onSaveStateChange,
}: CourseBasicInfoTabProps) {
  const { data, isLoading, mutate } = useSWR(
    courseId ? `course-basic-info-${courseId}` : null,
    async () => {
      const res = await fetchers.getCoursecontentByID(courseId);
      return res.data;
    },
  );
  const [form, setForm] = useState<CourseBasicInfo | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!data) return;
    const pricingCard = data.pricingCard || null;
    setForm({
      id: String(data.id ?? courseId),
      title: data.title ?? "",
      slug: data.slug ?? "",
      shortDescription: data.shortDescription ?? "",
      longDescription: data.longDescription ?? "",
      thumbnail: data.thumbnail ?? "",
      instructor: data.instructor ?? "",
      level: (data.level as CourseLevel) ?? "Beginner",
      modules: Array.isArray(data.modules)
        ? data.modules.map((m: any) => ({ id: m.id, title: m.title }))
        : [],
      pricing: pricingCard
        ? {
            price: Number(pricingCard.price ?? 0),
            durationHours: Number(pricingCard.durationHours ?? 1),
            billingCycle:
              (pricingCard.billingCycle as BillingCycle) ?? "LIFETIME",
            isFeatured: Boolean(pricingCard.isFeatured),
            isPublished:
              pricingCard.isPublished === undefined
                ? true
                : Boolean(pricingCard.isPublished),
          }
        : defaultPricing(),
    });
    setSlugTouched(false);
  }, [data, courseId]);

  function updateField<K extends keyof CourseBasicInfo>(
    key: K,
    value: CourseBasicInfo[K],
  ) {
    if (!form) return;
    setForm({ ...form, [key]: value });
  }

  function updatePricing<K extends keyof Pricing>(key: K, value: Pricing[K]) {
    if (!form) return;
    setForm({ ...form, pricing: { ...form.pricing, [key]: value } });
  }

  function handleTitleChange(value: string) {
    if (!form) return;
    const next = { ...form, title: value };
    if (!slugTouched) {
      next.slug = slugify(value);
    }
    setForm(next);
  }

  const handleSave = useCallback(async () => {
    if (!form) return;

    setSaving(true);
    try {
      await apiMutations.updateContent(
        {
          title: form.title,
          slug: form.slug,
          shortDescription: form.shortDescription,
          longDescription: form.longDescription,
          thumbnail: form.thumbnail,
          instructor: form.instructor,
          level: form.level,
          pricing: {
            price: form.pricing.price,
            durationHours: form.pricing.durationHours,
            billingCycle: form.pricing.billingCycle,
            isFeatured: form.pricing.isFeatured,
            isPublished: form.pricing.isPublished,
          },
        },
        courseId,
      );

      await mutate();

      toast({
        title: "Saved",
        description: "Course details & pricing updated successfully",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Failed to save course details",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }, [courseId, form, mutate]);

  const previewCtaLabel = useMemo(() => {
    if (!form) return "View Course";
    return Number(form.pricing.price) === 0 ? "Enroll Now" : "View Course";
  }, [form]);

  useEffect(() => {
    onSaveActionChange?.(handleSave);
    return () => onSaveActionChange?.(null);
  }, [handleSave, onSaveActionChange]);

  useEffect(() => {
    onSaveStateChange?.({
      saving,
      canSave: Boolean(form?.title.trim()),
    });
  }, [form, onSaveStateChange, saving]);

  if (isLoading || !form) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-sm text-muted-foreground">
          Loading course details...
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* ── Form column ── */}
      <div className="lg:col-span-2 space-y-6">
        {/* Course details */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-primary/10">
                <BookOpen className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">Course details</CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Basic information shown to students browsing the catalog
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-sm font-medium">
                Course title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. React Fundamentals"
              />
            </div>

            {/* Slug */}
            <div className="space-y-1.5">
              <Label htmlFor="slug" className="text-sm font-medium">
                URL slug
              </Label>
              <Input
                id="slug"
                value={form.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  updateField("slug", slugify(e.target.value));
                }}
                placeholder="e.g. react-fundamentals"
              />
              <p className="text-xs text-muted-foreground">
                Used in the course URL: /courses/
                {form.slug || "your-course-slug"}
              </p>
            </div>

            {/* Short description */}
            <div className="space-y-1.5">
              <Label htmlFor="shortDescription" className="text-sm font-medium">
                Short description
              </Label>
              <Input
                id="shortDescription"
                value={form.shortDescription}
                onChange={(e) =>
                  updateField("shortDescription", e.target.value)
                }
                placeholder="One line shown on the course card"
              />
            </div>

            {/* Long description */}
            <div className="space-y-1.5">
              <Label htmlFor="longDescription" className="text-sm font-medium">
                Full description
              </Label>
              <Textarea
                id="longDescription"
                value={form.longDescription}
                onChange={(e) => updateField("longDescription", e.target.value)}
                placeholder="Detailed description shown on the course page"
                rows={5}
              />
            </div>

            {/* Instructor + Level */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="instructor" className="text-sm font-medium">
                  Instructor
                </Label>
                <div className="relative">
                  <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="instructor"
                    value={form.instructor}
                    onChange={(e) => updateField("instructor", e.target.value)}
                    placeholder="e.g. John Doe"
                    className="pl-8"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="level" className="text-sm font-medium">
                  Level
                </Label>
                <div className="relative">
                  <BarChart2 className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <select
                    id="level"
                    value={form.level}
                    onChange={(e) =>
                      updateField("level", e.target.value as CourseLevel)
                    }
                    className="w-full pl-8 pr-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Thumbnail */}
            <div className="space-y-1.5">
              <Label htmlFor="thumbnail" className="text-sm font-medium">
                Thumbnail URL
              </Label>
              <div className="relative">
                <ImageIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="thumbnail"
                  value={form.thumbnail}
                  onChange={(e) => updateField("thumbnail", e.target.value)}
                  placeholder="https://..."
                  className="pl-8"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing & Access */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-emerald-500/10">
                <IndianRupee className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <CardTitle className="text-base">Pricing & Access</CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Set the price and access type shown on the public catalog
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="price" className="text-sm font-medium">
                  Price (₹)
                </Label>
                <div className="relative">
                  <IndianRupee className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="price"
                    type="number"
                    min={0}
                    value={form.pricing.price}
                    onChange={(e) =>
                      updatePricing("price", Math.max(0, Number(e.target.value)))
                    }
                    placeholder="0"
                    className="pl-8"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Set to 0 to mark this course as free.
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="billing-cycle" className="text-sm font-medium">
                Access type
              </Label>
              <select
                id="billing-cycle"
                value={form.pricing.billingCycle}
                onChange={(e) =>
                  updatePricing("billingCycle", e.target.value as BillingCycle)
                }
                className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="LIFETIME">Lifetime Access</option>
                <option value="MONTHLY">Monthly Subscription</option>
                <option value="YEARLY">Yearly Subscription</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Visibility */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-blue-500/10">
                <Sparkles className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-base">Visibility</CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Control where and how this course appears
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              {
                key: "isFeatured" as const,
                label: "Mark as featured",
                description: "Highlighted with a Featured badge on the catalog",
                icon: <Star className="h-3.5 w-3.5" />,
              },
              {
                key: "isPublished" as const,
                label: "Publish course",
                description: "Visible on the public catalog page",
                icon: <Eye className="h-3.5 w-3.5" />,
              },
            ].map(({ key, label, description, icon }) => (
              <label
                key={key}
                className="flex items-center justify-between cursor-pointer group px-3 py-2.5 rounded-md hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5 text-muted-foreground group-hover:text-foreground transition-colors">
                    {icon}
                  </span>
                  <div>
                    <span className="block text-sm font-medium">{label}</span>
                    <span className="block text-xs text-muted-foreground">
                      {description}
                    </span>
                  </div>
                </div>
                <div
                  role="switch"
                  aria-checked={form.pricing[key]}
                  onClick={() => updatePricing(key, !form.pricing[key])}
                  className={`relative w-9 h-5 rounded-full cursor-pointer transition-colors duration-200 flex-shrink-0 ${
                    form.pricing[key]
                      ? "bg-primary"
                      : "bg-muted border border-border"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all duration-200 ${
                      form.pricing[key] ? "left-4" : "left-0.5"
                    }`}
                  />
                </div>
              </label>
            ))}
          </CardContent>
        </Card>

      </div>

      {/* ── Live preview column ── */}
      <div className="lg:col-span-1">
        <div className="lg:sticky lg:top-6 space-y-3">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-muted">
                  <Sparkles className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <CardTitle className="text-base">Live preview</CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    How this card will look on the public catalog
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center py-1">
                <div
                  className={`relative w-full max-w-[300px] rounded-xl border overflow-hidden transition-all ${
                    form.pricing.isFeatured
                      ? "border-primary shadow-md ring-2 ring-primary/20"
                      : "border-border"
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="h-36 bg-muted w-full relative">
                    {form.thumbnail ? (
                      <img
                        src={form.thumbnail}
                        alt={form.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-muted-foreground opacity-30" />
                      </div>
                    )}
                    {form.pricing.isFeatured && (
                      <div className="absolute top-2 left-2">
                        <Badge className="gap-1 shadow-sm bg-blue-600 text-white hover:bg-blue-600 text-xs">
                          <Star className="h-2.5 w-2.5" />
                          Featured
                        </Badge>
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      {form.pricing.isPublished ? (
                        <Badge className="text-xs bg-green-500/90 text-white border-0 hover:bg-green-500/90">
                          Published
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs gap-1">
                          <EyeOff className="h-2.5 w-2.5" />
                          Draft
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="text-base font-semibold leading-tight mb-1">
                      {form.title || "Course Title"}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                      {form.shortDescription ||
                        "Short description will appear here."}
                    </p>

                    {/* Meta */}
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground mb-3">
                      {form.instructor && (
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {form.instructor}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <BarChart2 className="h-3 w-3" />
                        {form.level}
                      </span>
                    </div>

                    {/* Price + access */}
                    <div className="flex items-baseline gap-1.5 mb-1">
                      <span className="text-xl font-bold">
                        {Number(form.pricing.price) === 0
                          ? "Free"
                          : formatINR(form.pricing.price)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-4">
                      {accessTypeLabel(form.pricing.billingCycle)}
                    </p>

                    <Button
                      className="w-full mb-4"
                      variant={form.pricing.isFeatured ? "default" : "outline"}
                      size="sm"
                      type="button"
                    >
                      {previewCtaLabel}
                    </Button>

                    {/* Modules */}
                    {form.modules.length > 0 && (
                      <div className="border-t pt-3">
                        <p className="text-xs font-medium mb-2">
                          What&apos;s included
                        </p>
                        <div className="space-y-1.5">
                          {form.modules.slice(0, 6).map((m) => (
                            <div key={m.id} className="flex items-center gap-2">
                              <Check className="flex-shrink-0 h-3.5 w-3.5 text-primary" />
                              <span className="text-xs text-foreground line-clamp-1">
                                {m.title}
                              </span>
                            </div>
                          ))}
                          {form.modules.length > 6 && (
                            <p className="text-xs text-muted-foreground pl-5">
                              +{form.modules.length - 6} more
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <p className="text-xs text-muted-foreground px-1 flex items-start gap-1.5">
            <Info className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
            Manage the actual video modules inside the{" "}
            <span className="font-medium text-foreground">Content</span> tab.
          </p>
        </div>
      </div>
    </div>
  );
}

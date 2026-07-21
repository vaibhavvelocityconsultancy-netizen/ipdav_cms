"use client";

import { useRouter } from "next/navigation";
import {
  Check,
  Sparkles,
  BookOpen,
  Clock,
  User,
  BarChart2,
  Star,
} from "lucide-react";
import useSWR from "swr";
import { fetchers } from "../../lib/fetchers";
import { useCurrentUser } from "@/src/hooks/use-current-user";

type BillingCycle = "LIFETIME" | "MONTHLY" | "YEARLY";

function formatINR(val: number) {
  if (val === 0) return "Free";
  return "₹" + val.toLocaleString("en-IN");
}

function accessTypeLabel(billingCycle: BillingCycle) {
  if (billingCycle === "LIFETIME") return "Lifetime Access";
  if (billingCycle === "MONTHLY") return "Monthly Subscription";
  if (billingCycle === "YEARLY") return "Yearly Subscription";
  return billingCycle;
}

function levelColor(level: string) {
  if (level === "Beginner") return "bg-green-100 text-green-700";
  if (level === "Intermediate") return "bg-yellow-100 text-yellow-700";
  if (level === "Advanced") return "bg-red-100 text-red-700";
  return "bg-gray-100 text-gray-600";
}

export default function CourseCatalogPage() {
  const router = useRouter();
  const { data, isLoading } = useSWR("pricings", fetchers.publicCourses);
  const { user: currentUser, loading: userLoading } = useCurrentUser();

  const courses = data?.data ?? [];

  function handleEnroll(courseId: number, billingCycle: BillingCycle) {
    if (userLoading) return;

    const checkoutUrl = `/checkout?course=${courseId}&billingCycle=${billingCycle}`;

    if (!currentUser) {
      router.push(`/register?redirect=${encodeURIComponent(checkoutUrl)}`);
      return;
    }

    router.push(checkoutUrl);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Loading courses...</p>
        </div>
      </div>
    );
  }

  if (!courses.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">No courses available</p>
          <button
            onClick={() => router.refresh()}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
      </div>

      <div className="relative px-4 py-16 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-100/80 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">
              Learn at your own pace
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-4">
            Explore our course catalog
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Expert-led courses to help you grow your skills. One-time payment or
            flexible subscriptions — your choice.
          </p>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {courses.map((course) => (
            <div
              key={course.id}
              className={`relative w-full rounded-xl border bg-white overflow-hidden transition-all flex flex-col h-full ${
                course.isFeatured
                  ? "border-blue-500 shadow-md ring-2 ring-blue-100"
                  : "border-gray-200 shadow-sm hover:shadow-md"
              }`}
            >
              {/* Featured badge */}
              {course.isFeatured && (
                <div className="absolute top-3 left-3 z-10">
                  <span className="inline-flex items-center gap-1 bg-blue-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
                    <Star className="w-3 h-3" />
                    Featured
                  </span>
                </div>
              )}

              {/* Thumbnail */}
              <div className="h-44 bg-gradient-to-br from-blue-50 to-indigo-100 w-full flex-shrink-0 relative">
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <BookOpen className="w-12 h-12 text-blue-300" />
                  </div>
                )}
                {/* Level badge on thumbnail */}
                <div className="absolute bottom-3 right-3">
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${levelColor(course.level)}`}
                  >
                    {course.level}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 flex flex-col flex-grow">
                <h3 className="text-base font-semibold text-gray-900 mb-1 leading-snug">
                  {course.title}
                </h3>
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                  {course.shortDescription}
                </p>

                {/* Meta row */}
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 mb-4">
                  {course.instructor && (
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {course.instructor}
                    </span>
                  )}
                  {course.durationHours > 0 && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {course.durationHours}h
                    </span>
                  )}
                  {course.level && (
                    <span className="flex items-center gap-1">
                      <BarChart2 className="w-3 h-3" />
                      {course.level}
                    </span>
                  )}
                </div>

                {/* Price + access type */}
                <div className="mb-4">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-bold text-gray-900">
                      {formatINR(course.price)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {accessTypeLabel(course.billingCycle)}
                  </p>
                </div>

                {/* CTA */}
                <button
                  onClick={() => handleEnroll(course.id, course.billingCycle)}
                  disabled={userLoading}
                  className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-all mb-4 ${
                    course.isFeatured
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "border border-gray-300 text-gray-800 hover:bg-gray-50"
                  } disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  {userLoading ? "Checking..." : "Enroll Now"}
                </button>

                {/* Modules */}
                {course.modules?.length > 0 && (
                  <div className="border-t border-gray-100 pt-4 flex-grow">
                    <p className="text-xs font-semibold text-gray-700 mb-2">
                      Course Modules
                    </p>
                    <div className="space-y-1.5">
                      {course.modules.map((mod, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <div className="flex-shrink-0 h-4 w-4 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                            <Check className="h-2.5 w-2.5 text-blue-600" />
                          </div>
                          <span className="text-sm text-gray-700">
                            {mod.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Trust Badge */}
        <div className="text-center mt-16">
          <div className="inline-flex flex-wrap items-center justify-center gap-4 md:gap-6 bg-white/60 backdrop-blur-sm px-6 py-3 rounded-full shadow-sm">
            <span className="text-sm text-gray-600">
              Trusted by 10,000+ learners
            </span>
            <div className="hidden md:block w-px h-4 bg-gray-300"></div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className="w-4 h-4 text-yellow-400 fill-current"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
              ))}
              <span className="text-sm text-gray-600 ml-1">4.9/5 rating</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

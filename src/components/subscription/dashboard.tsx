'use client'

import { useEffect, useState } from "react"
import { BookOpen, Clock, Award, ShoppingBag, Calendar, User, DollarSign, ChevronRight } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { fetchers } from "@/src/lib/fetchers"
import { queryKeys } from "@/src/lib/query-key"
import { useRouter } from "next/navigation"

interface Course {
    enrollmentId: number;
    purchasedAt: string;
    billingCycle: string;
    id: number;
    title: string;
    thumbnail: string;
    instructor: string;
    level: string;
    price: string;
}   

interface DashboardData {
    stats: {
        enrolledCourses: number;
        activeCourses: number;
        completedCourses: number;
    };
    continueLearning: Course;
    recentPurchases: Course[];
    courses: Course[];
}

export function Dashboard() {
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const { data: dashboardData, isLoading, isError } = useQuery({
        queryKey: queryKeys.dashboardData,
        queryFn: async () => {
            try {
                const response = await fetchers.getDashboardData();
                if (response.success) {
                    return response.data;
                } else {
                    throw new Error("Failed to fetch dashboard data");
                }
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
                throw error;
            }
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
        retry: 2,
        retryDelay: 1000,
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    if (isError || !dashboardData) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center text-red-600">
                    <p className="text-xl">{error || "No data available"}</p>
                </div>
            </div>
        );
    }

    const { stats, continueLearning, recentPurchases, courses } = dashboardData;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getLevelColor = (level: string) => {
        const colors = {
            'Beginner': 'bg-green-100 text-green-800',
            'Intermediate': 'bg-yellow-100 text-yellow-800',
            'Advanced': 'bg-red-100 text-red-800'
        };
        return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    const getBillingCycleBadge = (cycle: string) => {
        const colors = {
            'LIFETIME': 'bg-purple-100 text-purple-800',
            'MONTHLY': 'bg-blue-100 text-blue-800',
            'YEARLY': 'bg-indigo-100 text-indigo-800'
        };
        return colors[cycle as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 lg:ml-36">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
                    <p className="text-gray-600 mt-1">Welcome back! Here's your learning progress.</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Enrolled Courses</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.enrolledCourses}</p>
                            </div>
                            <div className="bg-blue-100 p-3 rounded-lg">
                                <BookOpen className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Active Courses</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.activeCourses}</p>
                            </div>
                            <div className="bg-green-100 p-3 rounded-lg">
                                <Clock className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Completed Courses</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.completedCourses}</p>
                            </div>
                            <div className="bg-purple-100 p-3 rounded-lg">
                                <Award className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Continue Learning */}
                {continueLearning && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                            <Clock className="w-5 h-5 mr-2 text-blue-600" />
                            Continue Learning
                        </h2>
                        <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-100">
                            <div className="flex items-start md:items-center space-x-4">
                                <div className="bg-blue-100 p-3 rounded-lg">
                                    <BookOpen className="w-8 h-8 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">{continueLearning.title}</h3>
                                    <div className="flex flex-wrap items-center gap-2 mt-1">
                                        <span className="flex items-center text-sm text-gray-600">
                                            <User className="w-4 h-4 mr-1" />
                                            {continueLearning.instructor}
                                        </span>
                                        <span className={`px-2 py-0.5 text-xs font-medium rounded ${getLevelColor(continueLearning.level)}`}>
                                            {continueLearning.level}
                                        </span>
                                        <span className={`px-2 py-0.5 text-xs font-medium rounded ${getBillingCycleBadge(continueLearning.billingCycle)}`}>
                                            {continueLearning.billingCycle}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Enrolled on {formatDate(continueLearning.purchasedAt)}
                                    </p>
                                </div>
                            </div>
                            <button 
                            onClick={() => router.push(`/subscription/courses`)}
                            className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center">
                                Continue <ChevronRight className="w-4 h-4 ml-1" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Recent Purchases */}
                {recentPurchases && recentPurchases.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                            <ShoppingBag className="w-5 h-5 mr-2 text-green-600" />
                            Recent Purchases
                        </h2>
                        <div className="space-y-4">
                            {recentPurchases.map((course) => (
                                <div key={course.enrollmentId} className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                                    <div className="flex items-start md:items-center space-x-4">
                                        <div className="bg-gray-100 p-2 rounded-lg w-12 h-12 flex items-center justify-center">
                                            {course.thumbnail !== "test" ? (
                                                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover rounded" />
                                            ) : (
                                                <BookOpen className="w-6 h-6 text-gray-500" />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{course.title}</h3>
                                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                                <span className="text-sm text-gray-600">{course.instructor}</span>
                                                <span className={`px-2 py-0.5 text-xs font-medium rounded ${getLevelColor(course.level)}`}>
                                                    {course.level}
                                                </span>
                                                <span className={`px-2 py-0.5 text-xs font-medium rounded ${getBillingCycleBadge(course.billingCycle)}`}>
                                                    {course.billingCycle}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500 mt-1">
                                                <Calendar className="w-4 h-4 inline mr-1" />
                                                Purchased on {formatDate(course.purchasedAt)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 mt-3 md:mt-0">
                                        <span className="text-lg font-bold text-gray-900">₹{course.price}</span>
                                        {/* <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors">
                                            View
                                        </button> */}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    )
}
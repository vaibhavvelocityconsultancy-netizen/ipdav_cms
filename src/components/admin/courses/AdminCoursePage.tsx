// AdminCoursesPage.tsx - Using DataTable component
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";
import { Button } from "@/src/ui/button";
import { Input } from "@/src/ui/input";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/ui/alert-dialog";
import { Badge } from "@/src/ui/badge";
import { DataTable, Column } from "@/src/ui/data-table";
import { fetchers } from "@/src/lib/fetchers";
import { apiMutations } from "@/src/lib/apimutation";
import { useToast } from "@/src/hooks/use-toast";

interface Course {
  id: number;
  title: string;
  slug: string;
  shortDescription: string;
  thumbnail: string;
  instructor: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  modules: Array<{ id: number; title: string }>;
  _count: {
    modules: number;
  };
}

export function AdminCoursesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);

  // Define columns for the DataTable
  // Note: These will be customized within the component to access router and state
  const getCourseColumns = (
    onEdit: (course: Course) => void,
    onDelete: (course: Course) => void,
    onToggleStatus: (course: Course) => void,
  ): Column<Course>[] => [
    {
      key: "title",
      header: "Title",
      cell: (row) => (
        <button
          onClick={() => onEdit(row)}
          className="font-medium hover:underline text-sm"
        >
          {row.title}
        </button>
      ),
      filterable: true,
    },
    {
      key: "createdAt",
      header: "Created",
      cell: (row) => (
        <span className="text-sm text-muted-foreground">
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      ),
      filterable: false,
    },
    {
      key: "modules",
      header: "Modules",
      cell: (row) => (
        <Badge variant="secondary">{row._count.modules || 0}</Badge>
      ),
      filterable: false,
    },
    {
      key: "isPublished",
      header: "Status",
      cell: (row) => (
        <Badge variant={row.isPublished ? "default" : "outline"}>
          {row.isPublished ? "Published" : "Draft"}
        </Badge>
      ),
      filterable: true,
      filterValue: (row) => (row.isPublished ? "Published" : "Draft"),
    },
    {
      key: "actions",
      header: "Actions",
      cell: (row) => (
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => onEdit(row)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => onDelete(row)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            disabled={updatingStatus === row.id}
            onClick={() => onToggleStatus(row)}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      ),
      filterable: false,
    },
  ];

  const handleToggleStatus = async (course: Course) => {
    try {
      setUpdatingStatus(course.id);

      await apiMutations.toggleCourseStatus(course.id, {
        isPublished: !course.isPublished,
      });

      setCourses((prev) =>
        prev.map((c) =>
          c.id === course.id ? { ...c, isPublished: !c.isPublished } : c,
        ),
      );
    } catch (error) {
      console.error("Failed to update course status:", error);
    } finally {
      setUpdatingStatus(null);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const res = await fetchers.getCourseContents();
      setCourses(res.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const handleEditCourse = (course: Course) => {
    router.push(`/admin/course/${course.id}`);
  };

  const handleCreateCourse = async () => {
    if (!newCourseTitle.trim()) return;

    try {
      setIsCreating(true);
      const res = await apiMutations.createContent({
        title: newCourseTitle.trim(),
      });

      const course = res.data;
      setNewCourseTitle("");
      setShowCreateForm(false);
      router.push(`/admin/course/${course.id}`);
    } catch (error) {
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!deleteTarget) return;

    try {
      setIsDeleting(true);
      await apiMutations.deleteContent(String(deleteTarget.id));

      setCourses((prev) => prev.filter((c) => c.id !== deleteTarget.id));

      toast({
        title: "Course deleted",
        description: `"${deleteTarget.title}" has been deleted successfully.`,
      });
      setDeleteTarget(null);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: "Unable to delete the course.",
      });
    } finally {
      setIsDeleting(false);
    }
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-sm text-muted-foreground">Loading courses...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-sm text-destructive">Failed to load courses</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Courses</h1>
          <p className="text-sm text-muted-foreground">
            Manage your course content and structure
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Course
        </Button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="mb-6 p-4 border rounded-lg bg-muted/30">
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                id="course-title"
                value={newCourseTitle}
                onChange={(e) => setNewCourseTitle(e.target.value)}
                placeholder="Course title"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newCourseTitle.trim()) {
                    handleCreateCourse();
                  }
                }}
              />
            </div>
            <Button
              onClick={handleCreateCourse}
              disabled={!newCourseTitle.trim() || isCreating}
            >
              {isCreating ? "Creating..." : "Create"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateForm(false);
                setNewCourseTitle("");
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Course DataTable */}
      <DataTable
        data={courses}
        columns={getCourseColumns(
          handleEditCourse,
          (course) => setDeleteTarget(course),
          handleToggleStatus,
        )}
        searchPlaceholder="Search courses..."
        searchKeys={["title"]}
        pageSize={10}
        emptyMessage="No courses yet. Create your first course!"
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Course</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteTarget?.title}"? This will
              also remove all associated content. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCourse}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

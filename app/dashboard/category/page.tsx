"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Trash2,
  Pencil,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import {
  ResponsiveDialog,
} from "@/components/ui/responsive-dialog";
import { DynamicIcon, isValidIcon } from "@/components/ui/icon-picker";
import IconPicker from "@/components/ui/icon-picker";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import CategorySelect from "@/components/ui/category-select";

interface Category {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  created_at: string;
}

const COLOR_OPTIONS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e", "#14b8a6",
  "#3b82f6", "#6366f1", "#a855f7", "#ec4899", "#78716c",
];

export default function CategoryPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategory, setNewCategory] = useState({ name: "", icon: "", color: "" });
  const [deleteItem, setDeleteItem] = useState<Category | null>(null);
  const [deleteMigrateDestId, setDeleteMigrateDestId] = useState("");
  const [deleteUsageCount, setDeleteUsageCount] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/category");
      const json = await res.json();
      if (json.success) setCategories(json.data);
    } catch {
      toast.error("Failed to fetch categories");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async () => {
    if (!newCategory.name.trim()) {
      toast.error("Name is required");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCategory),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Category created");
        setNewCategory({ name: "", icon: "", color: "" });
        setDialogOpen(false);
        fetchCategories();
      } else {
        toast.error(json.message || "Failed to create");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingCategory || !editingCategory.name.trim()) {
      toast.error("Name is required");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/category/${editingCategory.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editingCategory.name,
          icon: editingCategory.icon,
          color: editingCategory.color,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Category updated");
        setEditDialogOpen(false);
        setEditingCategory(null);
        fetchCategories();
      } else {
        toast.error(json.message || "Failed to update");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (cat: Category) => {
    setDeleteItem(cat);
    setDeleteMigrateDestId("");
    setDeleteUsageCount(0);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteItem) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/category/${deleteItem.id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.requiresMigration) {
        setDeleteUsageCount(json.count);
      } else if (json.success) {
        toast.success("Deleted successfully");
        setDeleteItem(null);
        fetchCategories();
      } else {
        toast.error(json.message || "Failed to delete");
        setDeleteItem(null);
      }
    } catch {
      toast.error("An error occurred");
      setDeleteItem(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteMigrate = async () => {
    if (!deleteItem || !deleteMigrateDestId) {
      toast.error("Select a destination category");
      return;
    }
    setIsDeleting(true);
    try {
      const res = await fetch(
        `/api/category/${deleteItem.id}?migrateTo=${deleteMigrateDestId}`,
        { method: "DELETE" }
      );
      const json = await res.json();
      if (json.success) {
        toast.success("Category deleted");
        setDeleteItem(null);
        setDeleteMigrateDestId("");
        fetchCategories();
      } else {
        toast.error(json.message || "Failed to delete");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteClose = () => {
    setDeleteItem(null);
    setDeleteMigrateDestId("");
    setDeleteUsageCount(0);
  };

  return (
    <div className="p-6 space-y-6 w-full mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">
            Define categories for your transactions (e.g. Food & Drinks, Gasoline, Shopping).
          </p>
        </div>
        <ResponsiveDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          title="Add New Category"
          description="Create a new transaction category."
          trigger={
            <Button className="gap-2">
              <Plus size={18} />
              Add Category
            </Button>
          }
        >
          <form
            onSubmit={(e) => { e.preventDefault(); handleCreate(); }}
            className="space-y-4 py-4"
          >
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                placeholder="e.g. Food & Drinks"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Icon</Label>
              <IconPicker
                value={newCategory.icon}
                onChange={(icon) => setNewCategory({ ...newCategory, icon })}
              />
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewCategory({ ...newCategory, color })}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      newCategory.color === color
                        ? "border-foreground scale-110"
                        : "border-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
                {newCategory.color && !COLOR_OPTIONS.includes(newCategory.color) && (
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-full border-2 border-foreground"
                      style={{ backgroundColor: newCategory.color }}
                    />
                    <Input
                      className="w-24 h-8 text-xs"
                      value={newCategory.color}
                      onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                    />
                  </div>
                )}
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin" /> : "Save Category"}
            </Button>
          </form>
        </ResponsiveDialog>
      </div>

      <ResponsiveDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        title="Edit Category"
        description="Update the category name, icon, or color."
      >
        <form
          onSubmit={(e) => { e.preventDefault(); handleUpdate(); }}
          className="space-y-4 py-4"
        >
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              placeholder="e.g. Food & Drinks"
              value={editingCategory?.name || ""}
              onChange={(e) =>
                editingCategory &&
                setEditingCategory({ ...editingCategory, name: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Icon</Label>
            <IconPicker
              value={editingCategory?.icon || ""}
              onChange={(icon) =>
                editingCategory &&
                setEditingCategory({ ...editingCategory, icon })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() =>
                    editingCategory &&
                    setEditingCategory({ ...editingCategory, color })
                  }
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    editingCategory?.color === color
                      ? "border-foreground scale-110"
                      : "border-transparent"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="animate-spin" /> : "Update Category"}
          </Button>
        </form>
      </ResponsiveDialog>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : categories.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No categories yet. Create one to start organizing your transactions.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 flex items-center justify-center rounded-lg text-sm shrink-0"
                  style={{
                    backgroundColor: cat.color ? `${cat.color}20` : "hsl(var(--primary) / 0.1)",
                    color: cat.color || "hsl(var(--primary))",
                  }}
                >
                  {isValidIcon(cat.icon) ? (
                    <DynamicIcon name={cat.icon!} className="h-5 w-5" />
                  ) : (
                    <span className="font-bold">{cat.name.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <p className="font-medium">{cat.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    setEditingCategory(cat);
                    setEditDialogOpen(true);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  onClick={() => handleDeleteClick(cat)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AlertDialog
        open={!!deleteItem && deleteUsageCount === 0}
        onOpenChange={(open) => {
          if (!open) handleDeleteClose();
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete category?</AlertDialogTitle>
            <AlertDialogDescription>
              This category will be moved to the recycle bin.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteConfirm();
              }}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? <Loader2 className="animate-spin" /> : "Continue"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ResponsiveDialog
        open={!!deleteItem && deleteUsageCount > 0}
        onOpenChange={(open) => {
          if (!open) handleDeleteClose();
        }}
        title={`Delete ${deleteItem?.name || ""}`}
        description="Migrate transactions to another category before deleting."
      >
        <div className="space-y-4 py-4">
          <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                {deleteUsageCount} transaction{deleteUsageCount !== 1 ? "s" : ""} still use this category
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                Migrate all transactions to another category before deleting.
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Migrate transactions to</label>
            <CategorySelect
              value={deleteMigrateDestId}
              onChange={setDeleteMigrateDestId}
              categories={categories.filter((c) => c.id !== deleteItem?.id)}
              placeholder="Select category..."
            />
          </div>
          <Button
            onClick={handleDeleteMigrate}
            className="w-full gap-2"
            disabled={isDeleting || !deleteMigrateDestId}
            variant="destructive"
          >
            {isDeleting ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Migrate & Delete
              </>
            )}
          </Button>
        </div>
      </ResponsiveDialog>
    </div>
  );
}

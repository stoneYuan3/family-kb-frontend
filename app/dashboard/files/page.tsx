"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, CheckCircle, X, FileText, Trash2 } from "lucide-react";
import type { Item, Role } from "@/types";

function canDelete(item: Item, user: { id: number; role: Role } | null) {
  if (!user) return false;
  if (user.role === "admin") return true;
  if (user.role === "editor" && item.owner_id === user.id) return true;
  return false;
}

export default function FilesPage() {
    const { user } = useAuth();
    const searchParams = useSearchParams();
    const [notification, setNotification] = useState<string | null>(null);
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const canUpload = user?.role === "admin" || user?.role === "editor";

    async function handleDelete(itemId: number) {
        if (!confirm("Are you sure you want to delete this item?")) return;
        try {
            await api.delete(`/items/${itemId}`);
            setItems((prev) => prev.filter((i) => i.id !== itemId));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete item");
        }
    }

    const fetchItems = useCallback(async () => {
        try {
            const data = await api.get<Item[]>("/items");
            setItems(data);
            setError("")
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load items");
        } finally {
            setLoading(false);
        }
    }, [])

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    useEffect(() => {
        if (searchParams.get("status") === "success") {
            setNotification("Item created successfully.");
            window.history.replaceState(null, "", "/dashboard/files");
            const timer = setTimeout(() => setNotification(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [searchParams]);

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-4 flex items-center gap-4">
                <h1 className="text-2xl font-bold">Files</h1>
                {canUpload && (
                    <Link
                        href="/dashboard/files/create"
                        className={buttonVariants({ variant: "outline", size: "sm", className: "gap-2" })}
                    >
                        <Upload className="h-4 w-4" />
                        Upload
                    </Link>
                )}
            </div>
            {/* Notification */}
            {notification && (
                <div className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                    <CheckCircle className="h-4 w-4 shrink-0" />
                    <span className="flex-1">{notification}</span>
                    <button
                        onClick={() => setNotification(null)}
                        className="shrink-0 rounded p-0.5 hover:text-emerald-900 dark:hover:text-emerald-200"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}
            {/* Items area */}
            {loading ? (
                <div className="flex min-h-[60vh] items-center justify-center rounded-xl bg-muted">
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            ) : error ? (
                <div className="flex min-h-[60vh] items-center justify-center rounded-xl bg-muted">
                    <p className="text-sm text-destructive">{error}</p>
                </div>
            ) : items.length === 0 ? (
                <div className="flex min-h-[60vh] items-center justify-center rounded-xl bg-muted">
                    <div className="text-center text-muted-foreground">
                        <p className="text-lg font-medium">No items yet</p>
                        <p className="mt-1 text-sm">Upload documents to see them here.</p>
                    </div>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {items.map((item) => (
                        <Card key={item.id} className="transition-colors hover:bg-muted/50">
                            <CardContent className="flex items-center gap-3 p-4">
                                <Link href={`/dashboard/files/${item.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                                    <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
                                    <span className="truncate font-medium">{item.title}</span>
                                </Link>
                                { canDelete(item, user) && (
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="shrink-0 rounded p-1 text-muted-foreground hover:text-destructive"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
} 
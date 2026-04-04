"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, FileText, Trash2 } from "lucide-react";
import type { Item, Document } from "@/types";


export default function ItemDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { user } = useAuth();
    const [item, setItem] = useState<Item | null>(null);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const canEditItem =
        user &&
        item &&
        (user.role === "admin" ||
            (user.role === "editor" && item.owner_id === user.id));

    async function handleDeleteItem() {
        if (!confirm("Are you sure you want to delete this item and all its documents?")) return;
        try {
            await api.delete(`/items/${id}`);
            router.push("/dashboard/files");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete item");
        }
    }

    async function handleDeleteDocument(docId: number) {
        if (!confirm("Delete this Document?")) return;
        try {
            await api.delete(`/documents/${docId}`)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete document");
        }
    }

    const fetchData = useCallback(async () => {
        try {
            const [itemData, docsData] = await Promise.all([
                api.get<Item>(`/items/${id}`),
                api.get<Document[]>(`/items/${id}/documents`),
            ]);
            setItem(itemData);
            setDocuments(docsData);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load item");

        } finally {
            setLoading(false);
        }
    }, [id])

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center p-6">
                <p className="text-muted-foreground">Loading...</p>
            </div>
        );
    }

    if (error || !item) {
        return (
            <div className="p-6">
                <Link
                    href="/dashboard/files"
                    className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Files
                </Link>
                <p className="text-sm text-destructive">{error || "Item not found"}</p>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Back link */}
            <Link
                href="/dashboard/files"
                className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Files
            </Link>

            {/* Title & date */}
            <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">{item.title}</h1>
                {canEditItem && (
                    <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={handleDeleteItem}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={handleEditItem}
                    >
                        {/* edit icon */}
                    </Button>
                    </div>
                )}
                          
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
                Created {new Date(item.created_at).toLocaleDateString()}
            </p>

            {/* Description */}
            {item.description && (
                <p className="mt-4 text-sm leading-relaxed text-foreground/80">
                    {item.description}
                </p>
            )}

            {/* Documents */}
            {documents.length === 0 ? (
                <div className="mt-6 flex items-center justify-center rounded-xl bg-muted p-12">
                    <p className="text-sm text-muted-foreground">
                        No documents attached to this item.
                    </p>
                </div>
            ) : (
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {documents.map((doc) => {
                        const fileUrl = doc.file_url;
                        const isImage = doc.file_type.startsWith("image/");
                        const isPdf = doc.file_type === "application/pdf";

                        return (
                            <Card key={doc.id} className="overflow-hidden">
                                <CardContent className="p-0">
                                    {isImage ? (
                                        <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                                            <img
                                                src={fileUrl}
                                                alt={`Document ${doc.id}`}
                                                className="h-64 w-full object-contain bg-muted"
                                            />
                                        </a>
                                    ) : isPdf ? (
                                        <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                                            <embed
                                                src={fileUrl}
                                                type="application/pdf"
                                                className="h-64 w-full pointer-events-none"
                                            />
                                        </a>
                                    ) : (
                                        <a
                                            href={fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex h-64 items-center justify-center bg-muted"
                                        >
                                            <FileText className="h-12 w-12 text-muted-foreground" />
                                        </a>
                                    )}
                                    <div className="flex items-center px-3 py-2 text-xs text-muted-foreground">
                                        <span className="flex-1">{doc.file_type} &middot; {(doc.file_size / 1024).toFixed(0)} KB</span>
                                        {canEditItem && (
                                            <button
                                                onClick={() => handleDeleteDocument(doc.id)}
                                                className="shrink-0 rounded p-0.5 hover:text-destructive"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    )

}
"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Files, Users, LogOut } from "lucide-react";

const navItems = [
    { label: "Files", href: "/dashboard/files", icon: Files },
    { label: "Users", href: "/dashboard/users", icon: Users },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, logout, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, router, loading]);

    if (loading || !user) {
        return null;
    }

    function handleLogout() {
        logout();
        router.push("/login");
    }

    const initials = user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
        
    return (
        <div className="flex min-h-screen">
            {/* Sidebar */}
            <aside className="flex w-20 flex-col items-center bg-amber-700 py-6 text-white">
                {/* User avatar + greeting */}
                <div className="flex flex-col items-center gap-1">
                    <Avatar className="h-10 w-10 border-2 border-white/30">
                        <AvatarFallback className="bg-amber-900 text-sm text-white">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                    <div className="mt-1 text-center text-[11px] leading-tight">
                        <div className="text-amber-200">Hello,</div>
                        <div className="font-medium">{user.name.split(" ")[0]}</div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="mt-8 flex flex-col gap-1 w-full px-2">
                    {navItems.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex flex-col items-center gap-1 rounded-lg px-2 py-2.5 text-[11px] font-medium transition-colors ${isActive
                                        ? "bg-white/20 text-white"
                                        : "text-amber-100 hover:bg-white/10 hover:text-white"
                                    }`}
                            >
                                <item.icon className="h-5 w-5" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout at bottom */}
                <div className="mt-auto px-2 w-full">
                    <button
                        onClick={handleLogout}
                        className="flex w-full flex-col items-center gap-1 rounded-lg px-2 py-2.5 text-[11px] font-medium text-amber-100 transition-colors hover:bg-white/10 hover:text-white"
                    >
                        <LogOut className="h-5 w-5" />
                        Sign out
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 bg-muted/40">{children}</main>
        </div>
    );

}
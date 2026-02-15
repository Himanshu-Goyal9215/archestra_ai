"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { AppShell } from "@/components/layout/app-shell";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/");
        }
        // Expose userId for chat interface (health-chat needs it)
        if (user?.uid) {
            (window as any).__archestra_uid = user.uid;
        }
    }, [user, loading, router]);

    // Show nothing while checking auth
    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-950">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }

    // Not authenticated — redirect in progress
    if (!user) return null;

    return <AppShell>{children}</AppShell>;
}

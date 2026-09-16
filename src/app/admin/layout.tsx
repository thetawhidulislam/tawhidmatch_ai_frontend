"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

import { useAuthGuard } from "@/hooks/use-auth-guard";
import { cn } from "@/lib/utils";

const adminLinks = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/jobs", label: "Jobs" },
  { href: "/admin/applications", label: "Applications" },
  { href: "/admin/users", label: "Users" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isReady } = useAuthGuard();

  useEffect(() => {
    if (isReady && user && user.role !== "ADMIN") {
      router.replace("/dashboard");
    }
  }, [isReady, router, user]);

  if (!isReady || !user || user.role !== "ADMIN") {
    return (
      <div className="flex min-h-screen items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" aria-hidden="true" />
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/40 md:flex">
      <aside className="border-b bg-background md:min-h-screen md:w-60 md:border-b-0 md:border-r">
        <div className="p-5">
          <p className="text-lg font-semibold">Admin Console</p>
          <p className="mt-1 text-xs text-muted-foreground">TawhidMatch AI</p>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:px-3" aria-label="Admin navigation">
          {adminLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(`${link.href}/`));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
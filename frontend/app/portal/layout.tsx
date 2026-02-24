"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authService } from "@/lib/auth";
import CustomerNavbar from "@/components/CustomerNavbar";
import { Toaster } from "react-hot-toast";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === "/portal/login";

  useEffect(() => {
    if (isLoginPage) return;
    if (!authService.isAuthenticated()) {
      router.push("/portal/login");
      return;
    }
    const user = authService.getCurrentUser();
    if (user?.role !== "CUSTOMER") {
      router.push("/portal/login");
    }
  }, [router, isLoginPage]);

  // ログインページはナビなしで表示
  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-[#F8F8F8] overflow-hidden">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: "8px",
            padding: "12px 16px",
            fontSize: "14px",
            fontWeight: "500",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          },
          success: {
            style: {
              background: "#fff",
              color: "#1d1c1d",
              borderLeft: "4px solid #0D9488",
            },
          },
          error: {
            duration: 4000,
            style: {
              background: "#fff",
              color: "#1d1c1d",
              borderLeft: "4px solid #E01E5A",
            },
          },
        }}
      />

      <CustomerNavbar />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <main className="flex-1 overflow-y-auto pt-[52px] lg:pt-0">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

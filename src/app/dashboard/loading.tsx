"use client";

import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <Loader2 className="size-8 animate-spin text-primary" />
    </div>
  );
}

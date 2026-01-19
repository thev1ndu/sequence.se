"use client";

import * as React from "react";
import { getSystemStatus } from "./settings/actions";
import { cn } from "@/lib/utils";

export function HeaderStatus() {
  const [status, setStatus] = React.useState<"loading" | "online" | "issue">("loading");

  React.useEffect(() => {
    let mounted = true;
    const check = async () => {
      try {
        const res = await getSystemStatus();
        if (!mounted) return;
        
        if (!mounted) return;
        
        const allOnline =  
          res.database.status === "online" && 
          res.storage.status === "online";
          
        setStatus(allOnline ? "online" : "issue");
      } catch (e) {
         if (!mounted) return;
        setStatus("issue");
      }
    };
    check();
    
    return () => { mounted = false; };
  }, []);

  return (
    <div className={cn(
      "flex items-center gap-2 rounded-md px-3 h-8 text-xs font-medium border transition-all duration-300",
      status === "loading" && "bg-muted/50 border-border text-muted-foreground",
      status === "online" && "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      status === "issue" && "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
    )}>
      <div className={cn(
        "size-2 rounded-full transition-all duration-300",
        status === "loading" && "bg-muted-foreground animate-pulse",
        status === "online" && "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]",
        status === "issue" && "bg-yellow-500 animate-pulse shadow-[0_0_8px_rgba(234,179,8,0.5)]"
      )} />
      <span className="hidden sm:inline">
        {status === "loading" ? "Checking Systems..." : status === "online" ? "All Systems Go" : "System Issues Detected"}
      </span>
    </div>
  );
}

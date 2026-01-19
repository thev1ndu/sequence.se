"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { 
  Monitor, 
  Moon, 
  Sun, 
  Lock, 
  AlertTriangle, 
  Trash2, 
  CheckCircle2, 
  Database, 
  Cloud, 
  Server, 
  Eye, 
  EyeOff,
  AlertCircle,
  Loader2
} from "lucide-react";
import { User } from "@supabase/supabase-js";
import dayjs from "dayjs";

import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import { getSystemStatus } from "./actions";

type SystemStatus = {
  database: { status: string; latency: number; message: string };
  storage: { status: string; latency: number; message: string };
  api: { status: string; latency: number; message: string };
};

export default function SettingsPage() {
  const { setTheme, theme } = useTheme();
  const [user, setUser] = React.useState<User | null>(null);
  const [loadingUser, setLoadingUser] = React.useState(true);
  
  const [status, setStatus] = React.useState<SystemStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = React.useState(true);

  // Prevent hydration mismatch
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    
    // Fetch User
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoadingUser(false);
    };
    getUser();

    // Fetch System Status
    const checkStatus = async () => {
      const start = performance.now();
      try {
        const serverStatus = await getSystemStatus();
        const end = performance.now();
        const apiLatency = Math.round(end - start);
        
        setStatus({
          ...serverStatus,
          api: { ...serverStatus.api, latency: apiLatency, status: "online" }
        });
      } catch (error) {
        console.error("Status check failed:", error);
      } finally {
        setLoadingStatus(false);
      }
    };
    checkStatus();
  }, []);

  if (!mounted) {
    return null;
  }

  const allOperational = status 
    ? status.database.status === "online" && status.storage.status === "online"
    : false;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">Manage your dashboard settings</p>
        </div>
      </div>
      <Separator className="my-6" />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Account Information */}
        <Card className="xl:col-span-2 shadow-sm bg-muted/40">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Email</Label>
                <div className={cn(
                  "flex h-9 w-full rounded-md border border-input px-3 py-1 text-sm shadow-sm transition-colors",
                  "bg-muted/50 opacity-80" 
                )}>
                  {loadingUser ? "Loading..." : user?.email || "No email found"}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Account ID</Label>
                <div className={cn(
                  "flex h-9 w-full items-center rounded-md border border-input px-3 text-xs font-mono text-muted-foreground",
                  "bg-muted/50"
                )}>
                  {loadingUser ? "Loading..." : user?.id || "No ID found"}
                </div>
              </div>
            </div>
            <div className="mt-6 space-y-1">
              <Label className="text-xs text-muted-foreground">Last Sign In</Label>
              <div className="text-sm font-medium">
                {loadingUser ? "Loading..." : user?.last_sign_in_at 
                  ? dayjs(user.last_sign_in_at).format('dddd, MMMM D, YYYY [at] h:mm:ss A UTC')
                  : "Never"}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card className="shadow-sm bg-muted/40">
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Choose your preferred theme for the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <ThemeButton 
                isActive={theme === 'light'} 
                onClick={() => setTheme('light')} 
                icon={Sun} 
                label="Light" 
              />
              <ThemeButton 
                isActive={theme === 'dark'} 
                onClick={() => setTheme('dark')} 
                icon={Moon} 
                label="Dark" 
              />
              <ThemeButton 
                isActive={theme === 'system'} 
                onClick={() => setTheme('system')} 
                icon={Monitor} 
                label="System" 
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card className="shadow-sm bg-muted/40">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-0.5">
            <CardTitle>System Status</CardTitle>
            <CardDescription>Live health check of connected services</CardDescription>
          </div>
          <div className={cn(
            "hidden sm:flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium border",
             allOperational 
               ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
               : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
          )}>
            <div className={cn(
              "h-1.5 w-1.5 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.5)]",
              allOperational ? "bg-emerald-500" : "bg-yellow-500 animate-pulse"
            )} />
            {loadingStatus ? "Checking Systems..." : allOperational ? "All Systems Operational" : "System Issues Detected"}
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <StatusCard 
            icon={Database} 
            title="Database" 
            subtitle="Supabase PostgreSQL" 
            metric={loadingStatus ? "Checking..." : `${status?.database.latency}ms response`}
            status={status?.database.status}
          />
          <StatusCard 
            icon={Cloud} 
            title="Image Storage" 
            subtitle="Cloudflare R2" 
            metric={loadingStatus ? "Checking..." : `${status?.storage.latency}ms response`}
            status={status?.storage.status}
          />
          <StatusCard 
            icon={Server} 
            title="API Server" 
            subtitle="Next.js Backend" 
            metric={loadingStatus ? "Checking..." : `${status?.api.latency}ms response`}
            status="online"
          />
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card className="shadow-sm relative overflow-hidden bg-muted/40">
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your account password</CardDescription>
          <div className="absolute right-6 top-6 rounded-full bg-muted/50 p-2 text-muted-foreground hidden sm:block">
            <Lock className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="current-pw">Current Password</Label>
              <PasswordInput id="current-pw" placeholder="Enter current password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-pw">New Password</Label>
              <PasswordInput id="new-pw" placeholder="Enter new password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-pw">Confirm New Password</Label>
              <PasswordInput id="confirm-pw" placeholder="Confirm new password" />
            </div>
          </div>

        </CardContent>
        <CardFooter className="flex items-center justify-between px-6 py-4 pt-2">
          <div className="text-xs text-muted-foreground">
            Requirements: 6+ characters • One uppercase letter • One lowercase letter • One number
          </div>
          <Button>Update Password</Button>
        </CardFooter>
      </Card>
      
      {/* Footer spacer */}

    </div>
  );
}

// --- Specific Components ---

function ThemeButton({ isActive, onClick, icon: Icon, label }: { isActive: boolean; onClick: () => void; icon: any; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-4 transition-all hover:bg-muted/50 w-full",
        isActive 
          ? "border-primary bg-muted text-primary" 
          : "border-muted bg-transparent text-muted-foreground hover:border-muted-foreground/50"
      )}
    >
      <div className={cn(
        "rounded-full p-2",
        isActive ? "bg-background shadow-sm" : "bg-muted/50"
      )}>
        <Icon className="h-5 w-5" />
      </div>
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}

function StatusCard({ icon: Icon, title, subtitle, metric, status = "online" }: { icon: any; title: string; subtitle: string; metric?: string; status?: string }) {
  const isOnline = status === "online";
  const isError = status === "error";
  
  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl border p-4 transition-all hover:bg-muted/50",
      // Gray Theme adaptation: Dark background (from card default), but keep green border/text if online
      isOnline ? "border-emerald-500/20" : isError ? "border-red-500/20" : "border-border",
      "bg-muted/40" // Ensure it matches standard card gray, removing the green tint
    )}>
      <div className="flex items-start gap-4">
        <div className={cn(
          "rounded-lg p-2",
          isOnline ? "bg-emerald-500/10 text-emerald-500" : isError ? "bg-red-500/10 text-red-500" : "bg-muted text-muted-foreground"
        )}>
          {isError ? <AlertCircle className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium leading-none">{title}</h3>
            {isOnline && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
            {isError && <AlertCircle className="h-3.5 w-3.5 text-red-500" />}
          </div>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
          {metric && (
            <p className={cn(
              "text-xs font-medium",
              isOnline ? "text-emerald-500" : isError ? "text-red-500" : "text-muted-foreground"
            )}>{metric}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function PasswordInput({ id, placeholder, className }: { id?: string; placeholder: string; className?: string }) {
  const [showPassword, setShowPassword] = React.useState(false);
  
  return (
    <div className="relative">
      <Input
        id={id}
        type={showPassword ? "text" : "password"}
        placeholder={placeholder}
        className={cn("pr-10 bg-muted/40 border-input/50 focus-visible:ring-1", className)}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
      >
        {showPassword ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}

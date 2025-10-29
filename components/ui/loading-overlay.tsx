"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingOverlayProps {
  message?: string;
  type?: "search" | "toggle" | "loading";
  className?: string;
}

export function LoadingOverlay({ 
  message, 
  type = "loading",
  className 
}: LoadingOverlayProps) {
  const getDefaultMessage = () => {
    switch (type) {
      case "search":
        return "Searching 2.7M+ job listings...";
      case "toggle":
        return "Switching view...";
      default:
        return "Loading data...";
    }
  };

  return (
    <div className={cn(
      "absolute inset-0 z-50 flex items-center justify-center",
      "bg-white/40 dark:bg-gray-950/40",
      "backdrop-blur-sm transition-all duration-200",
      className
    )}>
      <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/90 dark:bg-gray-900/90 shadow-xl border border-gray-200/50 dark:border-gray-700/50">
        <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {message || getDefaultMessage()}
        </span>
      </div>
    </div>
  );
}

// Mini loading overlay for inline sections
export function MiniLoadingOverlay({ message }: { message?: string }) {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-lg">
      <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white dark:bg-gray-900 shadow-lg border border-gray-200 dark:border-gray-700">
        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {message || "Loading..."}
        </span>
      </div>
    </div>
  );
}
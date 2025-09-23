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
      "bg-gradient-to-br from-white/95 to-gray-50/95",
      "dark:from-gray-900/95 dark:to-gray-950/95",
      "backdrop-blur-md transition-all duration-300",
      className
    )}>
      <div className="flex flex-col items-center justify-center p-8 rounded-2xl bg-white/90 dark:bg-gray-900/90 shadow-2xl border border-gray-200/50 dark:border-gray-700/50">
        {/* Just one clean spinner */}
        <div className="relative flex items-center justify-center h-16 w-16">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600 dark:text-blue-400" />
        </div>
        
        {/* Message only */}
        <div className="mt-6 flex flex-col items-center">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 animate-pulse">
            {message || getDefaultMessage()}
          </p>
          
          {/* Progress dots */}
          <div className="flex items-center gap-1 mt-3">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
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
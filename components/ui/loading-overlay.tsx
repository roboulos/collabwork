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
      "bg-white/60 dark:bg-gray-950/60",
      "backdrop-blur-xl transition-all duration-300",
      className
    )}>
      <div className="relative">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-3xl blur-2xl opacity-20 animate-pulse" />
        
        <div className="relative flex flex-col items-center justify-center p-10 rounded-3xl bg-white/95 dark:bg-gray-900/95 shadow-2xl border border-gray-200/20 dark:border-gray-700/20 min-w-[320px]">
          {/* Modern spinner with gradient */}
          <div className="relative flex items-center justify-center h-20 w-20 mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-spin [animation-duration:2s]" style={{
              background: "conic-gradient(from 0deg, transparent, #3b82f6, #8b5cf6, transparent)"
            }} />
            <div className="absolute inset-2 bg-white dark:bg-gray-900 rounded-full" />
          </div>
          
          {/* Message with better typography */}
          <div className="flex flex-col items-center space-y-2">
            <p className="text-base font-semibold text-gray-800 dark:text-gray-200">
              {message || getDefaultMessage()}
            </p>
            
            {/* Animated loading bar */}
            <div className="w-48 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-4">
              <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-loading-bar" />
            </div>
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
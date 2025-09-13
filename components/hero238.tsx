"use client";

import { Sun, Moon } from "lucide-react";
import React, { ReactNode } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";

const Hero238 = () => {
  const { theme, setTheme } = useTheme();

  return (
    <section className="h-full overflow-hidden w-screen lg:h-screen">
      <AuroraBackground>
        {/* Dark mode toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="absolute top-4 right-4 z-50 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white/90 dark:hover:bg-gray-700/90 border border-gray-200 dark:border-gray-700"
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5 text-yellow-500" />
          ) : (
            <Moon className="h-5 w-5 text-blue-600" />
          )}
        </Button>
        
        <div className="container relative py-32 flex h-full flex-col lg:flex-row">
          <div className="mt-auto space-y-12 lg:w-1/2">
            <h1 className="mt-3 max-w-xl text-5xl font-medium font-semibold tracking-tighter lg:text-6xl text-gray-900 dark:text-white">
              Welcome to CollabWork Dashboard
            </h1>
            <div className="flex items-center gap-4">
              <Link href="/auth/login">
                <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white">Get Started</Button>
              </Link>
            </div>
          </div>
          <div className="relative flex h-[500px] w-full items-center justify-center overflow-hidden lg:w-1/2">
          </div>
        </div>
      </AuroraBackground>
    </section>
  );
};

export { Hero238 };

// Below is the modified component from Aceternity UI
// Original source: npx shadcn@latest add https://ui.aceternity.com/registry/aurora-background.json
// Modified so we could change the aurora animate class and colors

interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
  children: ReactNode;
  showRadialGradient?: boolean;
}

export const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
  ...props
}: AuroraBackgroundProps) => {
  return (
    <main>
      <div
        className={cn(
          "transition-bg relative flex h-[100vh] flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50/30 to-white dark:from-gray-900 dark:via-purple-950/20 dark:to-black text-slate-950 dark:text-slate-50",
          className,
        )}
        {...props}
      >
        <div
          className="absolute inset-0 overflow-hidden"
          style={
            {
              "--aurora":
                "repeating-linear-gradient(100deg,#2563eb_10%,#7c3aed_15%,#4f46e5_20%,#9333ea_25%,#3730a3_30%)",
              "--dark-gradient":
                "repeating-linear-gradient(100deg,#ffffff_0%,#ffffff_7%,transparent_10%,transparent_12%,#ffffff_16%)",
              "--white-gradient":
                "repeating-linear-gradient(100deg,#c7d2fe_0%,#c7d2fe_7%,transparent_10%,transparent_12%,#c7d2fe_16%)",
              "--dark-aurora":
                "repeating-linear-gradient(100deg,#ffffff_10%,#e5e7eb_15%,#f3f4f6_20%,#e5e7eb_25%,#ffffff_30%)",

              "--blue-200": "#bfdbfe",
              "--blue-400": "#60a5fa",
              "--blue-600": "#2563eb",
              "--purple-400": "#a78bfa",
              "--purple-600": "#9333ea",
              "--transparent": "transparent",
            } as React.CSSProperties
          }
        >
          <div
            //   I'm sorry but this is what peak developer performance looks like // trigger warning
            className={cn(
              `animate-aurora-background pointer-events-none absolute -inset-[10px] opacity-50 dark:opacity-20 blur-[10px] invert filter will-change-transform [--aurora:repeating-linear-gradient(100deg,#2563eb_10%,#7c3aed_15%,#3b82f6_20%,#8b5cf6_25%,#2563eb_30%)] [--dark-gradient:repeating-linear-gradient(100deg,#000000_0%,#000000_7%,transparent_10%,transparent_12%,#000000_16%)] [--white-gradient:repeating-linear-gradient(100deg,#8b5cf6_0%,#8b5cf6_7%,transparent_10%,transparent_12%,#8b5cf6_16%)] [--dark-aurora:repeating-linear-gradient(100deg,#000000_10%,#1f2937_15%,#111827_20%,#1f2937_25%,#000000_30%)] [background-image:var(--white-gradient),var(--aurora)] [background-position:50%_50%,50%_50%] [background-size:300%,_200%] after:animate-aurora-background after:absolute after:inset-0 after:mix-blend-difference after:content-[""] after:[background-attachment:fixed] after:[background-image:var(--white-gradient),var(--aurora)] after:[background-size:200%,_100%] dark:[background-image:var(--dark-gradient),var(--dark-aurora)] after:dark:[background-image:var(--dark-gradient),var(--dark-aurora)]`,

              showRadialGradient &&
                `[mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,var(--transparent)_70%)]`,
            )}
          ></div>
        </div>
        {children}
      </div>
    </main>
  );
};

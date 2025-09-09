"use client"

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <Image 
              src="/collabworklogo.svg" 
              alt="CollabWork" 
              width={150} 
              height={40}
              className="h-8 w-auto dark:invert"
              priority
            />
          </Link>
        </div>
        
        <div className="ml-auto flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            Job Curation Dashboard
          </span>
        </div>
      </div>
    </nav>
  )
}
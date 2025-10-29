"use client"

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from '@/components/ui/navigation-menu'
import { cn } from '@/lib/utils'
import { Briefcase, Users, BarChart3, Settings, HelpCircle, LogOut } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { useRouter } from 'next/navigation'

export function Navbar() {
  const router = useRouter();
  
  const handleLogout = () => {
    localStorage.removeItem('admin_auth_token');
    localStorage.removeItem('admin_user');
    router.push('/auth/login');
  };
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-gradient-to-b from-background/85 to-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/50">
      <div className="flex h-16 items-center justify-center">
        <div className="flex w-full max-w-[95%] items-center px-4">
          {/* Logo */}
          <div className="mr-8 flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="relative h-12 w-[200px]">
                <Image 
                  src="/collabworklogo.svg" 
                  alt="CollabWork" 
                  fill
                  className="object-contain object-left dark:hidden"
                  priority
                />
                <Image 
                  src="/collabworklogodark.svg" 
                  alt="CollabWork" 
                  fill
                  className="object-contain object-left hidden dark:block"
                  priority
                />
              </div>
            </Link>
          </div>

        {/* Navigation - Hidden for now */}
        <NavigationMenu className="hidden">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link href="/" className={navigationMenuTriggerStyle()}>
                  <Briefcase className="mr-2 h-4 w-4" />
                  Jobs
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger>
                <Users className="mr-2 h-4 w-4" />
                Brands
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                  {brands.map((brand) => (
                    <ListItem
                      key={brand.name}
                      title={brand.name}
                      href={brand.href}
                    >
                      {brand.description}
                    </ListItem>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link href="/analytics" className={navigationMenuTriggerStyle()}>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Analytics
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

          {/* Right side - Hidden for now */}
          <div className="hidden">
            <nav className="hidden items-center gap-1 md:flex">
              <Button variant="ghost" size="sm" className="h-9">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
              <Button variant="ghost" size="sm" className="h-9">
                <HelpCircle className="mr-2 h-4 w-4" />
                Help
              </Button>
            </nav>
            
            <div className="hidden h-5 w-px bg-border md:block" />
            
            <Button className="h-9">
              Add Jobs
            </Button>
          </div>

          {/* Theme Toggle and Logout - Always visible */}
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className="h-9"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"

const brands = [
  {
    name: "Morning Brew",
    href: "#",
    description: "Daily business news for professionals"
  },
  {
    name: "Retail Brew", 
    href: "#",
    description: "Retail industry insights and trends"
  },
  {
    name: "Marketing Brew",
    href: "#", 
    description: "Marketing news and strategies"
  },
  {
    name: "HR Brew",
    href: "#",
    description: "Human resources and workplace culture"
  },
  {
    name: "IT Brew",
    href: "#",
    description: "Technology and IT industry news"
  },
  {
    name: "CFO Brew",
    href: "#",
    description: "Finance and CFO insights"
  },
  {
    name: "Healthcare Brew",
    href: "#",
    description: "Healthcare industry updates"
  },
  {
    name: "Tech Brew",
    href: "#",
    description: "Tech innovation and startup news"
  }
]
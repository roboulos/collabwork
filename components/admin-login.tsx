'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from "next-themes";
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle, Sun, Moon } from 'lucide-react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('https://api.collabwork.com/api:microapp/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.authToken) {
        // Store the auth token
        localStorage.setItem('admin_auth_token', data.authToken);
        
        // Store user info if available
        if (data.user) {
          localStorage.setItem('admin_user', JSON.stringify(data.user));
        }

        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        setError(data.message || 'Invalid email or password');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center py-12 relative bg-gradient-to-br from-blue-50 via-purple-50/30 to-white dark:from-gray-900 dark:via-purple-950/20 dark:to-black">
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
      
      <div className="container">
        <div className="flex flex-col items-center gap-4">
          <Card className="mx-auto w-full max-w-[380px] border border-gray-200 dark:border-gray-800 shadow-lg backdrop-blur-sm bg-white/90 dark:bg-gray-900/90">
            <CardHeader className="items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <Image
                  src="/collabworklogo.svg"
                  width={240}
                  height={58}
                  className="h-12 w-auto dark:hidden"
                  alt="CollabWork"
                  priority
                />
                <Image
                  src="/collabworklogodark.svg"
                  width={240}
                  height={58}
                  className="h-12 w-auto hidden dark:block"
                  alt="CollabWork"
                  priority
                />
                <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
                  Admin Login
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  CollabWork Job Dashboard
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid gap-4">
                {error && (
                  <div className="flex items-center gap-2 rounded-md bg-red-50 dark:bg-red-950/20 p-3 text-sm text-red-800 dark:text-red-400 border border-red-200 dark:border-red-900/50">
                    <AlertCircle className="h-4 w-4" />
                    <span>{error}</span>
                  </div>
                )}
                
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="ashley@morningbrew.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign in'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
          
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            <p>You can login using:</p>
            <p className="font-mono text-xs mt-1">testadmin@collabwork.com / password</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export { AdminLogin };
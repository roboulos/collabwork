'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle } from 'lucide-react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('https://api.collabwork.com/api:LAaWPRbb/admin/auth/login', {
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
        router.push('/');
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
    <section className="min-h-screen flex items-center justify-center py-12">
      <div className="container">
        <div className="flex flex-col items-center gap-4">
          <Card className="mx-auto w-full max-w-[380px]">
            <CardHeader className="items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <img
                  src="/collabworklogo.svg"
                  className="h-12 w-auto"
                  alt="CollabWork"
                />
                <h1 className="text-2xl font-semibold tracking-tight">
                  Admin Login
                </h1>
                <p className="text-sm text-muted-foreground">
                  Ashley&apos;s Job Curation Dashboard
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid gap-4">
                {error && (
                  <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-800">
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
                  className="w-full" 
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
          
          <div className="text-center text-sm text-muted-foreground">
            <p>This is a private admin dashboard.</p>
            <p>Unauthorized access is prohibited.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export { AdminLogin };
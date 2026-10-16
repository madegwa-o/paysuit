'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageLoading } from '@/components/global/loading-spinner';

const completeProfileSchema = z
    .object({
      username: z.string().min(1, 'Username is required'),
      phone: z.string().optional(),
      password: z.string().optional(),
      confirmPassword: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (!data.password) return;

      if (data.password.length < 6) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Password must be at least 6 characters',
          path: ['password'],
        });
      }

      if (data.password !== data.confirmPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Passwords do not match',
          path: ['confirmPassword'],
        });
      }
    });

type CompleteProfileFormValues = z.infer<typeof completeProfileSchema>;

export default function CompleteProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CompleteProfileFormValues>({
    resolver: zodResolver(completeProfileSchema),
    defaultValues: { username: '', phone: '', password: '', confirmPassword: '' },
  });

  const password = watch('password');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  const onSubmit = async (values: CompleteProfileFormValues) => {
    setServerError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/complete-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: values.username,
          phone: values.phone,
          password: values.password || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Profile completed');
        router.push(`/transactions`);
      } else {
        const message = data.message || 'Failed to complete profile';
        setServerError(message);
        toast.error('Failed to complete profile', { description: message });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to complete profile';
      setServerError(message);
      toast.error('Failed to complete profile', { description: message });
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading') {
    return <PageLoading label="Loading profile" />;
  }

  return (
      <div className="min-h-screen bg-transparent flex items-center justify-center p-4 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-cyan-500/10 rounded-full blur-3xl"></div>
        </div>

        <Card className="w-full max-w-md glass shadow-2xl shadow-black/20 relative z-10">
          <CardHeader className="space-y-1">
            <div className="text-xs font-mono text-muted-foreground mb-2">PAYSUIT.AUTH</div>
            <CardTitle className="text-3xl font-bold">Complete Your Profile</CardTitle>
            <CardDescription>Just a few more details to get started</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {serverError && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                  {serverError}
                </div>
            )}

            {/* Display info from Google */}
            <div className="rounded-lg bg-accent/40 border border-border p-4 space-y-2">
              <p className="text-sm text-muted-foreground">Signed in as</p>
              <p className="font-medium">{session?.user?.name}</p>
              <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <div className="space-y-2">
                <label className="text-xs uppercase font-mono text-muted-foreground">Username *</label>
                <Input
                    type="text"
                    placeholder="your_username"
                    disabled={isLoading}
                    {...register('username')}
                />
                {errors.username ? (
                    <p className="text-xs text-destructive">{errors.username.message}</p>
                ) : (
                    <p className="text-xs text-muted-foreground">
                      This will be your unique identifier on the platform
                    </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase font-mono text-muted-foreground">Phone (Optional)</label>
                <Input
                    type="tel"
                    placeholder="07xx xxx xxx"
                    disabled={isLoading}
                    {...register('phone')}
                />
              </div>

              <div className="border-t border-border pt-4">
                <p className="text-xs uppercase font-mono text-muted-foreground mb-3">Security</p>

                <div className="space-y-2">
                  <label className="text-xs uppercase font-mono text-muted-foreground">Password (Optional)</label>
                  <Input
                      type="password"
                      placeholder="••••••••"
                      disabled={isLoading}
                      {...register('password')}
                  />
                  {errors.password ? (
                      <p className="text-xs text-destructive">{errors.password.message}</p>
                  ) : (
                      <p className="text-xs text-muted-foreground">
                        Leave blank to set password later. Minimum 6 characters.
                      </p>
                  )}
                </div>

                {password && (
                    <div className="space-y-2 mt-3">
                      <label className="text-xs uppercase font-mono text-muted-foreground">Confirm Password *</label>
                      <Input
                          type="password"
                          placeholder="••••••••"
                          disabled={isLoading}
                          {...register('confirmPassword')}
                      />
                      {errors.confirmPassword && (
                          <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
                      )}
                    </div>
                )}
              </div>

              <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-full h-10 font-semibold disabled:opacity-50"
              >
                {isLoading ? 'Completing...' : 'Complete Profile'}
              </Button>
            </form>

            <button
                onClick={() => signOut()}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              Sign out instead
            </button>
          </CardContent>
        </Card>
      </div>
  );
}

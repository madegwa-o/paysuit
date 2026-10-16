'use client';

import { Suspense, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signIn, getSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageLoading } from '@/components/global/loading-spinner';

const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or username is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function isSafeCallbackUrl(url: string | null): url is string {
  if (!url) return false;
  // only allow same-site relative paths — block //evil.com, https://evil.com, etc.
  return url.startsWith('/') && !url.startsWith('//');
}

/** Branding + copy that differs per product (Coseke, KeyHub, etc). */
export interface LoginBranding {
  /** Small mono tag above the title, e.g. "COSEKE.AUTH" or "KEYHUB.AUTH" */
  tag: string;
  title: string;
  description: string;
  /** Register/forgot-password link destinations, in case they differ per product */
  registerHref?: string;
  forgotPasswordHref?: string;
  /** Fallback destination when there's no callbackUrl and no username on the session */
  defaultRedirect?: string;
}

const DEFAULT_BRANDING: LoginBranding = {
  tag: 'AUTH',
  title: 'Authenticate',
  description: 'Sign in to access your account',
  registerHref: '/auth/register',
  forgotPasswordHref: '/auth/forgot-password',
  defaultRedirect: '/',
};

function LoginForm({ branding = DEFAULT_BRANDING }: { branding?: LoginBranding }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: '', password: '' },
  });

  const rawCallbackUrl = searchParams.get('callbackUrl');
  const callbackUrl = isSafeCallbackUrl(rawCallbackUrl) ? rawCallbackUrl : null;

  const getUsernameFromSession = (session: unknown): string | null => {
    return (session as { user?: { username?: string } })?.user?.username || null;
  };

  const resolveFallbackDestination = async (): Promise<string> => {
    if (callbackUrl) return callbackUrl;

    const session = await getSession();
    const username = getUsernameFromSession(session);

    return username ? `/${username}` : branding.defaultRedirect ?? '/';
  };

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        identifier: values.identifier,
        password: values.password,
        redirect: false,
      });

      if (result?.ok) {
        toast.success('Welcome back', { description: 'You are now signed in.' });

        router.refresh();

        const destination = await resolveFallbackDestination();
        router.push(destination);
      } else {
        toast.error('Sign in failed', {
          description: 'Check your credentials and try again.',
        });
      }
    } catch (err: unknown) {
      toast.error('Sign in failed', {
        description: err instanceof Error ? err.message : 'Something went wrong. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signIn('google', { callbackUrl: callbackUrl ?? '/' });
    } catch (err: unknown) {
      toast.error('Google sign in failed', {
        description: err instanceof Error ? err.message : 'Something went wrong. Please try again.',
      });
    }
  };

  return (
      <div className="min-h-screen bg-transparent flex items-center justify-center p-4 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-cyan-500/10 rounded-full blur-3xl"></div>
        </div>

        <Card className="w-full max-w-md border border-white/10 bg-slate-900/30 backdrop-blur-xl shadow-2xl shadow-black/20 relative z-10">
          <CardHeader className="space-y-1">
            <div className="text-xs font-mono text-slate-400 mb-2">{branding.tag}</div>
            <CardTitle className="text-3xl font-bold text-white">{branding.title}</CardTitle>
            <CardDescription className="text-slate-400">{branding.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <button
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="w-full rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed h-10 transition-colors flex items-center justify-center gap-2 border border-white/10 backdrop-blur-sm"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                      fill="currentColor"
                      d="M12.545 10.239v3.821h5.445c-0.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.033s2.701-6.033 6.033-6.033c1.498 0 2.866 0.549 3.921 1.453l2.814-2.814c-1.969-1.833-4.616-2.955-7.735-2.955-6.329 0-11.45 5.121-11.45 11.45s5.121 11.45 11.45 11.45c6.038 0 11.315-4.949 11.315-11.45 0-0.811-0.101-1.594-0.278-2.354h-11.037z"
                  />
                </svg>
                <span className="text-sm font-medium text-white">Continue with Google</span>
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="px-2 bg-transparent text-slate-500">Standard Protocol</span>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <div className="space-y-2">
                <label className="text-xs uppercase font-mono text-slate-400">Email or Username</label>
                <Input
                    type="text"
                    placeholder="user@domain.net or username"
                    disabled={isLoading}
                    className="bg-white/5 border-white/10 text-white placeholder-slate-500 backdrop-blur-sm"
                    {...register('identifier')}
                />
                {errors.identifier && (
                    <p className="text-xs text-red-400">{errors.identifier.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase font-mono text-slate-400">Passcode</label>
                <Input
                    type="password"
                    placeholder="••••••••"
                    disabled={isLoading}
                    className="bg-white/5 border-white/10 text-white placeholder-slate-500 backdrop-blur-sm"
                    {...register('password')}
                />
                {errors.password && (
                    <p className="text-xs text-red-400">{errors.password.message}</p>
                )}
              </div>

              <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-white text-slate-900 hover:bg-slate-100 rounded-full h-10 font-semibold disabled:opacity-50"
              >
                {isLoading ? 'Signing in...' : 'Initialize Access'}
              </Button>
            </form>

            <div className="flex flex-col gap-2 text-sm text-slate-400">
              <Link
                  href={branding.registerHref ?? '/auth/register'}
                  className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                Don&apos;t have an account? Register here
              </Link>
              <Link
                  href={branding.forgotPasswordHref ?? '/auth/forgot-password'}
                  className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                Forgot your password?
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
  );
}

 function LoginPage({ branding }: { branding?: LoginBranding }) {
  return (
      <Suspense
          fallback={<PageLoading label="Loading sign in" />}
      >
        <LoginForm branding={branding} />
      </Suspense>
  );
}



export default function Page() {
  return (
      <LoginPage
          branding={{
            tag: 'PAYSUIT.AUTH',
            title: 'Sign in to Paysuit',
            description: 'Access your dashboard, manage your M-Pesa transactions',
            registerHref: '/auth/register',
            forgotPasswordHref: '/auth/forgot-password',
            defaultRedirect: '/',
          }}
      />
  );
}

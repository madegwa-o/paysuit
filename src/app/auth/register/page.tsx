'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const registerSchema = z
    .object({
      name: z.string().min(1, 'Name is required'),
      username: z.string().min(1, 'Username is required'),
      email: z.string().min(1, 'Email is required').email('Enter a valid email'),
      password: z.string().min(6, 'Password must be at least 6 characters'),
      confirmPassword: z.string().min(1, 'Confirm your password'),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    });

type RegisterFormValues = z.infer<typeof registerSchema>;

function TermsCheckbox({
                         checked,
                         onChange,
                         disabled,
                         showError,
                       }: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  showError?: boolean;
}) {
  return (
      <div className="space-y-1">
        <label className="flex items-start gap-2 text-sm text-muted-foreground cursor-pointer">
          <input
              type="checkbox"
              checked={checked}
              disabled={disabled}
              onChange={(e) => onChange(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-border accent-primary"
          />
          <span>
          I agree to the{' '}
            <Link
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
            >
            Terms &amp; Conditions
          </Link>{' '}
            and{' '}
            <Link
                href="/policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
            >
            Privacy Policy
          </Link>
          .
        </span>
        </label>
        {showError && !checked && (
            <p className="text-xs text-destructive">
              You must accept the Terms and Privacy Policy to continue.
            </p>
        )}
      </div>
  );
}

export default function RegisterPage() {
  const [step, setStep] = useState<'initial' | 'form' | 'verification'>('initial');
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [showTermsError, setShowTermsError] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', username: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    if (!accepted) {
      setShowTermsError(true);
      return;
    }
    setServerError('');
    // ...rest unchanged
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: values.username,
          name: values.name,
          email: values.email,
          password: values.password,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setServerError(data.message || 'Registration failed');
        toast.error('Registration failed', { description: data.message || 'Please try again.' });
        return;
      }

      setRegisteredEmail(values.email);
      setStep('verification');
      toast.success('Account created', { description: 'Check your email to verify your account.' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setServerError(message);
      toast.error('Registration failed', { description: message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    if (!accepted) {
      setShowTermsError(true);
      return;
    }
    try {
      await signIn('google', { callbackUrl: '/auth/complete-profile' });
    } catch (err: unknown) {
      toast.error('Google registration failed', {
        description: err instanceof Error ? err.message : 'Something went wrong. Please try again.',
      });
    }
  };
  return (
      <div className="min-h-screen bg-transparent flex items-center justify-center p-4 relative">
        {/* Ambient accent glow — kept even on a transparent page background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-cyan-500/10 rounded-full blur-3xl"></div>
        </div>

        <Card className="w-full max-w-md glass shadow-2xl shadow-black/20 relative z-10">
          <CardHeader className="space-y-1">
            <div className="text-xs font-mono text-muted-foreground mb-2">PAYSUIT.AUTH</div>
            <CardTitle className="text-3xl font-bold">Register</CardTitle>
            <CardDescription>Create your Paysuit platform account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {serverError && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                  {serverError}
                </div>
            )}

            {step === 'initial' && (
                <div className="space-y-3">
                  <TermsCheckbox
                      checked={accepted}
                      onChange={(v) => { setAccepted(v); if (v) setShowTermsError(false); }}
                      showError={showTermsError}
                  />

                  <button
                      onClick={handleGoogleRegister}
                      className="w-full rounded-full bg-white/5 hover:bg-white/10 h-10 transition-colors flex items-center justify-center gap-2 border border-white/10 backdrop-blur-sm"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                          fill="currentColor"
                          d="M12.545 10.239v3.821h5.445c-0.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.033s2.701-6.033 6.033-6.033c1.498 0 2.866 0.549 3.921 1.453l2.814-2.814c-1.969-1.833-4.616-2.955-7.735-2.955-6.329 0-11.45 5.121-11.45 11.45s5.121 11.45 11.45 11.45c6.038 0 11.315-4.949 11.315-11.45 0-0.811-0.101-1.594-0.278-2.354h-11.037z"
                      />
                    </svg>
                    <span className="text-sm font-medium">Register with Google</span>
                  </button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="px-2 bg-transparent text-muted-foreground">Or continue with email</span>
                    </div>
                  </div>

                  <Button
                      onClick={() => {
                        if (!accepted) { setShowTermsError(true); return; }
                        setStep('form');
                      }}
                      className="w-full rounded-full h-10 font-semibold"
                  >
                    Email Registration
                  </Button>
                </div>
            )}

            {step === 'form' && (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                  <div className="space-y-2">
                    <label className="text-xs uppercase font-mono text-muted-foreground">Name</label>
                    <Input
                        type="text"
                        placeholder="Your full name"
                        disabled={isLoading}
                        {...register('name')}
                    />
                    {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs uppercase font-mono text-muted-foreground">Username</label>
                    <Input
                        type="text"
                        placeholder="your_username"
                        disabled={isLoading}
                        {...register('username')}
                    />
                    {errors.username && <p className="text-xs text-destructive">{errors.username.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs uppercase font-mono text-muted-foreground">Email</label>
                    <Input
                        type="email"
                        placeholder="user@domain.net"
                        disabled={isLoading}
                        {...register('email')}
                    />
                    {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs uppercase font-mono text-muted-foreground">Password</label>
                    <Input
                        type="password"
                        placeholder="••••••••"
                        disabled={isLoading}
                        {...register('password')}
                    />
                    {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs uppercase font-mono text-muted-foreground">Confirm Password</label>
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

                  <TermsCheckbox
                      checked={accepted}
                      onChange={(v) => { setAccepted(v); if (v) setShowTermsError(false); }}
                      disabled={isLoading}
                      showError={showTermsError}
                  />

                  <div className="flex gap-2">
                    <Button
                        type="button"
                        onClick={() => setStep('initial')}
                        disabled={isLoading}
                        variant="outline"
                        className="flex-1 rounded-full"
                    >
                      Back
                    </Button>
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 rounded-full font-semibold disabled:opacity-50"
                    >
                      {isLoading ? 'Creating...' : 'Create Account'}
                    </Button>
                  </div>
                </form>
            )}

            {step === 'verification' && (
                <div className="space-y-4 text-center">
                  <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-4">
                    <p className="text-green-500 font-medium mb-2">Check your email!</p>
                    <p className="text-sm text-green-500/80">
                      We&apos;ve sent a verification link to <span className="font-semibold">{registeredEmail}</span>
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Click the link in your email to verify your account and complete registration.
                  </p>
                  <Button onClick={() => setStep('initial')} variant="outline" className="w-full rounded-full">
                    Back to Registration
                  </Button>
                </div>
            )}

            {step !== 'verification' && (
                <div className="text-center text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Link href="/auth/login" className="text-primary hover:underline transition-colors">
                    Sign in
                  </Link>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
  );
}
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/features/auth/AuthContext';
import { Button } from '@/components/ui/Button';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'no-token'>('verifying');
  const [message, setMessage] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('no-token');
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Verification failed');
        }

        setStatus('success');
        setMessage(data.message);

        // Refresh user data
        if (refreshUser) {
          await refreshUser();
        }

        // Redirect after 3 seconds
        setTimeout(() => {
          router.push('/');
        }, 3000);
      } catch (err) {
        setStatus('error');
        setMessage(err instanceof Error ? err.message : 'Verification failed');
      }
    };

    verifyEmail();
  }, [token, refreshUser, router]);

  const handleResend = async () => {
    setIsResending(true);
    setResendMessage('');

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend');
      }

      setResendMessage('Verification email sent! Check your inbox.');
    } catch (err) {
      setResendMessage(err instanceof Error ? err.message : 'Failed to resend');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="container mx-auto flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="rounded-xl bg-zinc-900 p-8 text-center">
          {status === 'verifying' && (
            <>
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
              <h1 className="text-2xl font-bold text-white">Verifying your email...</h1>
              <p className="mt-2 text-zinc-400">Please wait while we verify your email address.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                <svg
                  className="h-6 w-6 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white">Email Verified!</h1>
              <p className="mt-2 text-zinc-400">{message}</p>
              <p className="mt-4 text-sm text-zinc-500">Redirecting you to the home page...</p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
                <svg
                  className="h-6 w-6 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white">Verification Failed</h1>
              <p className="mt-2 text-red-400">{message}</p>

              {user && !user.twoFactorEnabled && (
                <div className="mt-6">
                  <Button onClick={handleResend} disabled={isResending}>
                    {isResending ? 'Sending...' : 'Resend Verification Email'}
                  </Button>
                  {resendMessage && (
                    <p className="mt-2 text-sm text-zinc-400">{resendMessage}</p>
                  )}
                </div>
              )}

              <div className="mt-4">
                <Link href="/" className="text-sm text-blue-400 hover:text-blue-300">
                  Return to Home
                </Link>
              </div>
            </>
          )}

          {status === 'no-token' && (
            <>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/10">
                <svg
                  className="h-6 w-6 text-yellow-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white">Email Verification</h1>
              <p className="mt-2 text-zinc-400">
                {user && !user.twoFactorEnabled
                  ? "Your email hasn't been verified yet."
                  : 'No verification token provided.'}
              </p>

              {user && (
                <div className="mt-6">
                  <Button onClick={handleResend} disabled={isResending}>
                    {isResending ? 'Sending...' : 'Send Verification Email'}
                  </Button>
                  {resendMessage && (
                    <p className="mt-2 text-sm text-zinc-400">{resendMessage}</p>
                  )}
                </div>
              )}

              <div className="mt-4">
                <Link href="/" className="text-sm text-blue-400 hover:text-blue-300">
                  Return to Home
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto flex min-h-[80vh] items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="rounded-xl bg-zinc-900 p-8 text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
            <h1 className="text-2xl font-bold text-white">Loading...</h1>
          </div>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Input } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import {
  loadGoogleScript,
  initializeGoogleSignIn,
  renderGoogleButton,
  decodeGoogleToken,
  type GoogleCredentialResponse,
} from '@/lib/google-auth';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

export default function LoginPage() {
  const router = useRouter();
  const { login, loginWithGoogle, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    const setupGoogle = async () => {
      if (!GOOGLE_CLIENT_ID) {
        console.warn('Google Client ID not configured');
        return;
      }

      try {
        await loadGoogleScript();

        const handleGoogleResponse = async (response: GoogleCredentialResponse) => {
          setIsGoogleLoading(true);
          setError(null);
          try {
            const decoded = decodeGoogleToken(response.credential);
            await loginWithGoogle(response.credential, decoded.email, decoded.name);
            router.push('/');
          } catch (err) {
            console.error('Google login error:', err);
            setError('Google sign-in failed. Please try again.');
          } finally {
            setIsGoogleLoading(false);
          }
        };

        initializeGoogleSignIn(GOOGLE_CLIENT_ID, handleGoogleResponse);

        if (googleButtonRef.current) {
          renderGoogleButton(googleButtonRef.current);
        }
      } catch (err) {
        console.error('Failed to setup Google Sign-In:', err);
      }
    };

    setupGoogle();
  }, [loginWithGoogle, router]);

  if (isAuthenticated) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(email, password);
      router.push('/');
    } catch (err) {
      setError('Invalid email or password');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-black">ShortSNS</h1>
          <p className="text-gray-500 mt-2">Share your thoughts with the world</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            id="email"
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
          <Input
            type="password"
            id="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
            Log in
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-500">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-black font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </div>

        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-4 flex justify-center">
            {isGoogleLoading ? (
              <div className="h-[44px] flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
              </div>
            ) : (
              <div ref={googleButtonRef} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

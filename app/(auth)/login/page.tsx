'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  const { loginWithGoogle, isAuthenticated, isLoading: authLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    const setupGoogle = async () => {
      if (!GOOGLE_CLIENT_ID) {
        console.error('Google Client ID not configured');
        setError('Google認証の設定が必要です');
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
            setError('ログインに失敗しました。もう一度お試しください。');
          } finally {
            setIsGoogleLoading(false);
          }
        };

        initializeGoogleSignIn(GOOGLE_CLIENT_ID, handleGoogleResponse);
        setIsScriptLoaded(true);

        if (googleButtonRef.current) {
          renderGoogleButton(googleButtonRef.current, {
            size: 'large',
            text: 'continue_with',
            width: 280,
          });
        }
      } catch (err) {
        console.error('Failed to setup Google Sign-In:', err);
        setError('Google認証の読み込みに失敗しました');
      }
    };

    setupGoogle();
  }, [loginWithGoogle, router]);

  useEffect(() => {
    if (isScriptLoaded && googleButtonRef.current) {
      renderGoogleButton(googleButtonRef.current, {
        size: 'large',
        text: 'continue_with',
        width: 280,
      });
    }
  }, [isScriptLoaded]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-black">ShortSNS</h1>
          <p className="text-gray-500 mt-2">Share your thoughts with the world</p>
        </div>

        <div className="flex flex-col items-center">
          {error && (
            <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
          )}

          {isGoogleLoading ? (
            <div className="h-[44px] flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
              <span className="ml-2 text-gray-600">ログイン中...</span>
            </div>
          ) : (
            <div ref={googleButtonRef} className="flex justify-center" />
          )}

          <p className="mt-6 text-xs text-gray-400 text-center max-w-xs">
            ログインすることで、利用規約とプライバシーポリシーに同意したものとみなされます。
          </p>
        </div>
      </div>
    </div>
  );
}

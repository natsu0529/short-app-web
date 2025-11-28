'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Google認証のみのため、登録ページはログインページにリダイレクト
export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login');
  }, [router]);

  return null;
}

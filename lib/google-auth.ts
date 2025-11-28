/**
 * Google Identity Services を使用したGoogle認証
 */

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: GoogleIdConfig) => void;
          renderButton: (element: HTMLElement, options: GoogleButtonOptions) => void;
          prompt: () => void;
        };
      };
    };
  }
}

interface GoogleIdConfig {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
}

interface GoogleButtonOptions {
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  shape?: 'rectangular' | 'pill' | 'circle' | 'square';
  logo_alignment?: 'left' | 'center';
  width?: number;
  locale?: string;
}

export interface GoogleCredentialResponse {
  credential: string;
  select_by: string;
}

export interface DecodedGoogleToken {
  email: string;
  name: string;
  picture?: string;
  sub: string;
}

/**
 * Google ID トークンをデコード
 */
export function decodeGoogleToken(credential: string): DecodedGoogleToken {
  const base64Url = credential.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
  return JSON.parse(jsonPayload);
}

/**
 * Google Identity Services スクリプトを読み込む
 */
export function loadGoogleScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
    document.head.appendChild(script);
  });
}

/**
 * Google Sign-In を初期化
 */
export function initializeGoogleSignIn(
  clientId: string,
  callback: (response: GoogleCredentialResponse) => void
): void {
  if (!window.google?.accounts) {
    console.error('Google Identity Services not loaded');
    return;
  }

  window.google.accounts.id.initialize({
    client_id: clientId,
    callback,
    auto_select: false,
    cancel_on_tap_outside: true,
  });
}

/**
 * Google Sign-In ボタンをレンダリング
 */
export function renderGoogleButton(element: HTMLElement, options?: GoogleButtonOptions): void {
  if (!window.google?.accounts) {
    console.error('Google Identity Services not loaded');
    return;
  }

  window.google.accounts.id.renderButton(element, {
    theme: 'outline',
    size: 'large',
    text: 'continue_with',
    shape: 'rectangular',
    width: 320,
    ...options,
  });
}

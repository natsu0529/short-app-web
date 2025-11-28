/**
 * API Client for ShortSNS Backend
 *
 * 環境変数 NEXT_PUBLIC_API_BASE_URL で接続先を切り替え可能
 * - ローカル開発: http://localhost:8000/api
 * - デプロイ済み: https://your-api-domain.com/api
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

interface RequestOptions extends RequestInit {
  token?: string;
}

/**
 * APIリクエストのベース関数
 */
async function fetchAPI(
  endpoint: string,
  options: RequestOptions = {}
): Promise<Response> {
  const { token, headers, ...restOptions } = options;

  const url = `${API_BASE_URL}${endpoint}`;

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    defaultHeaders['Authorization'] = `Token ${token}`;
  }

  const response = await fetch(url, {
    ...restOptions,
    headers: {
      ...defaultHeaders,
      ...headers,
    },
  });

  return response;
}

/**
 * APIクライアント
 */
export const api = {
  /**
   * GETリクエスト
   */
  get: async <T>(endpoint: string, options?: RequestOptions): Promise<T> => {
    const response = await fetchAPI(endpoint, { ...options, method: 'GET' });
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * POSTリクエスト
   */
  post: async <T>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<T> => {
    const response = await fetchAPI(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `API Error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`
      );
    }
    return response.json();
  },

  /**
   * PUTリクエスト
   */
  put: async <T>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<T> => {
    const response = await fetchAPI(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * PATCHリクエスト
   */
  patch: async <T>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<T> => {
    const response = await fetchAPI(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * DELETEリクエスト
   */
  delete: async (endpoint: string, options?: RequestOptions): Promise<void> => {
    const response = await fetchAPI(endpoint, { ...options, method: 'DELETE' });
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
  },
};

/**
 * 現在のAPI Base URLを取得
 */
export function getAPIBaseURL(): string {
  return API_BASE_URL;
}

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

# ShortSNS Web Application

短文投稿型SNSのフロントエンドアプリケーション

## 環境設定

### バックエンドAPI設定

`.env.local` ファイルを作成して、バックエンドAPIのURLを設定してください：

```bash
# .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
```

#### 環境別の設定

- **ローカル開発**: `http://localhost:8000/api`
- **デプロイ済み**: `https://your-api-domain.com/api`

`.env.example` をコピーして `.env.local` を作成できます：

```bash
cp .env.example .env.local
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## API使用方法

### APIクライアントの使い方

`lib/services.ts` で定義されているサービス関数を使用してAPIを呼び出せます：

```typescript
import { userService, postService, timelineService } from '@/lib/services';

// ユーザー一覧を取得
const users = await userService.getUsers({ page: 1, page_size: 20 });

// タイムラインを取得
const timeline = await timelineService.getTimeline({ tab: 'latest' });

// 投稿を作成（認証が必要）
const post = await postService.createPost(
  { context: 'Hello, world!' },
  'your-auth-token'
);
```

### 利用可能なサービス

- `userService` - ユーザー関連API
- `postService` - 投稿関連API
- `followService` - フォロー関連API
- `likeService` - いいね関連API
- `timelineService` - タイムライン関連API
- `searchService` - 検索関連API
- `rankingService` - ランキング関連API

詳細なAPI仕様は `docs/` ディレクトリを参照してください。

## プロジェクト構成

```
├── app/                # Next.js App Router
│   ├── favicon.ico     # ファビコン
│   ├── globals.css     # グローバルスタイル
│   ├── layout.tsx      # ルートレイアウト
│   └── page.tsx        # ホームページ
├── lib/                # ユーティリティ・ヘルパー
│   ├── api.ts          # APIクライアント
│   ├── types.ts        # TypeScript型定義
│   └── services.ts     # APIサービス関数
├── docs/               # APIドキュメント
└── public/             # 静的ファイル
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

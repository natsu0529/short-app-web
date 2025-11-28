// public/firebase-messaging-sw.js

// Firebaseのライブラリ（Service Worker用）を読み込み
// ※バージョンは適宜最新に保つのが良いですが、compat版を使います
importScripts(
  "https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js"
);

// ⚠️ Service Worker内では process.env が使えないため、直書きします
// 公開されても問題ない識別子のみなのでセキュリティ上は許容範囲です
const firebaseConfig = {
  apiKey: "AIzaSyA1WogFGn2VaJqyGwC22Uqe6YEWIpIoudg",
  authDomain: "short-app-c6b19.firebaseapp.com",
  projectId: "short-app-c6b19",
  storageBucket: "short-app-c6b19.firebasestorage.app",
  messagingSenderId: "770839644964",
  appId: "1:770839644964:web:32751a51ae461917ab81b1",
  measurementId: "G-RVKYYB6289",
};

// Firebaseの初期化
firebase.initializeApp(firebaseConfig);

// メッセージング機能の取得
const messaging = firebase.messaging();

// ■ バックグラウンド（アプリを閉じている時や裏側の時）の通知受信処理
messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );

  // 通知のタイトルと本文を取得
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/icon.png", // publicフォルダに icon.png があれば表示されます
    // ユーザーが通知をクリックした時の挙動などをここに書けます
  };

  // ブラウザ標準の通知を表示
  return self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );
});

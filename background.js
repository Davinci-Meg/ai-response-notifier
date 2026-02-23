// ========================================
// Background Service Worker
// ========================================
// webRequest API で各AIサービスのレスポンス完了を検出し、
// タブが非アクティブなら通知を表示する。
// リクエスト/レスポンスの中身には一切アクセスしない。

// --- サービス定義 ---
// 各サービスのドメインへのPOSTリクエストで、
// レスポンスに一定時間以上かかったものをAI応答と判定する。
// URLパターンは広めに取り、短時間リクエストをフィルタすることで誤検出を防ぐ。
const SERVICES = [
  {
    name: "Claude",
    hostPattern: "claude.ai",
    urlPatterns: ["https://claude.ai/*"],
    // 最低レスポンス時間（ms）。これ未満は無視
    minDuration: 2000,
  },
  {
    name: "ChatGPT",
    hostPattern: "chatgpt.com",
    urlPatterns: ["https://chatgpt.com/*"],
    minDuration: 2000,
  },
  {
    name: "Gemini",
    hostPattern: "gemini.google.com",
    urlPatterns: ["https://gemini.google.com/*"],
    minDuration: 2000,
  },
];

// 全サービスのURLパターン
const ALL_URL_PATTERNS = SERVICES.flatMap((s) => s.urlPatterns);

// URLからサービスを特定
function detectService(url) {
  for (const service of SERVICES) {
    if (url.includes(service.hostPattern)) {
      return service;
    }
  }
  return null;
}

// 進行中のリクエストを追跡
// key: requestId, value: { tabId, startTime, service }
const pendingRequests = new Map();

// タブごとの最新通知タイマー（連続通知を防ぐデバウンス）
// key: tabId, value: timeoutId
const tabDebounce = new Map();

// 通知IDとタブIDの紐付け
// key: notificationId, value: tabId
const notificationTabMap = new Map();

// --- POSTリクエストの開始を検出 ---
chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    if (details.method !== "POST") return;

    const service = detectService(details.url);
    if (!service) return;

    pendingRequests.set(details.requestId, {
      tabId: details.tabId,
      startTime: Date.now(),
      service,
    });
  },
  { urls: ALL_URL_PATTERNS }
);

// --- リクエスト完了を検出 ---
chrome.webRequest.onCompleted.addListener(
  (details) => {
    const pending = pendingRequests.get(details.requestId);
    if (!pending) return;

    pendingRequests.delete(details.requestId);
    const elapsed = Date.now() - pending.startTime;

    // 短いリクエストは無視（メタデータ等のAPI呼び出し）
    if (elapsed < pending.service.minDuration) return;

    console.log(
      `[AI Notifier] [${pending.service.name}] リクエスト完了 (${elapsed}ms, tab: ${pending.tabId})`
    );

    // デバウンス: 同じタブで連続する完了イベントをまとめる
    // （1つの応答で複数のAPIリクエストが発生する場合がある）
    const tabId = pending.tabId;
    const serviceName = pending.service.name;

    if (tabDebounce.has(tabId)) {
      clearTimeout(tabDebounce.get(tabId));
    }

    tabDebounce.set(
      tabId,
      setTimeout(() => {
        tabDebounce.delete(tabId);
        checkTabAndNotify(tabId, serviceName);
      }, 1000)
    );
  },
  { urls: ALL_URL_PATTERNS }
);

// --- リクエストエラー時のクリーンアップ ---
chrome.webRequest.onErrorOccurred.addListener(
  (details) => {
    pendingRequests.delete(details.requestId);
  },
  { urls: ALL_URL_PATTERNS }
);

// --- タブの状態を確認して通知 ---
async function checkTabAndNotify(tabId, serviceName) {
  try {
    const tab = await chrome.tabs.get(tabId);

    if (tab.active) {
      const window = await chrome.windows.get(tab.windowId);
      if (window.focused) {
        console.log(`[AI Notifier] [${serviceName}] タブがアクティブ → 通知スキップ`);
        return;
      }
    }

    console.log(`[AI Notifier] [${serviceName}] タブ非アクティブ → 通知送信`);
    const notificationId = `ai-response-${Date.now()}`;

    notificationTabMap.set(notificationId, tabId);

    chrome.notifications.create(notificationId, {
      type: "basic",
      iconUrl: "icon128.png",
      title: `${serviceName} responded`,
      message: "新しい回答が届いています。クリックして確認しましょう。",
      priority: 2,
    });
  } catch (e) {
    console.log(`[AI Notifier] タブ状態確認エラー: ${e.message}`);
  }
}

// --- 通知クリックで元のタブにフォーカス ---
chrome.notifications.onClicked.addListener((notificationId) => {
  const tabId = notificationTabMap.get(notificationId);
  notificationTabMap.delete(notificationId);

  if (tabId != null) {
    chrome.tabs.get(tabId, (tab) => {
      if (chrome.runtime.lastError) {
        console.log("[AI Notifier] 元のタブが見つかりません");
        return;
      }
      chrome.tabs.update(tabId, { active: true });
      chrome.windows.update(tab.windowId, { focused: true });
    });
  }

  chrome.notifications.clear(notificationId);
});

// --- 古いデータのクリーンアップ（5分以上経過） ---
setInterval(() => {
  const now = Date.now();
  for (const [id, data] of pendingRequests) {
    if (now - data.startTime > 5 * 60 * 1000) {
      pendingRequests.delete(id);
    }
  }
  for (const [notifId] of notificationTabMap) {
    const match = notifId.match(/ai-response-(\d+)/);
    if (match && now - parseInt(match[1]) > 5 * 60 * 1000) {
      notificationTabMap.delete(notifId);
    }
  }
}, 60 * 1000);

console.log("[AI Notifier] Background service worker 起動 ✅");

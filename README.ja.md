# 🔔 Claude Response Notifier

Claude (claude.ai) の応答生成が完了したときにデスクトップ通知を送るChrome拡張機能です。別のタブで作業中でも返信を見逃しません。

![Chrome](https://img.shields.io/badge/Chrome-拡張機能-blue?logo=googlechrome)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

> 🌐 [English](README.md)

## ✨ 機能

- **応答完了の自動検知** — `webRequest` APIを使用してClaudeの応答完了を検知
- **スマート通知** — Claudeのタブが非アクティブのときだけ通知
- **クリックでフォーカス** — 通知をクリックするとClaudeのタブに戻る
- **データアクセスなし** — 会話内容やリクエスト/レスポンスの中身は一切読み取りません
- **最小限の権限** — `notifications`、`webRequest`、`claude.ai`への`host_permissions`のみ使用

## 📦 インストール

Chrome ウェブストアには公開していないため、手動でインストールしてください：

1. **ダウンロード**
   - 緑色の **Code** ボタン → **Download ZIP** をクリック、または
   - `git clone https://github.com/Davinci-Meg/claude-response-notifier.git`
2. 必要に応じてZIPファイルを解凍
3. **Chrome** を開き、`chrome://extensions/` にアクセス
4. 右上の **デベロッパーモード** を有効にする
5. **パッケージ化されていない拡張機能を読み込む** をクリック
6. `manifest.json` が含まれるフォルダを選択
7. [claude.ai](https://claude.ai) を開き、プロンプトが表示されたら **通知を許可** する

## 🚀 使い方

1. [claude.ai](https://claude.ai) を開いてメッセージを送信
2. Claudeが応答を生成している間に別のタブに切り替える
3. 応答が完了するとデスクトップ通知が表示される
4. 通知をクリックするとClaudeのタブに戻る

### Windows ユーザーへ

通知がアクションセンターには表示されるが、ポップアップバナーとして表示されない場合：

1. **設定 → システム → 通知** を開く
2. アプリ一覧から **Google Chrome** を探す
3. **バナー** 通知が有効になっていることを確認
4. **集中モード / 応答不可** がオンの場合はオフにする

## 🔒 プライバシーとセキュリティ

この拡張機能はプライバシーを最優先に設計されています：

- **データ収集なし** — 何も収集・保存・送信しません
- **会話へのアクセスなし** — チャット内容は読み取りません。URLパターンとリクエストのタイミングのみを確認
- **外部通信なし** — 外部サーバーへの通信は一切行いません
- **最小限の権限** — 機能に必要な権限のみを使用
- **オープンソース** — すべてのコードを公開・監査可能

| 権限 | 必要な理由 |
|---|---|
| `notifications` | デスクトップ通知を表示するため |
| `webRequest` | ClaudeのAPIリクエスト完了を検知するため（URLパターンのみ） |
| `host_permissions: claude.ai` | 対象をclaude.aiのみに制限するため |

## 🛠 仕組み

1. `background.js` が `chrome.webRequest.onBeforeRequest` でClaudeの補完エンドポイントへのPOSTリクエストを検知
2. `chrome.webRequest.onCompleted` でリクエストの完了を検知
3. `chrome.tabs` APIでClaudeのタブが現在アクティブかどうかを確認
4. タブが非アクティブの場合、`chrome.notifications` でデスクトップ通知を表示
5. 1秒未満のリクエストは誤検知を避けるため無視

## 📄 ライセンス

MIT License — 詳細は [LICENSE](LICENSE) を参照してください。

# 🔔 AI Response Notifier

A Chrome extension that sends you a desktop notification when **Claude**, **ChatGPT**, or **Gemini** finishes generating a response — so you never miss a reply while working in another tab.

![Chrome](https://img.shields.io/badge/Chrome-Extension-blue?logo=googlechrome)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

> 🌐 [日本語](README.ja.md)

## ✨ Features

- **Multi-service support** — Works with Claude (claude.ai), ChatGPT (chatgpt.com), and Gemini (gemini.google.com)
- **Auto-detect completion** — Monitors when AI finishes responding using the `webRequest` API
- **Smart notifications** — Only notifies you when the AI tab is *not* active
- **Click to focus** — Click the notification to jump back to the exact tab that received the response
- **Zero data access** — Never reads your conversations or request/response content
- **Minimal permissions** — Only uses `notifications`, `webRequest`, and host permissions for supported sites

## 🤖 Supported Services

| Service | URL |
|---|---|
| Claude | https://claude.ai |
| ChatGPT | https://chatgpt.com |
| Gemini | https://gemini.google.com |

## 📦 Installation

1. **Download** this repository
   - Click the green **Code** button → **Download ZIP**, or
   - `git clone https://github.com/Davinci-Meg/ai-response-notifier.git`
2. Unzip the file if needed
3. Open **Chrome** and go to `chrome://extensions/`
4. Enable **Developer mode** (toggle in the top-right corner)
5. Click **Load unpacked**
6. Select the folder containing `manifest.json`
7. Open any supported AI chat site and **allow notifications** when prompted

## 🚀 Usage

1. Open any supported AI chat site and send a message
2. Switch to another tab while the AI is generating a response
3. A desktop notification will appear when the response is ready
4. Click the notification to jump back to the correct tab

### Windows Users

If notifications appear in the Action Center but not as pop-up banners:

1. Go to **Settings → System → Notifications**
2. Find **Google Chrome** in the app list
3. Make sure **Banner** notifications are enabled
4. Turn off **Focus Assist / Do Not Disturb** if it's on

## 🔒 Privacy & Security

This extension is designed with privacy as a core principle:

- **No data collection** — Nothing is collected, stored, or transmitted
- **No conversation access** — Your chats are never read; only URL patterns and request timing are checked
- **No external communication** — The extension never contacts any external server
- **Minimal permissions** — Only the permissions strictly necessary for functionality
- **Open source** — All code is publicly auditable

| Permission | Why it's needed |
|---|---|
| `notifications` | To show desktop notifications |
| `webRequest` | To detect when API requests complete (URL pattern only) |
| `host_permissions` | To restrict access to supported AI chat sites only |

## 🛠 How It Works

1. `background.js` uses `chrome.webRequest.onBeforeRequest` to detect POST requests to each service's API endpoint
2. `chrome.webRequest.onCompleted` detects when the request finishes
3. `chrome.tabs` API checks if the originating tab is currently active
4. If the tab is not active, `chrome.notifications` displays a desktop notification with the service name
5. Requests shorter than 1 second are ignored to avoid false positives

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

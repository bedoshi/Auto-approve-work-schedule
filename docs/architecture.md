# アーキテクチャ

## 全体構成

```
┌─────────────────────────────────┐
│  Chrome Extension               │
│                                 │
│  ┌──────────────┐               │
│  │ popup.html   │ ← ユーザー操作 │
│  │ popup.js     │               │
│  └──────┬───────┘               │
│         │ executeScript         │
│         ▼                       │
│  ┌──────────────┐               │
│  │ utils.js     │ (1st inject)  │
│  │ content.js   │ (2nd inject)  │
│  └──────────────┘               │
│         │ DOM操作               │
│         ▼                       │
│  ┌──────────────┐               │
│  │ 対象Webページ │               │
│  └──────────────┘               │
└─────────────────────────────────┘
```

## コンポーネント

### popup.html / popup.js

ユーザーが拡張機能アイコンをクリックしたときに表示されるポップアップ。

- 「承認処理開始」ボタンと処理結果表示エリアを持つ
- ボタンクリック時に `chrome.scripting.executeScript` を呼び出し、アクティブなタブに `utils.js` と `content.js` を順番に注入する
- 注入したスクリプトの戻り値（`{ success, message }`）を受け取り、ステータス表示を更新する
- 処理中はボタンを `disabled` にし、多重実行を防ぐ

### utils.js

content.js から呼び出されるユーティリティ関数群。popup.js による注入時に content.js より先に実行され、グローバル関数として定義される。

| 関数 | 概要 |
|------|------|
| `sleep(ms)` | 指定ミリ秒待機する |
| `waitForElement(selector, timeout)` | セレクタに一致する要素が現れるまでポーリングする（デフォルト5秒） |
| `waitForModalClose(timeout)` | `.MuiDialog-root` が消えるまでポーリングする（デフォルト5秒） |

### content.js

承認処理のメインロジック。即時実行関数（IIFE）として実装されており、処理結果を `{ success: boolean, message: string }` で返す。

## スクリプト注入の仕組み

`popup.js` は `chrome.scripting.executeScript` の `files` オプションで複数ファイルを指定する。

```javascript
chrome.scripting.executeScript({
  target: { tabId: tab.id },
  files: ['utils.js', 'content.js'],
});
```

- ファイルは配列順に実行される（utils.js → content.js）
- 同一の Isolated World で実行されるため、utils.js で定義したグローバル関数を content.js から参照できる
- `executeScript` の戻り値は最後に実行されたスクリプト（content.js）の返り値

## パーミッション

`manifest.json` で宣言しているパーミッション：

| パーミッション | 用途 |
|---|---|
| `activeTab` | ボタンクリック時にアクティブタブの情報を取得 |
| `scripting` | `chrome.scripting.executeScript` でスクリプトを注入 |
| `storage` | （将来利用予定） |
| `host_permissions: <all_urls>` | 任意のページへのスクリプト注入を許可 |

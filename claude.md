# Claude Code開発ガイド

このファイルはClaude Codeが開発作業を行う際の参考情報です。

## 開発ルール

- ファイルを変更・追加・削除した際は、必要に応じて `README.md` を更新すること。
  具体的には、機能概要・ファイル構成・使い方・対象システム仕様などが実態と乖離している場合に修正する。

## プロジェクト概要

勤務表の日次承認を自動化するChrome拡張機能。ユーザーがブラウザ上で拡張機能アイコンをクリックすると、自動承認処理が開始される。

## 技術スタック

- **プラットフォーム**: Chrome Extension (Manifest V3)
- **言語**: JavaScript (バニラJS、フレームワーク不使用)
- **対象UI**: Material-UI (MUI) を使用したWebアプリケーション
- **主要API**:
  - Chrome Extension APIs (tabs, scripting, storage)
  - DOM manipulation
  - async/await for asynchronous operations

## アーキテクチャ

### コンポーネント構成

1. **popup.html / popup.js**: ユーザーインターフェース
   - 「承認処理開始」ボタンを提供
   - `chrome.scripting.executeScript` で `utils.js` → `content.js` の順に注入

2. **utils.js**: 共通ユーティリティ
   - `sleep(ms)`: 指定ミリ秒待機
   - `waitForElement(selector, timeout)`: 要素が現れるまで待機
   - `waitForModalClose(timeout)`: モーダルが閉じるまで待機

3. **content.js**: メイン処理ロジック
   - 日次ページでの承認ボタン検出とクリック
   - モーダル確認ボタンの処理
   - エラーハンドリングと処理結果の返却

## 勤務表システムの仕様

### ページ構成
- **日次ページ**: 日付ごとの勤務タスク詳細。承認ボタンはこのページにのみ存在
- **月次ページ**: 当月の勤務時間一覧（ユーザー入力・システム記録の2種類）

### 承認処理フロー

```
1. button.MuiButton-outlined で承認ボタンを全取得
   └─ テキストが「承認」のものに絞り込む
2. 各ボタンに対してループ:
   a. 承認ボタンをクリック
   b. .MuiDialog-root[role="presentation"] が現れるのを待つ
   c. モーダル内の button.MuiButton-contained「承認」をクリック
   d. モーダルが消えるのを待つ
   e. 500ms 待機
3. 完了後、成功・失敗件数を返す
```

### セレクタ

#### 日次ページの承認ボタン
```javascript
const approvalButtons = Array.from(document.querySelectorAll('button.MuiButton-outlined'))
  .filter(btn => btn.textContent.trim() === '承認');
```

#### モーダルと確認ボタン
```javascript
const modal = document.querySelector('.MuiDialog-root[role="presentation"]');
const modalButton = Array.from(modal.querySelectorAll('button.MuiButton-contained'))
  .find(btn => btn.textContent.trim() === '承認');
```

#### 日付情報（hidden input）
```javascript
const workYMD = form.querySelector('input[name="workYMD"]').value; // 例: "2026-02-24"
```

## コーディングスタイル

- 非同期処理は `async/await` を使用
- 変数名・関数名は英語 camelCase
- エラーメッセージは日本語でよい
- 各関数に簡潔なコメントを付ける
- エラーが発生しても処理を継続し、最後に成功・失敗件数を報告する

## 将来対応予定

- ユーザー入力時間とシステム記録時間の差分チェック（15分以上の差異がある場合は警告）
- 時間差異がある場合のコメント確認機能
- 月次ページへの遷移と連携処理

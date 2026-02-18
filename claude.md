# Claude Code開発ガイド

このファイルはClaude Codeが開発作業を行う際の参考情報です。

## プロジェクト概要

勤務表の日次承認を自動化するChrome拡張機能。ユーザーがブラウザ上で拡張機能アイコンをクリックすると、自動承認処理が開始される。

## 技術スタック

- **プラットフォーム**: Chrome Extension (Manifest V3)
- **言語**: JavaScript (バニラJS、フレームワーク不使用)
- **主要API**: 
  - Chrome Extension APIs (tabs, scripting, storage)
  - DOM manipulation
  - async/await for asynchronous operations

## アーキテクチャ

### コンポーネント構成

1. **popup.html/popup.js**: ユーザーインターフェース
   - 「承認処理開始」ボタンを提供
   - chrome.scripting.executeScriptでcontent.jsを注入

2. **content.js**: メイン処理ロジック
   - 日次ページでの承認ボタン検出とクリック
   - モーダル確認ボタンの処理
   - 月次ページへの遷移と時間差異チェック
   - 承認結果のレポート生成

## 勤務表システムの仕様

### ページ遷移
- 日次ページ ↔ 月次ページ（「月次」ボタンでトグル切り替え）
- 承認処理は日次ページで実行
- 時間チェックは月次ページで実行

### データ構造

#### 日次ページ
- 各日付に対して承認ボタンが存在
- 承認ボタンクリック → モーダル表示 → モーダル内確認ボタンクリック

#### 月次ページ
各日付行に以下の情報が表示される:
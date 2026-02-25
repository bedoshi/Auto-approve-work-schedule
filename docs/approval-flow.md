# 承認処理フロー

## 処理の起点

ユーザーがポップアップの「承認処理開始」ボタンをクリックすると処理が始まる。

## フロー概要

```
ボタンクリック
  │
  ├─ [popup.js] ボタンを disabled に変更・「処理中...」を表示
  │
  ├─ [popup.js] アクティブタブに utils.js → content.js を注入
  │
  └─ [content.js] 以下の処理を実行
       │
       ├─ 1. 承認ボタンを全件取得
       │
       └─ 2. 各ボタンに対してループ
            ├─ a. 承認ボタンをクリック
            ├─ b. モーダルが開くのを待つ（最大5秒）
            ├─ c. モーダル内の確認ボタンをクリック
            ├─ d. モーダルが閉じるのを待つ（最大5秒）
            ├─ e. 500ms 待機
            └─ f. エラー時は failCount++ して次へ継続

  └─ [popup.js] 結果メッセージを受け取り表示・ボタンを再有効化
```

## 各ステップの詳細

### 1. 承認ボタンの取得

```javascript
const approvalButtons = Array.from(document.querySelectorAll('button.MuiButton-outlined'))
  .filter((btn) => btn.textContent.trim() === '承認');
```

- `button.MuiButton-outlined` クラスを持つ全ボタンを取得
- テキストが厳密に `承認` のものだけに絞り込む（前後の空白は trim で除去）
- 0件の場合は即座に `{ success: false, message: '承認ボタンが見つかりませんでした' }` を返して終了

### 2a. 承認ボタンのクリック

```javascript
const form = approvalButtons[i].closest('form');
const workYMD = form?.querySelector('input[name="workYMD"]')?.value ?? '不明';
approvalButtons[i].click();
```

- ボタンの親フォーム内にある `input[name="workYMD"]` から処理対象の日付を取得（ログ出力用）
- ボタンを `.click()` で押下

### 2b. モーダルの待機

```javascript
const modal = await waitForElement('.MuiDialog-root[role="presentation"]');
```

- `waitForElement` が 100ms ごとにポーリング
- 5秒以内に要素が見つからない場合は Error をスロー → failCount++ で次の件へ

### 2c. モーダル内の確認ボタンのクリック

```javascript
const modalButton = Array.from(modal.querySelectorAll('button.MuiButton-contained'))
  .find((btn) => btn.textContent.trim() === '承認');
modalButton.click();
```

- モーダル（`.MuiDialog-root`）内の `button.MuiButton-contained` を検索
- テキストが `承認` のボタンが見つからない場合は Error をスロー

### 2d. モーダルが閉じるのを待つ

```javascript
await waitForModalClose();
```

- 100ms ごとに `.MuiDialog-root[role="presentation"]` の存在を確認
- 要素が存在しない・`display: none`・`offsetParent === null` のいずれかになれば完了
- 5秒以内に閉じない場合は Error をスロー

### 2e. 500ms 待機

```javascript
await sleep(500);
```

- 次の承認処理を開始する前のバッファ

## 処理結果

`content.js` は以下のオブジェクトを返す：

```javascript
{
  success: boolean,  // failCount === 0 のとき true
  message: string,   // 例: "処理完了 - 成功: 5件、失敗: 0件"
}
```

- `success: true` → ポップアップのメッセージが緑色で表示される
- `success: false` → ポップアップのメッセージが赤色で表示される

## コンソールログ

処理中は以下の形式でログが出力される：

```
Found 5 approval buttons
Processing approval 1/5
Modal opened, clicking confirm button
Modal closed
Approval 1 completed (workYMD: 2026-02-24)
Processing approval 2/5
...
All approvals processed
Success: 5, Failed: 0
```

エラーが発生した場合：

```
Processing approval 3/5
Approval 3 failed: モーダルが閉じませんでした (5000ms 経過)
Processing approval 4/5
...
```

## エラーハンドリング方針

- 各承認処理は個別の `try-catch` で囲まれている
- 1件でエラーが発生しても処理は継続し、次の件へ進む
- 全件処理完了後に成功・失敗件数をまとめて返す
- `failCount > 0` の場合は `success: false` となり、ポップアップに赤字でメッセージが表示される

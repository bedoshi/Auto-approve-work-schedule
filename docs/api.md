# API リファレンス

## utils.js

`utils.js` に定義されるユーティリティ関数。`popup.js` によって `content.js` より先に注入され、グローバル関数として利用できる。

---

### `sleep(ms)`

指定ミリ秒だけ処理を停止する。

**パラメータ**

| 名前 | 型 | 説明 |
|---|---|---|
| `ms` | `number` | 待機するミリ秒数 |

**戻り値**: `Promise<void>`

**使用例**

```javascript
await sleep(500); // 500ms 待機
```

---

### `waitForElement(selector, timeout?)`

セレクタに一致する要素が DOM に現れるまで待機する。100ms ごとにポーリングする。

**パラメータ**

| 名前 | 型 | デフォルト | 説明 |
|---|---|---|---|
| `selector` | `string` | - | CSS セレクタ |
| `timeout` | `number` | `5000` | タイムアウトまでのミリ秒数 |

**戻り値**: `Promise<Element>` — 見つかった要素

**エラー**: タイムアウトした場合 `Error` をスロー

```
要素が見つかりません: <selector> (<timeout>ms 経過)
```

**使用例**

```javascript
// モーダルが開くのを最大5秒待つ
const modal = await waitForElement('.MuiDialog-root[role="presentation"]');

// タイムアウトを短くする
const el = await waitForElement('#my-element', 2000);
```

---

### `waitForModalClose(timeout?)`

`.MuiDialog-root[role="presentation"]` が DOM から消えるか非表示になるまで待機する。100ms ごとにポーリングする。

以下のいずれかを満たすと「閉じた」と判定する：

- `.MuiDialog-root[role="presentation"]` が DOM に存在しない
- `element.style.display === 'none'`
- `element.offsetParent === null`（親要素が非表示）

**パラメータ**

| 名前 | 型 | デフォルト | 説明 |
|---|---|---|---|
| `timeout` | `number` | `5000` | タイムアウトまでのミリ秒数 |

**戻り値**: `Promise<void>`

**エラー**: タイムアウトした場合 `Error` をスロー

```
モーダルが閉じませんでした (<timeout>ms 経過)
```

**使用例**

```javascript
await waitForModalClose();       // デフォルト5秒
await waitForModalClose(10000);  // 最大10秒待つ
```

---

## content.js の戻り値

`content.js` は即時実行関数（IIFE）として実行され、`chrome.scripting.executeScript` の結果として以下のオブジェクトを返す。

```typescript
{
  success: boolean;  // 全件成功時 true、1件でも失敗時 false
  message: string;   // 処理結果のメッセージ
}
```

**メッセージ例**

| 状況 | `success` | `message` |
|---|---|---|
| 全件成功 | `true` | `処理完了 - 成功: 5件、失敗: 0件` |
| 一部失敗 | `false` | `処理完了 - 成功: 3件、失敗: 2件` |
| ボタン未検出 | `false` | `承認ボタンが見つかりませんでした` |
| 予期しないエラー | `false` | `不明なエラーが発生しました`（popup.js 側でフォールバック） |

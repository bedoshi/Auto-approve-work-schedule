/** 指定ミリ秒待機 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * セレクタに一致する要素が表示されるまで待つ
 * @param {string} selector
 * @param {number} timeout - ミリ秒
 * @returns {Promise<Element>}
 */
async function waitForElement(selector, timeout = 5000) {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    const el = document.querySelector(selector);
    if (el) return el;
    await sleep(100);
  }
  throw new Error(`要素が見つかりません: ${selector} (${timeout}ms 経過)`);
}

/**
 * モーダルが閉じるまで待つ
 * @param {number} timeout - ミリ秒
 * @returns {Promise<void>}
 */
async function waitForModalClose(timeout = 5000) {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    const modal = document.querySelector('.MuiDialog-root[role="presentation"]');
    if (!modal || modal.style.display === 'none' || !modal.offsetParent) {
      return;
    }
    await sleep(100);
  }
  throw new Error(`モーダルが閉じませんでした (${timeout}ms 経過)`);
}

if (typeof module !== 'undefined') {
  module.exports = { sleep, waitForElement, waitForModalClose };
}

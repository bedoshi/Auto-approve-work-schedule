const btn = document.getElementById('start-btn');
const statusEl = document.getElementById('status');

function setStatus(message, type = '') {
  statusEl.textContent = message;
  statusEl.className = type;
}

btn.addEventListener('click', async () => {
  btn.disabled = true;
  setStatus('処理中...');

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const mode = document.querySelector('input[name="approval-mode"]:checked').value;

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (m) => { window.__approvalMode = m; },
      args: [mode],
    });

    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['utils.js', 'content.js'],
    });

    const result = results?.[0]?.result;
    if (result?.success) {
      setStatus(result.message, 'success');
    } else {
      setStatus(result?.message ?? '不明なエラーが発生しました', 'error');
    }
  } catch (err) {
    setStatus(`エラー: ${err.message}`, 'error');
  } finally {
    btn.disabled = false;
  }
});

async function processOne(button) {
  const form = button.closest('form');
  const workYMD = form?.querySelector('input[name="workYMD"]')?.value ?? '不明';

  button.click();

  const modalButton = await waitForButtonWithText(
    document,
    '.MuiDialog-root[role="presentation"] button.MuiButton-containedPrimary',
    '承認'
  );

  modalButton.click();
  await waitForModalClose();
  await sleep(500);
  console.log(`Approval completed (workYMD: ${workYMD})`);
}

async function runApproval(mode = 'single') {
  const hasScheduledBadge = Array.from(document.querySelectorAll('span'))
    .some((el) => el.textContent.trim() === '予定申請済');

  if (!hasScheduledBadge) {
    const proceed = window.confirm('「予定申請済」が見つかりません。このまま承認処理を続けますか？');
    if (!proceed) {
      return { success: false, message: '予定申請済が見つかりませんでした。承認処理を中止しました。' };
    }
  }

  const findNextButton = () =>
    Array.from(document.querySelectorAll('button.MuiButton-containedPrimary'))
      .find((btn) => btn.textContent.trim() === '承認') ?? null;

  if (!findNextButton()) {
    return { success: false, message: '承認ボタンが見つかりませんでした' };
  }

  if (mode === 'single') {
    try {
      await processOne(findNextButton());
      return { success: true, message: '処理完了 - 成功: 1件' };
    } catch (err) {
      console.error(`Approval failed: ${err.message}`);
      return { success: false, message: `処理失敗: ${err.message}` };
    }
  }

  let successCount = 0;
  let failCount = 0;
  let button;
  while ((button = findNextButton())) {
    try {
      await processOne(button);
      successCount++;
    } catch (err) {
      failCount++;
      console.error(`Approval failed: ${err.message}`);
    }
  }

  return {
    success: failCount === 0,
    message: `処理完了 - 成功: ${successCount}件、失敗: ${failCount}件`,
  };
}

if (typeof module !== 'undefined') {
  module.exports = { runApproval };
} else {
  runApproval(window.__approvalMode ?? 'single');
}

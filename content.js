async function runApproval() {
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

  const approvalButton = findNextButton();

  try {
    const form = approvalButton.closest('form');
    const workYMD = form?.querySelector('input[name="workYMD"]')?.value ?? '不明';

    approvalButton.click();

    console.log('Waiting for modal confirm button');
    const modalButton = await waitForButtonWithText(
      document,
      '.MuiDialog-root[role="presentation"] button.MuiButton-containedPrimary',
      '承認'
    );

    console.log('Clicking confirm button');
    modalButton.click();

    await waitForModalClose();
    console.log('Modal closed');

    console.log(`Approval completed (workYMD: ${workYMD})`);
    return { success: true, message: '処理完了 - 成功: 1件' };
  } catch (err) {
    console.error(`Approval failed: ${err.message}`);
    return { success: false, message: `処理失敗: ${err.message}` };
  }
}

if (typeof module !== 'undefined') {
  module.exports = { runApproval };
} else {
  runApproval();
}

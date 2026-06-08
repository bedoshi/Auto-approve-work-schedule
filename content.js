async function runApproval() {
  const findNextButton = () =>
    Array.from(document.querySelectorAll('button.MuiButton-containedPrimary'))
      .find((btn) => btn.textContent.trim() === '承認') ?? null;

  if (!findNextButton()) {
    return { success: false, message: '承認ボタンが見つかりませんでした' };
  }

  let successCount = 0;
  let failCount = 0;
  let i = 0;

  while (true) {
    const approvalButton = findNextButton();
    if (!approvalButton) break;

    i++;
    console.log(`Processing approval ${i}`);

    try {
      // hidden input から日付を取得（ログ用）
      const form = approvalButton.closest('form');
      const workYMD = form?.querySelector('input[name="workYMD"]')?.value ?? '不明';

      // 承認ボタンをクリック
      approvalButton.click();

      // モーダル内の「承認」テキストを持つボタンが描画されるまで待つ
      console.log('Waiting for modal confirm button');
      const modalButton = await waitForButtonWithText(
        document,
        '.MuiDialog-root[role="presentation"] button.MuiButton-containedPrimary',
        '承認'
      );

      console.log('Clicking confirm button');
      modalButton.click();

      // モーダルが閉じるのを待つ
      await waitForModalClose();
      console.log('Modal closed');

      // 次の処理前に 500ms 待機
      await sleep(500);

      successCount++;
      console.log(`Approval ${i} completed (workYMD: ${workYMD})`);
    } catch (err) {
      failCount++;
      console.error(`Approval ${i} failed: ${err.message}`);
    }
  }

  console.log('All approvals processed');
  console.log(`Success: ${successCount}, Failed: ${failCount}`);

  return {
    success: failCount === 0,
    message: `処理完了 - 成功: ${successCount}件、失敗: ${failCount}件`,
  };
}

if (typeof module !== 'undefined') {
  module.exports = { runApproval };
} else {
  runApproval();
}

async function runApproval() {
  // 日次ページの承認ボタンを全取得（テキストが「承認」のものに絞り込む）
  const approvalButtons = Array.from(document.querySelectorAll('button.MuiButton-containedPrimary'))
    .filter((btn) => btn.textContent.trim() === '承認');

  console.log(`Found ${approvalButtons.length} approval buttons`);

  if (approvalButtons.length === 0) {
    return { success: false, message: '承認ボタンが見つかりませんでした' };
  }

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < approvalButtons.length; i++) {
    console.log(`Processing approval ${i + 1}/${approvalButtons.length}`);

    try {
      // hidden input から日付を取得（ログ用）
      const form = approvalButtons[i].closest('form');
      const workYMD = form?.querySelector('input[name="workYMD"]')?.value ?? '不明';

      // 承認ボタンをクリック
      approvalButtons[i].click();

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
      console.log(`Approval ${i + 1} completed (workYMD: ${workYMD})`);
    } catch (err) {
      failCount++;
      console.error(`Approval ${i + 1} failed: ${err.message}`);
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

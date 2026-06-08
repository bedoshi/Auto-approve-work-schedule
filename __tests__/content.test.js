jest.setTimeout(15000);

const utils = require('../utils.js');
global.sleep = utils.sleep;
global.waitForElement = utils.waitForElement;
global.waitForButtonWithText = utils.waitForButtonWithText;
global.waitForModalClose = utils.waitForModalClose;

const { runApproval } = require('../content.js');

// --- DOM helper functions ---

function createScheduledBadge() {
  const span = document.createElement('span');
  span.textContent = '予定申請済';
  return span;
}

function createApprovalForm(date) {
  const form = document.createElement('form');

  const input = document.createElement('input');
  input.type = 'hidden';
  input.name = 'workYMD';
  input.value = date;
  form.appendChild(input);

  const button = document.createElement('button');
  button.className = 'MuiButton-containedPrimary';
  button.textContent = '承認';
  button.addEventListener('click', () => {
    document.querySelectorAll('.MuiDialog-root[role="presentation"]').forEach((el) => el.remove());

    const modal = document.createElement('div');
    modal.className = 'MuiDialog-root';
    modal.setAttribute('role', 'presentation');

    const confirmButton = document.createElement('button');
    confirmButton.className = 'MuiButton-containedPrimary';
    confirmButton.textContent = '承認';
    confirmButton.addEventListener('click', () => {
      modal.remove();
      button.remove();
    });

    modal.appendChild(confirmButton);
    document.body.appendChild(modal);
  });
  form.appendChild(button);

  return form;
}

// モーダルに MuiButton-containedPrimary の承認ボタンがないケース
function createApprovalFormNoConfirmButton(date) {
  const form = document.createElement('form');

  const input = document.createElement('input');
  input.type = 'hidden';
  input.name = 'workYMD';
  input.value = date;
  form.appendChild(input);

  const button = document.createElement('button');
  button.className = 'MuiButton-containedPrimary';
  button.textContent = '承認';
  button.addEventListener('click', () => {
    button.remove();

    const modal = document.createElement('div');
    modal.className = 'MuiDialog-root';
    modal.setAttribute('role', 'presentation');

    const cancelButton = document.createElement('button');
    cancelButton.className = 'MuiButton-contained';
    cancelButton.textContent = 'キャンセル';

    modal.appendChild(cancelButton);
    document.body.appendChild(modal);
  });
  form.appendChild(button);

  return form;
}

// --- Tests ---

let logSpy;
let errorSpy;

beforeAll(() => {
  logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  logSpy.mockRestore();
  errorSpy.mockRestore();
});

beforeEach(() => {
  document.body.innerHTML = '';
  window.confirm = jest.fn().mockReturnValue(true);
});

describe('runApproval', () => {
  test('承認ボタンが0件のとき', async () => {
    document.body.appendChild(createScheduledBadge());

    const result = await runApproval();
    expect(result).toEqual({
      success: false,
      message: '承認ボタンが見つかりませんでした',
    });
  });

  test('予定申請済が見つからない場合にconfirmを表示し、キャンセルで中止', async () => {
    window.confirm = jest.fn().mockReturnValue(false);

    const result = await runApproval();
    expect(window.confirm).toHaveBeenCalled();
    expect(result).toEqual({
      success: false,
      message: '予定申請済が見つかりませんでした。承認処理を中止しました。',
    });
  });

  test('予定申請済が見つからなくてもconfirmでOKを選ぶと処理を続行', async () => {
    window.confirm = jest.fn().mockReturnValue(true);
    document.body.appendChild(createApprovalForm('2026-02-01'));

    const result = await runApproval('single');
    expect(window.confirm).toHaveBeenCalled();
    expect(result).toEqual({
      success: true,
      message: '処理完了 - 成功: 1件',
    });
  });

  test('1件正常処理 (mode=single)', async () => {
    document.body.appendChild(createScheduledBadge());
    document.body.appendChild(createApprovalForm('2026-02-01'));

    const result = await runApproval('single');
    expect(result).toEqual({
      success: true,
      message: '処理完了 - 成功: 1件',
    });
  });

  test('複数ボタンがあってもsingleモードでは1件のみ処理', async () => {
    document.body.appendChild(createScheduledBadge());
    document.body.appendChild(createApprovalForm('2026-02-01'));
    document.body.appendChild(createApprovalForm('2026-02-02'));

    const result = await runApproval('single');
    expect(result).toEqual({
      success: true,
      message: '処理完了 - 成功: 1件',
    });

    const remaining = Array.from(document.querySelectorAll('button.MuiButton-containedPrimary'))
      .filter((btn) => btn.textContent.trim() === '承認');
    expect(remaining).toHaveLength(1);
  });

  test('2件すべて成功 (mode=all)', async () => {
    document.body.appendChild(createScheduledBadge());
    document.body.appendChild(createApprovalForm('2026-02-01'));
    document.body.appendChild(createApprovalForm('2026-02-02'));

    const result = await runApproval('all');
    expect(result).toEqual({
      success: true,
      message: '処理完了 - 成功: 2件、失敗: 0件',
    });
  });

  test('モーダル内に承認ボタンがなく失敗しても処理継続 (mode=all)', async () => {
    document.body.appendChild(createScheduledBadge());
    document.body.appendChild(createApprovalFormNoConfirmButton('2026-02-01'));
    document.body.appendChild(createApprovalForm('2026-02-02'));

    const result = await runApproval('all');
    expect(result).toEqual({
      success: false,
      message: '処理完了 - 成功: 1件、失敗: 1件',
    });
  });
});

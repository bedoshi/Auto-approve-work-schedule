jest.setTimeout(15000);

const utils = require('../utils.js');
global.sleep = utils.sleep;
global.waitForElement = utils.waitForElement;
global.waitForModalClose = utils.waitForModalClose;

const { runApproval } = require('../content.js');

// --- DOM helper functions ---

function createApprovalForm(date) {
  const form = document.createElement('form');

  const input = document.createElement('input');
  input.type = 'hidden';
  input.name = 'workYMD';
  input.value = date;
  form.appendChild(input);

  const button = document.createElement('button');
  button.className = 'MuiButton-outlined';
  button.textContent = '承認';
  button.addEventListener('click', () => {
    // Remove any leftover modals from previous iterations
    document.querySelectorAll('.MuiDialog-root[role="presentation"]').forEach((el) => el.remove());

    const modal = document.createElement('div');
    modal.className = 'MuiDialog-root';
    modal.setAttribute('role', 'presentation');

    const confirmButton = document.createElement('button');
    confirmButton.className = 'MuiButton-contained';
    confirmButton.textContent = '承認';
    confirmButton.addEventListener('click', () => {
      modal.remove();
    });

    modal.appendChild(confirmButton);
    document.body.appendChild(modal);
  });
  form.appendChild(button);

  return form;
}

function createApprovalFormNoConfirmButton(date) {
  const form = document.createElement('form');

  const input = document.createElement('input');
  input.type = 'hidden';
  input.name = 'workYMD';
  input.value = date;
  form.appendChild(input);

  const button = document.createElement('button');
  button.className = 'MuiButton-outlined';
  button.textContent = '承認';
  button.addEventListener('click', () => {
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
});

describe('runApproval', () => {
  test('承認ボタンが0件のとき', async () => {
    const result = await runApproval();
    expect(result).toEqual({
      success: false,
      message: '承認ボタンが見つかりませんでした',
    });
  });

  test('1件正常処理', async () => {
    document.body.appendChild(createApprovalForm('2026-02-01'));

    const result = await runApproval();
    expect(result).toEqual({
      success: true,
      message: '処理完了 - 成功: 1件、失敗: 0件',
    });
  });

  test('2件すべて成功', async () => {
    document.body.appendChild(createApprovalForm('2026-02-01'));
    document.body.appendChild(createApprovalForm('2026-02-02'));

    const result = await runApproval();
    expect(result).toEqual({
      success: true,
      message: '処理完了 - 成功: 2件、失敗: 0件',
    });
  });

  test('モーダル内に承認ボタンがなく失敗しても処理継続', async () => {
    document.body.appendChild(createApprovalFormNoConfirmButton('2026-02-01'));
    document.body.appendChild(createApprovalForm('2026-02-02'));

    const result = await runApproval();
    expect(result).toEqual({
      success: false,
      message: '処理完了 - 成功: 1件、失敗: 1件',
    });
  });
});

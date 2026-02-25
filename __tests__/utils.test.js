jest.setTimeout(10000);

const { sleep, waitForElement, waitForModalClose } = require('../utils');

describe('sleep', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  test('指定ms後に resolve する', async () => {
    const start = Date.now();
    await sleep(100);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(90);
  });
});

describe('waitForElement', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  test('要素がすでに DOM にあれば即 resolve する', async () => {
    document.body.innerHTML = '<div id="target"></div>';
    const el = await waitForElement('#target');
    expect(el).toBeTruthy();
    expect(el.id).toBe('target');
  });

  test('タイムアウト内に要素が現れれば resolve する', async () => {
    setTimeout(() => {
      const div = document.createElement('div');
      div.id = 'delayed';
      document.body.appendChild(div);
    }, 150);
    const el = await waitForElement('#delayed', 500);
    expect(el).toBeTruthy();
    expect(el.id).toBe('delayed');
  });

  test('タイムアウトすると reject する', async () => {
    await expect(waitForElement('#nonexistent', 200)).rejects.toThrow(
      '要素が見つかりません: #nonexistent (200ms 経過)'
    );
  });
});

describe('waitForModalClose', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  test('モーダルが DOM にない場合は即 resolve する', async () => {
    await expect(waitForModalClose()).resolves.toBeUndefined();
  });

  test('display:none のモーダルは即 resolve する', async () => {
    document.body.innerHTML =
      '<div class="MuiDialog-root" role="presentation" style="display:none"></div>';
    await expect(waitForModalClose()).resolves.toBeUndefined();
  });

  test('DOM から除去されたモーダルは resolve する', async () => {
    const modal = document.createElement('div');
    modal.className = 'MuiDialog-root';
    modal.setAttribute('role', 'presentation');
    Object.defineProperty(modal, 'offsetParent', {
      get: () => document.body,
      configurable: true,
    });
    document.body.appendChild(modal);

    setTimeout(() => {
      modal.remove();
    }, 200);

    await expect(waitForModalClose(500)).resolves.toBeUndefined();
  });

  test('モーダルが閉じない場合は reject する', async () => {
    const modal = document.createElement('div');
    modal.className = 'MuiDialog-root';
    modal.setAttribute('role', 'presentation');
    Object.defineProperty(modal, 'offsetParent', {
      get: () => document.body,
      configurable: true,
    });
    document.body.appendChild(modal);

    await expect(waitForModalClose(200)).rejects.toThrow(
      'モーダルが閉じませんでした (200ms 経過)'
    );
  });
});

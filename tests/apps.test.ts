import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderAppsHTML, initAppsEvents } from '../src/apps';

describe('Universal Apps & CLI Page (/apps)', () => {
  let container: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = '';
    container = document.createElement('div');
    container.id = 'apps-view';
    document.body.appendChild(container);
  });

  it('renders Section A (Terminal CLI) and Section B (Desktop Tauri GUI) content', () => {
    container.innerHTML = renderAppsHTML();

    expect(container.textContent).toContain('Section A: Terminal CLI & Mobile Shell');
    expect(container.textContent).toContain('npx @m5dev/gitinfo');
    expect(container.textContent).toContain('pkg install nodejs');

    expect(container.textContent).toContain('Section B: Desktop GUI Edition (Tauri)');
    expect(container.textContent).toContain('Ultra-lightweight (~4 MB) with near-zero RAM usage');
    expect(container.textContent).toContain('Windows');
    expect(container.textContent).toContain('Linux');
    expect(container.textContent).toContain('macOS');
  });

  it('attaches event listeners for 1-click copy buttons', async () => {
    container.innerHTML = renderAppsHTML();
    const showToastMock = vi.fn();

    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: writeTextMock,
      },
      writable: true,
      configurable: true,
    });

    initAppsEvents(container, showToastMock);

    const npxBtn = container.querySelector('#copy-npx-cmd-btn') as HTMLButtonElement;
    npxBtn.click();

    await new Promise((r) => setTimeout(r, 10));

    expect(writeTextMock).toHaveBeenCalledWith('npx @m5dev/gitinfo <owner/repo>');
  });
});

import '@/remote/generated/remote-elements';

import { installStylePropertyOnRemoteElements } from '@/remote/elements/utils/installStylePropertyOnRemoteElements';

import { installSelectorMethodsPolyfill } from '../installSelectorMethodsPolyfill';

describe('installSelectorMethodsPolyfill on remote elements', () => {
  beforeAll(() => {
    installStylePropertyOnRemoteElements();
  });

  it('should use live control properties after an attribute initializes them', () => {
    const button = document.createElement('html-button') as HTMLButtonElement;
    const checkbox = document.createElement('html-input') as HTMLInputElement;

    for (const element of [button, checkbox]) {
      installSelectorMethodsPolyfill({
        elementPrototype: element,
        querySelectorTargets: [element],
        resolveActiveElement: () => null,
      });
    }

    button.setAttribute('disabled', '');
    checkbox.setAttribute('type', 'checkbox');
    checkbox.setAttribute('checked', '');
    expect(button.matches(':disabled')).toBe(true);
    expect(checkbox.matches(':checked')).toBe(true);

    button.disabled = false;
    checkbox.checked = false;
    expect(button.hasAttribute('disabled')).toBe(true);
    expect(checkbox.hasAttribute('checked')).toBe(true);
    expect(button.matches(':disabled')).toBe(false);
    expect(button.matches(':enabled')).toBe(true);
    expect(checkbox.matches(':checked')).toBe(false);
  });

  it('should read declared remote properties and ignore inherited accessors', () => {
    const button = document.createElement('html-button') as HTMLButtonElement;

    installSelectorMethodsPolyfill({
      elementPrototype: button,
      querySelectorTargets: [button],
      resolveActiveElement: () => null,
    });

    button.tabIndex = -1;
    button.style.color = 'red';

    expect(button.matches('[tabindex="-1"]')).toBe(true);
    expect(button.matches('[style]')).toBe(true);
    expect(button.matches('[slot]')).toBe(false);
    expect(button.matches('[lang]')).toBe(false);
  });
});

import '@/remote/generated/remote-elements';

import { installSelectorMethodsPolyfill } from '../installSelectorMethodsPolyfill';

describe('installSelectorMethodsPolyfill on remote elements', () => {
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
});

import { type RemoteElementConstructor as RemoteDomElementConstructor } from '@remote-dom/core/elements';
import { isDefined } from 'twenty-shared/utils';

import { ALLOWED_HTML_ELEMENTS } from '@/constants/AllowedHtmlElements';
import { ARIA_BOOLEAN_ATTRIBUTE_NAMES } from '@/remote/elements/constants/AriaBooleanAttributeNames';

type RemoteElementConstructor = CustomElementConstructor &
  Partial<Pick<RemoteDomElementConstructor, 'remotePropertyDefinitions'>>;

export const installAriaBooleanAccessors = (): void => {
  for (const allowedHtmlElement of ALLOWED_HTML_ELEMENTS) {
    const elementConstructor = customElements.get(allowedHtmlElement.tag) as
      | RemoteElementConstructor
      | undefined;

    if (!isDefined(elementConstructor)) {
      continue;
    }

    for (const attributeName of ARIA_BOOLEAN_ATTRIBUTE_NAMES) {
      if (elementConstructor.remotePropertyDefinitions?.has(attributeName)) {
        continue;
      }

      Object.defineProperty(elementConstructor.prototype, attributeName, {
        get(this: Element) {
          return this.getAttribute(attributeName);
        },
        set(this: Element, value: unknown) {
          if (!isDefined(value)) {
            this.removeAttribute(attributeName);

            return;
          }

          this.setAttribute(attributeName, String(value));
        },
        configurable: true,
      });
    }
  }
};

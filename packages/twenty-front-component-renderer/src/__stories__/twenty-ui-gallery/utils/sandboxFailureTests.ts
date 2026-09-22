import { SANDBOX_ERROR_PATTERNS } from '@/__stories__/twenty-ui-gallery/constants/SANDBOX_ERROR_PATTERNS';
import { createSandboxFailureTest } from '@/__stories__/twenty-ui-gallery/utils/createSandboxFailureTest';

export const tabsTest = createSandboxFailureTest({
  trigger: { role: 'tab', name: 'Activity' },
  requiredErrors: [SANDBOX_ERROR_PATTERNS.COMPOSED_PATH],
});

export const popoverTest = createSandboxFailureTest({
  trigger: { role: 'button', name: 'Account details' },
  requiredErrors: [SANDBOX_ERROR_PATTERNS.VIEWPORT_WIDTH],
});

export const menuTest = createSandboxFailureTest({
  trigger: { role: 'button', name: 'Account actions' },
  requiredErrors: [SANDBOX_ERROR_PATTERNS.POINTER_TYPE],
  allowedAdditionalErrors: [SANDBOX_ERROR_PATTERNS.VIEWPORT_WIDTH],
});

export const selectTest = createSandboxFailureTest({
  trigger: { role: 'combobox', name: 'Account stage' },
  requiredErrors: [SANDBOX_ERROR_PATTERNS.POINTER_TYPE],
  allowedAdditionalErrors: [
    SANDBOX_ERROR_PATTERNS.VIEWPORT_WIDTH,
    SANDBOX_ERROR_PATTERNS.COMPOSED_PATH,
  ],
});

export const alertDialogTest = createSandboxFailureTest({
  trigger: { role: 'button', name: 'Delete account' },
  requiredErrors: [SANDBOX_ERROR_PATTERNS.VIEWPORT_WIDTH],
});

export const switchTest = createSandboxFailureTest({
  trigger: { role: 'switch', name: 'Email notifications' },
  requiredErrors: [SANDBOX_ERROR_PATTERNS.POINTER_EVENT_CONSTRUCTOR],
});

import { expect, userEvent, waitFor, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { INTERACTION_TIMEOUT } from '@/__stories__/shared/test-utils/timeouts';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';

type CreateTooltipTestOptions = {
  escapeDismisses: boolean;
};

export const createTooltipTest =
  ({
    escapeDismisses,
  }: CreateTooltipTestOptions): TwentyUiGalleryPlayFunction =>
  async ({ canvasElement }) => {
    const user = userEvent.setup();
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await expectFrontComponentMounted(canvas);
    await waitFor(() => {
      expect(canvas.getByRole('status')).toHaveAttribute('aria-busy', 'false');
    });

    const exportButton = canvas.getByRole('button', { name: 'Export records' });
    await user.hover(exportButton);

    await waitFor(() => {
      expect(errorHandler).not.toHaveBeenCalled();
      expect(canvas.getByRole('status')).toHaveTextContent('Export help: open');
      expect(
        page.getByText('Download visible records as a CSV file'),
      ).toBeVisible();
    });

    await user.tab();
    expect(exportButton).toHaveFocus();
    await user.keyboard('{Escape}');

    if (escapeDismisses) {
      await waitFor(() =>
        expect(canvas.getByRole('status')).toHaveTextContent(
          'Export help: closed',
        ),
      );
      expect(
        page.queryByText('Download visible records as a CSV file'),
      ).not.toBeInTheDocument();
      expect(errorHandler).not.toHaveBeenCalled();
      return;
    }

    // React loses the Escape handler that Base UI adds through cloneElement.
    await expect(
      waitFor(
        () =>
          expect(canvas.getByRole('status')).toHaveTextContent(
            'Export help: closed',
          ),
        { timeout: INTERACTION_TIMEOUT },
      ),
    ).rejects.toThrow();
    expect(errorHandler).not.toHaveBeenCalled();
    expect(canvas.getByRole('status')).toHaveTextContent('Export help: open');
    expect(
      page.getByText('Download visible records as a CSV file'),
    ).toBeVisible();
  };

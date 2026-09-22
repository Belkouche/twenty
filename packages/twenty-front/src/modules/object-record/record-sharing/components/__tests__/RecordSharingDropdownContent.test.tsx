import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { RecordSharePrincipalType } from 'twenty-shared/types';

import { RecordSharingDropdownContent } from '@/object-record/record-sharing/components/RecordSharingDropdownContent';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const setShare = jest.fn();
const refetch = jest.fn();
const copyToClipboard = jest.fn();

jest.mock('~/hooks/useCopyToClipboard', () => ({
  useCopyToClipboard: () => ({ copyToClipboard }),
}));

const sharing = {
  permissions: {
    canRead: true,
    canUpdate: true,
    canDelete: true,
    canSoftDelete: true,
  },
  isEnabled: true,
  hasInheritedAccess: false,
  roles: [{ id: 'sales-role', label: 'Sales' }],
  shares: [],
};
const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>
    <I18nProvider i18n={i18n}>{children}</I18nProvider>
  </JotaiProvider>
);
const renderSharing = (overrides = {}) => {
  return render(
    <RecordSharingDropdownContent
      title="Share record"
      description="People you add can read this record."
      recordUrl="https://example.com/record"
      sharingState={{
        sharing,
        setShare,
        refetch,
        loading: false,
        saving: false,
        error: undefined,
        ...overrides,
      }}
    />,
    {
      wrapper: Wrapper,
    },
  );
};

describe('Record sharing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    refetch.mockResolvedValue(undefined);
    resetJotaiStore();
    jotaiStore.set(currentWorkspaceMembersState.atom, [
      {
        id: 'alice-member',
        name: { firstName: 'Alice', lastName: 'Smith' },
        userEmail: 'alice@example.com',
      } as never,
    ]);
  });

  it('finds a workspace member by email and grants viewing access', async () => {
    const user = userEvent.setup();
    renderSharing();
    await user.type(
      screen.getByPlaceholderText('Add people or roles'),
      'alice@',
    );
    expect(screen.queryByText('Sales')).toBeNull();
    await user.click(screen.getByText('Alice Smith'));
    expect(setShare).toHaveBeenCalledWith({
      principal: { workspaceMemberId: 'alice-member' },
      enabled: true,
      accessLevel: 'READ',
    });
  });

  it('finds a role by name and grants viewing access', async () => {
    const user = userEvent.setup();
    renderSharing();
    await user.type(
      screen.getByPlaceholderText('Add people or roles'),
      'sales',
    );
    expect(screen.queryByText('Alice Smith')).toBeNull();
    await user.click(screen.getByText('Sales'));
    expect(setShare).toHaveBeenCalledWith({
      principal: { roleId: 'sales-role' },
      enabled: true,
      accessLevel: 'READ',
    });
  });

  it('enables workspace-wide viewing', async () => {
    const user = userEvent.setup();
    renderSharing();
    await user.click(screen.getByText('Everyone in the workspace'));
    expect(setShare).toHaveBeenCalledWith({
      principal: { everyone: true },
      enabled: true,
    });
  });

  it('returns to restricted access without removing named recipients', async () => {
    const user = userEvent.setup();
    renderSharing({
      sharing: {
        ...sharing,
        shares: [
          {
            id: 'everyone',
            principalType: RecordSharePrincipalType.EVERYONE,
            principalId: 'everyone',
            accessLevel: 'READ',
            rowCause: 'MANUAL',
          },
        ],
      },
    });
    await user.click(screen.getByText('Restricted'));
    expect(setShare).toHaveBeenCalledWith({
      principal: { everyone: true },
      enabled: false,
    });
  });

  it('allows revocation while sharing is disabled', async () => {
    const user = userEvent.setup();
    renderSharing({
      sharing: {
        ...sharing,
        isEnabled: false,
        shares: [
          {
            id: 'grant',
            principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
            principalId: 'alice-member',
            accessLevel: 'READ',
            rowCause: 'MANUAL',
          },
        ],
      },
    });
    expect(screen.queryByPlaceholderText('Add people or roles')).toBeNull();
    await user.click(screen.getByText('Everyone in the workspace'));
    expect(setShare).not.toHaveBeenCalled();
    await user.click(
      screen.getByRole('button', { name: 'Remove Alice Smith' }),
    );
    expect(setShare).toHaveBeenCalledWith({
      principal: { workspaceMemberId: 'alice-member' },
      enabled: false,
    });
  });

  it('does not offer management controls to viewers', () => {
    renderSharing({
      sharing: {
        ...sharing,
        permissions: {
          canRead: true,
          canUpdate: false,
          canDelete: false,
          canSoftDelete: false,
        },
        roles: [],
      },
    });
    expect(
      screen.getByText(
        'You have view-only access. Ask someone with edit access to change sharing.',
      ),
    ).toBeVisible();
    expect(screen.queryByText('General access')).toBeNull();
    expect(screen.queryByPlaceholderText('Add people or roles')).toBeNull();
    expect(screen.getByText('Copy link')).toBeVisible();
  });

  it('supports keyboard selection and reports empty searches', async () => {
    const user = userEvent.setup();
    renderSharing();
    await user.type(
      screen.getByPlaceholderText('Add people or roles'),
      'sales',
    );
    await user.tab();
    expect(screen.getByRole('button', { name: 'Sales · Role' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(setShare).toHaveBeenCalledWith({
      principal: { roleId: 'sales-role' },
      enabled: true,
      accessLevel: 'READ',
    });
    await user.clear(screen.getByPlaceholderText('Add people or roles'));
    await user.type(
      screen.getByPlaceholderText('Add people or roles'),
      'no match',
    );
    expect(screen.getByText('No matching people or roles')).toBeVisible();
  });

  it('copies the supplied record link', async () => {
    const user = userEvent.setup();
    renderSharing();
    await user.click(screen.getByText('Copy link'));
    expect(copyToClipboard).toHaveBeenCalledWith('https://example.com/record');
  });

  it('shows a retry action when settings cannot be loaded', async () => {
    const user = userEvent.setup();
    renderSharing({ error: new Error('offline') });
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Sharing settings could not be loaded.',
    );
    await user.click(screen.getByText('Try again'));
    expect(refetch).toHaveBeenCalledTimes(1);
    expect(screen.queryByPlaceholderText('Add people or roles')).toBeNull();
  });
  it('shows application and owner grants without offering to revoke them', () => {
    renderSharing({
      sharing: {
        ...sharing,
        shares: [
          {
            id: 'owner',
            principalType: 'WORKSPACE_MEMBER',
            principalId: 'alice-member',
            accessLevel: 'FULL',
            rowCause: 'OWNER',
          },
          {
            id: 'app',
            principalType: 'ROLE',
            principalId: 'sales-role',
            accessLevel: 'READ',
            rowCause: 'APPLICATION',
          },
        ],
      },
    });
    expect(screen.getByText('· Owner')).toBeVisible();
    expect(screen.getByText('· Provided by application')).toBeVisible();
    expect(screen.queryByRole('button', { name: /Remove/ })).toBeNull();
  });

  it('explains inherited access instead of promising a manual revocation removes it', () => {
    renderSharing({ sharing: { ...sharing, hasInheritedAccess: true } });
    expect(
      screen.getByText(
        /Removing direct access does not remove inherited access/,
      ),
    ).toBeVisible();
  });
  it.each([
    ['Alice Smith', { workspaceMemberId: 'alice-member' }],
    ['Sales', { roleId: 'sales-role' }],
  ])('can invite %s as an editor', async (label, principal) => {
    const user = userEvent.setup();
    renderSharing();
    await user.click(
      within(
        screen.getByRole('group', { name: 'Invitation access' }),
      ).getByText('Viewer'),
    );
    await user.click(screen.getByText('Editor'));
    await user.click(screen.getByText(label as string));
    expect(setShare).toHaveBeenCalledWith({
      principal,
      enabled: true,
      accessLevel: 'READ_WRITE',
    });
  });

  it.each([
    [
      'Alice Smith access',
      'WORKSPACE_MEMBER',
      'alice-member',
      { workspaceMemberId: 'alice-member' },
    ],
    ['Sales access', 'ROLE', 'sales-role', { roleId: 'sales-role' }],
    [
      'Everyone in the workspace access',
      'EVERYONE',
      'everyone',
      { everyone: true },
    ],
  ])(
    'can upgrade and downgrade %s without removing their grant',
    async (label, principalType, principalId, principal) => {
      const user = userEvent.setup();
      const shares = [
        {
          id: 'grant',
          principalType,
          principalId,
          accessLevel: 'READ',
          rowCause: 'MANUAL',
        },
      ];
      const view = renderSharing({ sharing: { ...sharing, shares } });
      await user.click(
        within(screen.getByRole('group', { name: label as string })).getByText(
          'Viewer',
        ),
      );
      await user.click(screen.getByText('Editor'));
      expect(setShare).toHaveBeenLastCalledWith({
        principal,
        enabled: true,
        accessLevel: 'READ_WRITE',
      });
      view.unmount();
      renderSharing({
        sharing: {
          ...sharing,
          shares: [{ ...shares[0], accessLevel: 'READ_WRITE' }],
        },
      });
      await user.click(
        within(screen.getByRole('group', { name: label as string })).getByText(
          'Editor',
        ),
      );
      await user.click(screen.getAllByText('Viewer').at(-1)!);
      expect(setShare).toHaveBeenLastCalledWith({
        principal,
        enabled: true,
        accessLevel: 'READ',
      });
    },
  );
});

import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useId } from 'react';
import { RecordShareAccessLevel } from 'twenty-shared/types';

import { Select } from '@/ui/input/components/Select';

type RecordSharingAccessSelectProps = {
  label: string;
  value: RecordShareAccessLevel.READ | RecordShareAccessLevel.READ_WRITE;
  disabled?: boolean;
  onChange: (
    value: RecordShareAccessLevel.READ | RecordShareAccessLevel.READ_WRITE,
  ) => void;
};

const StyledContainer = styled.div`
  flex-shrink: 0;
  width: 96px;
`;

export const RecordSharingAccessSelect = ({
  label,
  value,
  disabled,
  onChange,
}: RecordSharingAccessSelectProps) => {
  const { t } = useLingui();
  const dropdownId = useId();

  return (
    <StyledContainer role="group" aria-label={label}>
      <Select
        dropdownId={dropdownId}
        value={value}
        disabled={disabled}
        onChange={onChange}
        selectSizeVariant="small"
        options={[
          { value: RecordShareAccessLevel.READ, label: t`Viewer` },
          { value: RecordShareAccessLevel.READ_WRITE, label: t`Editor` },
        ]}
      />
    </StyledContainer>
  );
};

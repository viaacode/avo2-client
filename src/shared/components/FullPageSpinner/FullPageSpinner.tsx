import { Spinner } from '@viaa/avo2-components';
import { type FC } from 'react';

export const FullPageSpinner: FC<{ locationId: string }> = ({ locationId }) => {
  return (
    <div
      className="u-flex-align u-h-70vh u-flex-align--center"
      data-loaction-id={locationId}
    >
      <Spinner size="large" />
    </div>
  );
};

export default FullPageSpinner;

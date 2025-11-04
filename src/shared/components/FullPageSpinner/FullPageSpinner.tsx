import { Spinner } from '@viaa/avo2-components';
import React, { type FC } from 'react';

export const FullPageSpinner: FC = () => {
	return (
		<div className="u-flex-align u-h-70vh u-flex-align--center">
			<Spinner size="large" />
		</div>
	);
};

export default FullPageSpinner;

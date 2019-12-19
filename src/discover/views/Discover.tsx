import React, { FunctionComponent } from 'react';
import { Trans } from 'react-i18next';

interface DiscoverProps {}

const Discover: FunctionComponent<DiscoverProps> = () => {
	return (
		<div className="m-discover-page">
			<Trans key="discover/views/discover___the-discover-page">The discover page</Trans>
		</div>
	);
};

export default Discover;

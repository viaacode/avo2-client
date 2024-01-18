import { ContentPageLabelOverview } from '@meemoo/admin-core-ui';
import React, { FC } from 'react';
import { compose } from 'redux';

import withUser from '../../../shared/hocs/withUser';
import { withAdminCoreConfig } from '../../shared/hoc/with-admin-core-config';

const ContentPageLabelOverviewPage: FC = () => {
	return (
		<ContentPageLabelOverview className="c-admin-core c-admin__content-page-label-overview" />
	);
};

export default compose(withAdminCoreConfig, withUser)(ContentPageLabelOverviewPage) as FC;

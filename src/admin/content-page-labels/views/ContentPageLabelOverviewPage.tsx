import { Flex, Spinner } from '@viaa/avo2-components';
import React, { type FC, lazy, Suspense } from 'react';

import { withAdminCoreConfig } from '../../shared/hoc/with-admin-core-config';

const ContentPageLabelOverview = lazy(() =>
	import('@meemoo/admin-core-ui/admin').then((adminCoreModule) => ({
		default: adminCoreModule.ContentPageLabelOverview,
	}))
);

const ContentPageLabelOverviewPage: FC = () => {
	return (
		<Suspense
			fallback={
				<Flex orientation="horizontal" center>
					<Spinner size="large" />
				</Flex>
			}
		>
			<ContentPageLabelOverview className="c-admin-core c-admin__content-page-label-overview" />
		</Suspense>
	);
};

export default withAdminCoreConfig(ContentPageLabelOverviewPage) as FC;

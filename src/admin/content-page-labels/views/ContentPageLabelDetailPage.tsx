import { Flex, Spinner } from '@viaa/avo2-components';
import React, { type FC, lazy, Suspense } from 'react';

import { type DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { withAdminCoreConfig } from '../../shared/hoc/with-admin-core-config';

const ContentPageLabelDetail = lazy(() =>
	import('@meemoo/admin-core-ui/dist/admin.mjs').then((adminCoreModule) => ({
		default: adminCoreModule.ContentPageLabelDetail,
	}))
);

const ContentPageLabelDetailPage: FC<DefaultSecureRouteProps<{ id: string }>> = ({ match }) => {
	return (
		<Suspense
			fallback={
				<Flex orientation="horizontal" center>
					<Spinner size="large" />
				</Flex>
			}
		>
			<ContentPageLabelDetail
				contentPageLabelId={match.params.id}
				className="c-admin-core c-admin__content-page-label-detail"
			/>
		</Suspense>
	);
};

export default withAdminCoreConfig(ContentPageLabelDetailPage as FC<any>) as FC<
	DefaultSecureRouteProps<{ id: string }>
>;

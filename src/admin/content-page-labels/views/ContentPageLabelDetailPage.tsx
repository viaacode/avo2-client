import { Flex, Spinner } from '@viaa/avo2-components';
import React, { type FC, lazy, Suspense } from 'react';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';

import { type DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { goBrowserBackWithFallback } from '../../../shared/helpers/go-browser-back-with-fallback';
import { ADMIN_PATH } from '../../admin.const';
import { withAdminCoreConfig } from '../../shared/hoc/with-admin-core-config';

const ContentPageLabelDetail = lazy(() =>
	import('@meemoo/admin-core-ui/admin').then((adminCoreModule) => ({
		default: adminCoreModule.ContentPageLabelDetail,
	}))
);

const ContentPageLabelDetailPage: FC<DefaultSecureRouteProps<{ id: string }>> = ({
	match,
	history,
}) => {
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
				onGoBack={() =>
					goBrowserBackWithFallback(ADMIN_PATH.CONTENT_PAGE_LABEL_OVERVIEW, history)
				}
			/>
		</Suspense>
	);
};

export default compose(
	withAdminCoreConfig,
	withRouter
)(ContentPageLabelDetailPage as FC<any>) as FC<DefaultSecureRouteProps<{ id: string }>>;

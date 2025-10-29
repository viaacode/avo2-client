import { Flex, Spinner } from '@viaa/avo2-components';
import React, { type FC, lazy, Suspense } from 'react';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';

import { type DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { buildLink } from '../../../shared/helpers/build-link';
import { goBrowserBackWithFallback } from '../../../shared/helpers/go-browser-back-with-fallback';
import { ADMIN_PATH } from '../../admin.const';
import { withAdminCoreConfig } from '../../shared/hoc/with-admin-core-config';

const ContentPageLabelEdit = lazy(() =>
	import('@meemoo/admin-core-ui/admin').then((adminCoreModule) => ({
		default: adminCoreModule.ContentPageLabelEdit,
	}))
);

const ContentPageLabelEditPage: FC<DefaultSecureRouteProps<{ id: string }>> = ({
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
			<ContentPageLabelEdit
				className="c-admin-core c-admin__content-page-label-edit"
				contentPageLabelId={match.params.id}
				onGoBack={() =>
					goBrowserBackWithFallback(
						buildLink(ADMIN_PATH.CONTENT_PAGE_DETAIL, { id: match.params.id }),
						history
					)
				}
			/>
		</Suspense>
	);
};

export default compose(withAdminCoreConfig, withRouter)(ContentPageLabelEditPage as FC<any>) as FC<
	DefaultSecureRouteProps<{ id: string }>
>;

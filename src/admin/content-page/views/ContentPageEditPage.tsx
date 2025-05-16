import type { ContentPageDetailProps } from '@meemoo/admin-core-ui/dist/admin.mjs';
import { Flex, Spinner } from '@viaa/avo2-components';
import React, { type FC, lazy, Suspense } from 'react';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';

import { type DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { buildLink } from '../../../shared/helpers/build-link';
import { goBrowserBackWithFallback } from '../../../shared/helpers/go-browser-back-with-fallback';
import withUser, { type UserProps } from '../../../shared/hocs/withUser';
import { ADMIN_PATH } from '../../admin.const';
import { withAdminCoreConfig } from '../../shared/hoc/with-admin-core-config';

const ContentPageEdit = lazy(() =>
	import('@meemoo/admin-core-ui/dist/admin.mjs').then((adminCoreModule) => ({
		default: adminCoreModule.ContentPageEdit,
	}))
);

const ContentPageDetailPage: FC<
	DefaultSecureRouteProps<{ id: string }> & ContentPageDetailProps & UserProps
> = ({ match, history, commonUser }) => {
	const { id } = match.params;
	return (
		<Suspense
			fallback={
				<Flex orientation="horizontal" center>
					<Spinner size="large" />
				</Flex>
			}
		>
			<ContentPageEdit
				className="c-admin-core c-admin__content-page-edit"
				id={id}
				commonUser={commonUser}
				onGoBack={() =>
					goBrowserBackWithFallback(
						buildLink(ADMIN_PATH.CONTENT_PAGE_DETAIL, { id }),
						history
					)
				}
			/>
		</Suspense>
	);
};

export default compose(withAdminCoreConfig, withUser, withRouter)(ContentPageDetailPage) as FC;

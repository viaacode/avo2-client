import type { ContentPageDetailProps } from '@meemoo/admin-core-ui/dist/admin.mjs';
import { Flex, Spinner } from '@viaa/avo2-components';
import React, { type FC, lazy, Suspense } from 'react';
import { compose } from 'redux';

import { type DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import withUser, { type UserProps } from '../../../shared/hocs/withUser';
import { withAdminCoreConfig } from '../../shared/hoc/with-admin-core-config';

const ContentPageEdit = lazy(() =>
	import('@meemoo/admin-core-ui/dist/admin.mjs').then((adminCoreModule) => ({
		default: adminCoreModule.ContentPageEdit,
	}))
);

const ContentPageDetailPage: FC<
	DefaultSecureRouteProps<{ id: string }> & ContentPageDetailProps & UserProps
> = ({ match, commonUser }) => {
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
			/>
		</Suspense>
	);
};

export default compose(withAdminCoreConfig, withUser)(ContentPageDetailPage) as FC;

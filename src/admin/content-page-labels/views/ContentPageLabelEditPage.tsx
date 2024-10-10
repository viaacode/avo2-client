import { Flex, Spinner } from '@viaa/avo2-components';
import React, { type FC, lazy, Suspense } from 'react';

import { type DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { withAdminCoreConfig } from '../../shared/hoc/with-admin-core-config';

const ContentPageLabelEdit = lazy(() =>
	import('@meemoo/admin-core-ui/dist/admin.mjs').then((adminCoreModule) => ({
		default: adminCoreModule.ContentPageLabelEdit,
	}))
);

const ContentPageLabelEditPage: FC<DefaultSecureRouteProps<{ id: string }>> = ({ match }) => {
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
			/>
		</Suspense>
	);
};

export default withAdminCoreConfig(ContentPageLabelEditPage as FC<any>) as FC<
	DefaultSecureRouteProps<{ id: string }>
>;

import { ContentPageLabelDetail } from '@meemoo/admin-core-ui';
import React, { type FC } from 'react';

import { type DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { withAdminCoreConfig } from '../../shared/hoc/with-admin-core-config';

const ContentPageLabelDetailPage: FC<DefaultSecureRouteProps<{ id: string }>> = ({ match }) => {
	return (
		<ContentPageLabelDetail
			contentPageLabelId={match.params.id}
			className="c-admin-core c-admin__content-page-label-detail"
		/>
	);
};

export default withAdminCoreConfig(ContentPageLabelDetailPage as FC<any>) as FC<
	DefaultSecureRouteProps<{ id: string }>
>;

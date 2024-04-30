import { ContentPageLabelEdit } from '@meemoo/admin-core-ui';
import React, { type FC } from 'react';

import { type DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { withAdminCoreConfig } from '../../shared/hoc/with-admin-core-config';

const ContentPageLabelEditPage: FC<DefaultSecureRouteProps<{ id: string }>> = ({ match }) => {
	return (
		<ContentPageLabelEdit
			className="c-admin-core c-admin__content-page-label-edit"
			contentPageLabelId={match.params.id}
		/>
	);
};

export default withAdminCoreConfig(ContentPageLabelEditPage as FC<any>) as FC<
	DefaultSecureRouteProps<{ id: string }>
>;

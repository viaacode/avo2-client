import { ContentPageEdit } from '@meemoo/admin-core-ui';
import type { ContentPageDetailProps } from '@meemoo/admin-core-ui';
import React, { FC } from 'react';
import { compose } from 'redux';

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import withUser, { UserProps } from '../../../shared/hocs/withUser';
import { withAdminCoreConfig } from '../../shared/hoc/with-admin-core-config';

const ContentPageDetailPage: FC<DefaultSecureRouteProps<ContentPageDetailProps> & UserProps> = ({
	match,
	commonUser,
}) => {
	const { id } = match.params;
	return (
		<ContentPageEdit
			className="c-admin-core c-admin__content-page-edit"
			id={id}
			commonUser={commonUser}
		/>
	);
};

export default compose(withAdminCoreConfig, withUser)(ContentPageDetailPage) as FC;

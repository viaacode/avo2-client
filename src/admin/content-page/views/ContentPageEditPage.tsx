import { ContentPageEdit } from '@meemoo/admin-core-ui';
import type { ContentPageDetailProps } from '@meemoo/admin-core-ui';
import React, { FunctionComponent } from 'react';

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { withAdminCoreConfig } from '../../shared/hoc/with-admin-core-config';

const ContentPageDetailPage: FunctionComponent<DefaultSecureRouteProps<ContentPageDetailProps>> = ({
	match,
}) => {
	const { id } = match.params;
	return <ContentPageEdit className="c-admin-core c-admin__content-page-edit" id={id} />;
};

export default withAdminCoreConfig(ContentPageDetailPage as FunctionComponent);

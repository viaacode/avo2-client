import { ContentPageEdit } from '@meemoo/admin-core-ui';
import { ContentPageDetailParams } from '@meemoo/admin-core-ui/dist/esm/react-admin/modules/content-page/types/content-pages.types';
import React, { FunctionComponent } from 'react';

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { withAdminCoreConfig } from '../../shared/hoc/with-admin-core-config';

const ContentPageDetailPage: FunctionComponent<
	DefaultSecureRouteProps<ContentPageDetailParams>
> = ({ match }) => {
	const { id } = match.params;

	return <ContentPageEdit id={id} />;
};

export default withAdminCoreConfig(ContentPageDetailPage as FunctionComponent);

import { ContentPageEdit } from '@meemoo/admin-core-ui';
import type { ContentPageDetailProps } from '@meemoo/admin-core-ui';
import React, { FunctionComponent } from 'react';

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { navigate } from '../../../shared/helpers';
import { Back } from '../../shared/components/Back/Back';
import { withAdminCoreConfig } from '../../shared/hoc/with-admin-core-config';
import { CONTENT_PAGE_PATH } from '../content-page.consts';

const ContentPageDetailPage: FunctionComponent<DefaultSecureRouteProps<ContentPageDetailProps>> = ({
	history,
	match,
}) => {
	const { id } = match.params;
	return (
		<ContentPageEdit
			className="c-admin-core c-admin__content-page-edit"
			id={id}
			renderBack={() => (
				<Back onClick={() => navigate(history, CONTENT_PAGE_PATH.CONTENT_PAGE_OVERVIEW)} />
			)}
		/>
	);
};

export default withAdminCoreConfig(ContentPageDetailPage as FunctionComponent);

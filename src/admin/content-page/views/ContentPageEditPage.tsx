import { CONTENT_PAGE_PATH, ContentPageEdit } from '@meemoo/admin-core-ui';
import type { ContentPageDetailProps } from '@meemoo/admin-core-ui';
import React, { FunctionComponent } from 'react';

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { navigate } from '../../../shared/helpers';
import { Back } from '../../shared/components/Back/Back';
import { ADMIN_CORE_ROUTE_PARTS } from '../../shared/constants/admin-core.routes';
import { withAdminCoreConfig } from '../../shared/hoc/with-admin-core-config';

const ContentPageDetailPage: FunctionComponent<DefaultSecureRouteProps<ContentPageDetailProps>> = ({
	history,
	match,
}) => {
	const { id } = match.params;

	return (
		<ContentPageEdit
			className="c-admin-core"
			id={id}
			renderBack={() => (
				<Back
					onClick={() =>
						navigate(history, CONTENT_PAGE_PATH(ADMIN_CORE_ROUTE_PARTS).OVERVIEW)
					}
				/>
			)}
		/>
	);
};

export default withAdminCoreConfig(ContentPageDetailPage as FunctionComponent);

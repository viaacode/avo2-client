import { CONTENT_PAGE_PATH, ContentPageDetail, ContentPageInfo } from '@meemoo/admin-core-ui';
import { ContentPageDetailProps } from '@meemoo/admin-core-ui/dist/esm/react-admin/modules/content-page/views/ContentPageDetail';
import React, { FunctionComponent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import MetaTags from 'react-meta-tags';

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { GENERATE_SITE_TITLE } from '../../../constants';
import { navigate } from '../../../shared/helpers';
import { Back } from '../../shared/components/Back/Back';
import { ADMIN_CORE_ROUTE_PARTS } from '../../shared/constants/admin-core.routes';
import { withAdminCoreConfig } from '../../shared/hoc/with-admin-core-config';

const ContentPageDetailPage: FunctionComponent<DefaultSecureRouteProps<ContentPageDetailProps>> = ({
	history,
	match,
}) => {
	const { id } = match.params;

	const [t] = useTranslation();
	const [item, setItem] = useState<ContentPageInfo | undefined>(undefined);

	return (
		<>
			{item && (
				<MetaTags>
					<title>{GENERATE_SITE_TITLE(item.title, t('Contentpagina detail'))}</title>
					<meta name="description" content={item.seoDescription || ''} />
				</MetaTags>
			)}
			<ContentPageDetail
				className="c-admin-core"
				id={id}
				loaded={setItem}
				renderBack={() => (
					<Back
						onClick={() =>
							navigate(history, CONTENT_PAGE_PATH(ADMIN_CORE_ROUTE_PARTS).OVERVIEW)
						}
					/>
				)}
			/>
		</>
	);
};

export default withAdminCoreConfig(ContentPageDetailPage as FunctionComponent);

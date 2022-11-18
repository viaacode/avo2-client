import { ContentPageDetail, ContentPageInfo } from '@meemoo/admin-core-ui';
import { ContentPageDetailParams } from '@meemoo/admin-core-ui/dist/esm/react-admin/modules/content-page/types/content-pages.types';
import React, { FunctionComponent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import MetaTags from 'react-meta-tags';

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { GENERATE_SITE_TITLE } from '../../../constants';
import { withAdminCoreConfig } from '../../shared/hoc/with-admin-core-config';

const ContentPageDetailPage: FunctionComponent<
	DefaultSecureRouteProps<ContentPageDetailParams>
> = ({ match }) => {
	const { id } = match.params;

	const [t] = useTranslation();
	const [item, setItem] = useState<ContentPageInfo | undefined>(undefined);

	return (
		<>
			{item && (
				<MetaTags>
					<title>{GENERATE_SITE_TITLE(item.title, t('Contentpagina detail'))}</title>
					<meta name="description" content={item.seo_description || ''} />
				</MetaTags>
			)}
			<ContentPageDetail id={id} loaded={setItem} />;
		</>
	);
};

export default withAdminCoreConfig(ContentPageDetailPage as FunctionComponent);

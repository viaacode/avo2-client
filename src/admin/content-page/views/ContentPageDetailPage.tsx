import { ContentPageDetail } from '@meemoo/admin-core-ui';
import type { ContentPageDetailProps, ContentPageInfo } from '@meemoo/admin-core-ui';
import React, { FunctionComponent, useState } from 'react';
import MetaTags from 'react-meta-tags';

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { GENERATE_SITE_TITLE } from '../../../constants';
import { navigate } from '../../../shared/helpers';
import useTranslation from '../../../shared/hooks/useTranslation';
import { Back } from '../../shared/components/Back/Back';
import { withAdminCoreConfig } from '../../shared/hoc/with-admin-core-config';
import { CONTENT_PAGE_PATH } from '../content-page.consts';

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
						onClick={() => navigate(history, CONTENT_PAGE_PATH.CONTENT_PAGE_OVERVIEW)}
					/>
				)}
			/>
		</>
	);
};

export default withAdminCoreConfig(ContentPageDetailPage as FunctionComponent);

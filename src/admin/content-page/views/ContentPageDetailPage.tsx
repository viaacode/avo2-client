import { ContentPageDetail } from '@meemoo/admin-core-ui';
import type { ContentPageDetailProps, ContentPageInfo } from '@meemoo/admin-core-ui';
import React, { FunctionComponent, useState } from 'react';
import MetaTags from 'react-meta-tags';

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { GENERATE_SITE_TITLE } from '../../../constants';
import useTranslation from '../../../shared/hooks/useTranslation';
import { withAdminCoreConfig } from '../../shared/hoc/with-admin-core-config';

const ContentPageDetailPage: FunctionComponent<DefaultSecureRouteProps<ContentPageDetailProps>> = ({
	match,
}) => {
	const { id } = match.params;

	const { tText } = useTranslation();
	const [item, setItem] = useState<ContentPageInfo | undefined>(undefined);

	return (
		<>
			{item && (
				<MetaTags>
					<title>
						{GENERATE_SITE_TITLE(
							item.title,
							tText(
								'admin/content-page/views/content-page-detail-page___contentpagina-detail'
							)
						)}
					</title>
					<meta name="description" content={item.seoDescription || ''} />
				</MetaTags>
			)}
			<ContentPageDetail className="c-admin-core" id={id} loaded={setItem} />
		</>
	);
};

export default withAdminCoreConfig(ContentPageDetailPage as FunctionComponent);
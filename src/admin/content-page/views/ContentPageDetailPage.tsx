import type { ContentPageDetailProps, ContentPageInfo } from '@meemoo/admin-core-ui/admin';
import { Flex, Spinner } from '@viaa/avo2-components';
import React, { type FC, lazy, Suspense, useState } from 'react';
import { Helmet } from 'react-helmet';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';

import { type DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { GENERATE_SITE_TITLE } from '../../../constants';
import { goBrowserBackWithFallback } from '../../../shared/helpers/go-browser-back-with-fallback';
import withUser, { type UserProps } from '../../../shared/hocs/withUser';
import useTranslation from '../../../shared/hooks/useTranslation';
import { ADMIN_PATH } from '../../admin.const';
import { withAdminCoreConfig } from '../../shared/hoc/with-admin-core-config';

const ContentPageDetail = lazy(() =>
	import('@meemoo/admin-core-ui/admin').then((adminCoreModule) => ({
		default: adminCoreModule.ContentPageDetail,
	}))
);

const ContentPageDetailPage: FC<
	DefaultSecureRouteProps<{ id: string }> & ContentPageDetailProps & UserProps
> = ({ match, history, commonUser }) => {
	const { id } = match.params;

	const { tText } = useTranslation();
	const [item, setItem] = useState<ContentPageInfo | undefined>(undefined);

	return (
		<>
			{item && (
				<Helmet>
					<title>
						{GENERATE_SITE_TITLE(
							item.title,
							tText(
								'admin/content-page/views/content-page-detail-page___contentpagina-detail'
							)
						)}
					</title>
					<meta name="description" content={item.seoDescription || ''} />
				</Helmet>
			)}
			<Suspense
				fallback={
					<Flex orientation="horizontal" center>
						<Spinner size="large" />
					</Flex>
				}
			>
				<ContentPageDetail
					className="c-admin-core"
					id={id}
					loaded={setItem}
					commonUser={commonUser}
					onGoBack={() =>
						goBrowserBackWithFallback(ADMIN_PATH.CONTENT_PAGE_OVERVIEWS, history)
					}
				/>
			</Suspense>
		</>
	);
};

export default compose(withAdminCoreConfig, withUser, withRouter)(ContentPageDetailPage) as FC;

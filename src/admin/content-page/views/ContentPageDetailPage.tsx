import type { ContentPageInfo } from '@meemoo/admin-core-ui/dist/admin.mjs';
import { Flex, Spinner } from '@viaa/avo2-components';
import { useAtomValue } from 'jotai';
import React, { type FC, lazy, Suspense, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useMatch, useNavigate } from 'react-router';

import { commonUserAtom } from '../../../authentication/authentication.store';
import { GENERATE_SITE_TITLE } from '../../../constants';
import { goBrowserBackWithFallback } from '../../../shared/helpers/go-browser-back-with-fallback';
import { useTranslation } from '../../../shared/hooks/useTranslation';
import { ADMIN_PATH } from '../../admin.const';
import { withAdminCoreConfig } from '../../shared/hoc/with-admin-core-config';
import { CONTENT_PAGE_PATH } from '../content-page.consts';

const ContentPageDetail = lazy(() =>
	import('@meemoo/admin-core-ui/dist/admin.mjs').then((adminCoreModule) => ({
		default: adminCoreModule.ContentPageDetail,
	}))
);

const ContentPageDetailPage: FC = () => {
	const navigateFunc = useNavigate();
	const match = useMatch<'id', string>(CONTENT_PAGE_PATH.CONTENT_PAGE_DETAIL);
	const id = match?.params.id;
	const commonUser = useAtomValue(commonUserAtom);

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
				{!!id && (
					<ContentPageDetail
						className="c-admin-core"
						id={id}
						loaded={setItem}
						commonUser={commonUser}
						onGoBack={() =>
							goBrowserBackWithFallback(
								ADMIN_PATH.CONTENT_PAGE_OVERVIEWS,
								navigateFunc
							)
						}
					/>
				)}
			</Suspense>
		</>
	);
};

export default withAdminCoreConfig(ContentPageDetailPage) as FC;

import type { ContentPageInfo } from '@meemoo/admin-core-ui/admin';
import { PermissionName } from '@viaa/avo2-types';
import { useAtomValue } from 'jotai';
import React, { type FC, lazy, Suspense, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, useParams } from 'react-router';

import { commonUserAtom } from '../../../authentication/authentication.store';
import { PermissionGuard } from '../../../authentication/components/PermissionGuard';
import { GENERATE_SITE_TITLE } from '../../../constants';
import { FullPageSpinner } from '../../../shared/components/FullPageSpinner/FullPageSpinner';
import { goBrowserBackWithFallback } from '../../../shared/helpers/go-browser-back-with-fallback';
import { tText } from '../../../shared/helpers/translate-text';
import { ADMIN_PATH } from '../../admin.const';
import { withAdminCoreConfig } from '../../shared/hoc/with-admin-core-config';

const ContentPageDetail = lazy(() =>
	import('@meemoo/admin-core-ui/admin').then((adminCoreModule) => ({
		default: adminCoreModule.ContentPageDetail,
	}))
);

const ContentPageDetailPage: FC = () => {
	const navigateFunc = useNavigate();
	const { id } = useParams<{ id: string }>();
	const commonUser = useAtomValue(commonUserAtom);

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
			<Suspense fallback={<FullPageSpinner />}>
				<PermissionGuard
					permissions={[
						PermissionName.EDIT_OWN_CONTENT_PAGES,
						PermissionName.EDIT_ANY_CONTENT_PAGES,
					]}
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
				</PermissionGuard>
			</Suspense>
		</>
	);
};

export default withAdminCoreConfig(ContentPageDetailPage) as FC;

import { Flex, Spinner } from '@viaa/avo2-components';
import React, { type FC, lazy, Suspense } from 'react';
import { useMatch, useNavigate } from 'react-router';

import { goBrowserBackWithFallback } from '../../../shared/helpers/go-browser-back-with-fallback';
import { ADMIN_PATH } from '../../admin.const';
import { withAdminCoreConfig } from '../../shared/hoc/with-admin-core-config';
import { CONTENT_PAGE_LABEL_PATH } from '../content-page-label.const';

const ContentPageLabelDetail = lazy(() =>
	import('@meemoo/admin-core-ui/admin').then((adminCoreModule) => ({
		default: adminCoreModule.ContentPageLabelDetail,
	}))
);

const ContentPageLabelDetailPage: FC = () => {
	const navigateFunc = useNavigate();
	const match = useMatch<'id', string>(CONTENT_PAGE_LABEL_PATH.CONTENT_PAGE_LABEL_DETAIL);

	const id = match?.params.id;

	return (
		<Suspense
			fallback={
				<Flex orientation="horizontal" center>
					<Spinner size="large" />
				</Flex>
			}
		>
			{!!id && (
				<ContentPageLabelDetail
					contentPageLabelId={id}
					className="c-admin-core c-admin__content-page-label-detail"
					onGoBack={() =>
						goBrowserBackWithFallback(
							ADMIN_PATH.CONTENT_PAGE_LABEL_OVERVIEW,
							navigateFunc
						)
					}
				/>
			)}
		</Suspense>
	);
};

export default withAdminCoreConfig(ContentPageLabelDetailPage as FC<any>) as FC;

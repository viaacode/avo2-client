import { Flex, Spinner } from '@viaa/avo2-components';
import React, { type FC, lazy, Suspense } from 'react';
import { useMatch, useNavigate } from 'react-router';

import { buildLink } from '../../../shared/helpers/build-link';
import { goBrowserBackWithFallback } from '../../../shared/helpers/go-browser-back-with-fallback';
import { ADMIN_PATH } from '../../admin.const';
import { withAdminCoreConfig } from '../../shared/hoc/with-admin-core-config';
import { CONTENT_PAGE_LABEL_PATH } from '../content-page-label.const';

const ContentPageLabelEdit = lazy(() =>
	import('@meemoo/admin-core-ui/admin').then((adminCoreModule) => ({
		default: adminCoreModule.ContentPageLabelEdit,
	}))
);

const ContentPageLabelEditPage: FC = () => {
	const navigateFunc = useNavigate();
	const match = useMatch<'id', string>(CONTENT_PAGE_LABEL_PATH.CONTENT_PAGE_LABEL_EDIT);

	const contentPageLabelId = match?.params.id;

	return (
		<Suspense
			fallback={
				<Flex orientation="horizontal" center>
					<Spinner size="large" />
				</Flex>
			}
		>
			<ContentPageLabelEdit
				className="c-admin-core c-admin__content-page-label-edit"
				contentPageLabelId={contentPageLabelId}
				onGoBack={() =>
					goBrowserBackWithFallback(
						buildLink(ADMIN_PATH.CONTENT_PAGE_DETAIL, { id: contentPageLabelId }),
						navigateFunc
					)
				}
			/>
		</Suspense>
	);
};

export default withAdminCoreConfig(ContentPageLabelEditPage) as FC;

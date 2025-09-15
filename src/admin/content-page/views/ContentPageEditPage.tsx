import type { ContentPageDetailProps } from '@meemoo/admin-core-ui/dist/admin.mjs';
import { Flex, Spinner } from '@viaa/avo2-components';
import React, { type FC, lazy, Suspense, useState } from 'react';
import { useMatch, useNavigate } from 'react-router';
import { compose } from 'redux';

import { BeforeUnloadPrompt } from '../../../shared/components/BeforeUnloadPrompt/BeforeUnloadPrompt';
import { buildLink } from '../../../shared/helpers/build-link';
import { goBrowserBackWithFallback } from '../../../shared/helpers/go-browser-back-with-fallback';
import withUser, { type UserProps } from '../../../shared/hocs/withUser';
import { useWarningBeforeUnload } from '../../../shared/hooks/useWarningBeforeUnload';
import { ADMIN_PATH } from '../../admin.const';
import { withAdminCoreConfig } from '../../shared/hoc/with-admin-core-config';
import { CONTENT_PAGE_PATH } from '../content-page.consts';

const ContentPageEdit = lazy(() =>
	import('@meemoo/admin-core-ui/dist/admin.mjs').then((adminCoreModule) => ({
		default: adminCoreModule.ContentPageEdit,
	}))
);

const ContentPageDetailPage: FC<ContentPageDetailProps & UserProps> = ({ commonUser }) => {
	const navigateFunc = useNavigate();
	const match = useMatch<'id', string>(CONTENT_PAGE_PATH.CONTENT_PAGE_EDIT);

	const contentPageId = match?.params.id;

	const [hasUnsavedChanges] = useState<boolean>(true);

	useWarningBeforeUnload({
		when: hasUnsavedChanges,
	});

	return (
		<Suspense
			fallback={
				<Flex orientation="horizontal" center>
					<Spinner size="large" />
				</Flex>
			}
		>
			<ContentPageEdit
				className="c-admin-core c-admin__content-page-edit"
				id={contentPageId}
				commonUser={commonUser}
				onGoBack={() =>
					goBrowserBackWithFallback(
						buildLink(ADMIN_PATH.CONTENT_PAGE_DETAIL, { id: contentPageId }),
						navigateFunc
					)
				}
			/>
			<BeforeUnloadPrompt when={hasUnsavedChanges} />
		</Suspense>
	);
};

export default compose(withAdminCoreConfig, withUser)(ContentPageDetailPage) as FC;

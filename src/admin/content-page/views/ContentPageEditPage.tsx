import { Flex, Spinner } from '@viaa/avo2-components';
import { useAtomValue } from 'jotai';
import React, { type FC, lazy, Suspense, useState } from 'react';
import { useMatch, useNavigate } from 'react-router';

import { commonUserAtom } from '../../../authentication/authentication.store';
import { BeforeUnloadPrompt } from '../../../shared/components/BeforeUnloadPrompt/BeforeUnloadPrompt';
import { buildLink } from '../../../shared/helpers/build-link';
import { goBrowserBackWithFallback } from '../../../shared/helpers/go-browser-back-with-fallback';
import { useWarningBeforeUnload } from '../../../shared/hooks/useWarningBeforeUnload';
import { ADMIN_PATH } from '../../admin.const';
import { withAdminCoreConfig } from '../../shared/hoc/with-admin-core-config';
import { CONTENT_PAGE_PATH } from '../content-page.consts';

const ContentPageEdit = lazy(() =>
	import('@meemoo/admin-core-ui/admin').then((adminCoreModule) => ({
		default: adminCoreModule.ContentPageEdit,
	}))
);

const ContentPageDetailPage: FC = () => {
	const navigateFunc = useNavigate();
	const match = useMatch<'id', string>(CONTENT_PAGE_PATH.CONTENT_PAGE_EDIT);

	const contentPageId = match?.params.id;

	const commonUser = useAtomValue(commonUserAtom);
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

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
				onHasUnsavedChangesChanged={setHasUnsavedChanges}
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

export default withAdminCoreConfig(ContentPageDetailPage) as FC;

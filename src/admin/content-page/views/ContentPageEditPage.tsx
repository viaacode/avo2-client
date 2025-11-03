import { PermissionName } from '@viaa/avo2-types';
import { useAtomValue } from 'jotai';
import React, { type FC, lazy, Suspense, useState } from 'react';
import { useMatch, useNavigate } from 'react-router';

import { commonUserAtom } from '../../../authentication/authentication.store';
import { PermissionGuard } from '../../../authentication/components/PermissionGuard';
import { BeforeUnloadPrompt } from '../../../shared/components/BeforeUnloadPrompt/BeforeUnloadPrompt';
import { FullPageSpinner } from '../../../shared/components/FullPageSpinner/FullPageSpinner';
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
		<Suspense fallback={<FullPageSpinner />}>
			<PermissionGuard
				permissions={[
					PermissionName.EDIT_OWN_CONTENT_PAGES,
					PermissionName.EDIT_ANY_CONTENT_PAGES,
				]}
			>
				<ContentPageEdit
					className="c-admin-core c-admin__content-page-edit"
					id={contentPageId}
					commonUser={commonUser}
					onHasUnsavedChangesChanged={(state) => {
						setHasUnsavedChanges(state);
					}}
					onGoBack={() =>
						goBrowserBackWithFallback(
							buildLink(ADMIN_PATH.CONTENT_PAGE_DETAIL, { id: contentPageId }),
							navigateFunc
						)
					}
				/>
				<BeforeUnloadPrompt when={hasUnsavedChanges} />
			</PermissionGuard>
		</Suspense>
	);
};

export default withAdminCoreConfig(ContentPageDetailPage) as FC;

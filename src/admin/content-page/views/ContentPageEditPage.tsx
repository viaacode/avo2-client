import type { ContentPageDetailProps } from '@meemoo/admin-core-ui/admin';
import { Flex, Spinner } from '@viaa/avo2-components';
import React, { type FC, lazy, Suspense, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';

import { type DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { BeforeUnloadPrompt } from '../../../shared/components/BeforeUnloadPrompt/BeforeUnloadPrompt';
import { buildLink } from '../../../shared/helpers/build-link';
import { goBrowserBackWithFallback } from '../../../shared/helpers/go-browser-back-with-fallback';
import withUser, { type UserProps } from '../../../shared/hocs/withUser';
import { useWarningBeforeUnload } from '../../../shared/hooks/useWarningBeforeUnload';
import { ADMIN_PATH } from '../../admin.const';
import { withAdminCoreConfig } from '../../shared/hoc/with-admin-core-config';

const ContentPageEdit = lazy(() =>
	import('@meemoo/admin-core-ui/admin').then((adminCoreModule) => ({
		default: adminCoreModule.ContentPageEdit,
	}))
);

const ContentPageDetailPage: FC<
	DefaultSecureRouteProps<{ id: string }> & ContentPageDetailProps & UserProps
> = ({ match, history, commonUser }) => {
	const { id } = match.params;

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
				id={id}
				commonUser={commonUser}
				onHasUnsavedChangesChanged={setHasUnsavedChanges}
				onGoBack={() =>
					goBrowserBackWithFallback(
						buildLink(ADMIN_PATH.CONTENT_PAGE_DETAIL, { id }),
						history
					)
				}
			/>
			<BeforeUnloadPrompt when={hasUnsavedChanges} />
		</Suspense>
	);
};

export default compose(withAdminCoreConfig, withUser, withRouter)(ContentPageDetailPage) as FC;

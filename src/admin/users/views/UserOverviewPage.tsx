import { Flex, Spinner } from '@viaa/avo2-components';
import { type Avo } from '@viaa/avo2-types';
import { useAtomValue } from 'jotai';
import React, { type FC, lazy, Suspense } from 'react';
import { Helmet } from 'react-helmet';

import { commonUserAtom } from '../../../authentication/authentication.store';
import { GENERATE_SITE_TITLE } from '../../../constants';
import { useTranslation } from '../../../shared/hooks/useTranslation';
import { AdminLayout } from '../../shared/layouts/AdminLayout/AdminLayout';
import { AdminLayoutBody } from '../../shared/layouts/AdminLayout/AdminLayout.slots';

const UserOverview = lazy(() =>
	import('@meemoo/admin-core-ui/dist/admin.mjs').then((adminCoreModule) => ({
		default: adminCoreModule.UserOverview,
	}))
);

export const UserOverviewPage: FC = () => {
	const { tText } = useTranslation();
	const commonUser = useAtomValue(commonUserAtom);

	return (
		<AdminLayout
			pageTitle={tText('admin/users/views/user-overview___gebruikers')}
			size="full-width"
		>
			<AdminLayoutBody>
				<Helmet>
					<title>
						{GENERATE_SITE_TITLE(
							tText(
								'admin/users/views/user-overview___gebruikersbeheer-overzicht-pagina-titel'
							)
						)}
					</title>
					<meta
						name="description"
						content={tText(
							'admin/users/views/user-overview___gebruikersbeheer-overzicht-pagina-beschrijving'
						)}
					/>
				</Helmet>

				<Suspense
					fallback={
						<Flex orientation="horizontal" center>
							<Spinner size="large" />
						</Flex>
					}
				>
					<UserOverview commonUser={commonUser as Avo.User.CommonUser} />
				</Suspense>
			</AdminLayoutBody>
		</AdminLayout>
	);
};

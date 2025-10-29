import { Button, Flex, Spinner } from '@viaa/avo2-components';
import { PermissionName } from '@viaa/avo2-types';
import React, { type FC, lazy, Suspense, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { compose } from 'redux';

import { type DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { GENERATE_SITE_TITLE } from '../../../constants';
import withUser, { type UserProps } from '../../../shared/hocs/withUser';
import useTranslation from '../../../shared/hooks/useTranslation';
import { withAdminCoreConfig } from '../../shared/hoc/with-admin-core-config';
import { AdminLayout } from '../../shared/layouts/AdminLayout/AdminLayout';
import {
	AdminLayoutBody,
	AdminLayoutTopBarRight,
} from '../../shared/layouts/AdminLayout/AdminLayout.slots';
import { CONTENT_PAGE_PATH } from '../content-page.consts';

import './ContentPage.scss';

const ContentPageOverview = lazy(() =>
	import('@meemoo/admin-core-ui/admin').then((adminCoreModule) => ({
		default: adminCoreModule.ContentPageOverview,
	}))
);

const { CREATE_CONTENT_PAGES } = PermissionName;

const ContentPageOverviewPage: FC<DefaultSecureRouteProps & UserProps> = ({
	history,
	commonUser,
}) => {
	const { tText } = useTranslation();

	const hasPerm = useCallback(
		(permission: PermissionName) => commonUser?.permissions?.includes(permission),
		[commonUser]
	);

	const renderPageContent = () => {
		return (
			<Suspense
				fallback={
					<Flex orientation="horizontal" center>
						<Spinner size="large" />
					</Flex>
				}
			>
				<ContentPageOverview commonUser={commonUser} />
			</Suspense>
		);
	};

	return (
		<AdminLayout
			pageTitle={tText(
				'admin/content-page/views/content-page-overview-page___contentoverzicht'
			)}
			className="c-admin-core c-admin-core__content-page"
			size="full-width"
		>
			<AdminLayoutTopBarRight>
				{hasPerm(CREATE_CONTENT_PAGES) && (
					<Button
						label={tText('admin/content/views/content-overview___content-toevoegen')}
						title={tText(
							'admin/content/views/content-overview___maak-een-nieuwe-content-pagina-aan'
						)}
						onClick={() => history.push(CONTENT_PAGE_PATH.CONTENT_PAGE_CREATE)}
					/>
				)}
			</AdminLayoutTopBarRight>
			<AdminLayoutBody>
				<Helmet>
					<title>
						{GENERATE_SITE_TITLE(
							tText(
								'admin/content-page/views/content-page-overview-page___contentpaginas-beheer'
							)
						)}
					</title>
					<meta
						name="description"
						content={tText(
							'admin/content-page/views/content-page-overview-page___contentbeheer-beheer-content-paginas-via-dit-overzicht'
						)}
					/>
				</Helmet>
				{renderPageContent()}
			</AdminLayoutBody>
		</AdminLayout>
	);
};

export default compose(withAdminCoreConfig, withUser)(ContentPageOverviewPage) as FC;

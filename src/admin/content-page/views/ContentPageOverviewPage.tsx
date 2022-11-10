import { CONTENT_PAGE_PATH, ContentPageOverview } from '@meemoo/admin-core-ui';
import { Button } from '@viaa/avo2-components';
import React, { FunctionComponent, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import MetaTags from 'react-meta-tags';

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import {
	PermissionName,
	PermissionService,
} from '../../../authentication/helpers/permission-service';
import { GENERATE_SITE_TITLE } from '../../../constants';
import { withAdminCoreConfig } from '../../shared/hoc/with-admin-core-config';
import { AdminLayout, AdminLayoutBody, AdminLayoutTopBarRight } from '../../shared/layouts';

const { CREATE_CONTENT_PAGES } = PermissionName;

const ContentPageOverviewPage: FunctionComponent<DefaultSecureRouteProps> = ({ history, user }) => {
	const [t] = useTranslation();

	const hasPerm = useCallback(
		(permission: PermissionName) => PermissionService.hasPerm(user, permission),
		[user]
	);

	const renderPageContent = () => {
		return <ContentPageOverview />;
	};

	return (
		<AdminLayout
			pageTitle={t('admin/content-page/views/content-page-overview-page___contentoverzicht')}
			size="full-width"
		>
			<AdminLayoutTopBarRight>
				{hasPerm(CREATE_CONTENT_PAGES) && (
					<Button
						label={t('admin/content/views/content-overview___content-toevoegen')}
						title={t(
							'admin/content/views/content-overview___maak-een-nieuwe-content-pagina-aan'
						)}
						onClick={() => history.push(CONTENT_PAGE_PATH.CREATE)}
					/>
				)}
			</AdminLayoutTopBarRight>
			<AdminLayoutBody>
				<MetaTags>
					<title>
						{GENERATE_SITE_TITLE(
							t(
								'admin/content-page/views/content-page-overview-page___contentpaginas-beheer'
							)
						)}
					</title>
					<meta
						name="description"
						content={t(
							'admin/content-page/views/content-page-overview-page___contentbeheer-beheer-content-paginas-via-dit-overzicht'
						)}
					/>
				</MetaTags>
				Banaan
				{renderPageContent()}
			</AdminLayoutBody>
		</AdminLayout>
	);
};

export default withAdminCoreConfig(ContentPageOverviewPage as FunctionComponent);

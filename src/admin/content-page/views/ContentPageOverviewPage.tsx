import { ContentPageOverview } from '@meemoo/admin-core-ui';
import { Button } from '@viaa/avo2-components';
import { PermissionName } from '@viaa/avo2-types';
import React, { FunctionComponent, useCallback } from 'react';
import MetaTags from 'react-meta-tags';

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { PermissionService } from '../../../authentication/helpers/permission-service';
import { GENERATE_SITE_TITLE } from '../../../constants';
import useTranslation from '../../../shared/hooks/useTranslation';
import { withAdminCoreConfig } from '../../shared/hoc/with-admin-core-config';
import { AdminLayout, AdminLayoutBody, AdminLayoutTopBarRight } from '../../shared/layouts';
import { CONTENT_PAGE_PATH } from '../content-page.consts';

import './ContentPage.scss';

const { CREATE_CONTENT_PAGES } = PermissionName;

const ContentPageOverviewPage: FunctionComponent<DefaultSecureRouteProps> = ({ history, user }) => {
	const { tText } = useTranslation();

	const hasPerm = useCallback(
		(permission: PermissionName) => PermissionService.hasPerm(user, permission),
		[user]
	);

	const renderPageContent = () => {
		return <ContentPageOverview />;
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
				<MetaTags>
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
				</MetaTags>
				{renderPageContent()}
			</AdminLayoutBody>
		</AdminLayout>
	);
};

export default withAdminCoreConfig(ContentPageOverviewPage as FunctionComponent);
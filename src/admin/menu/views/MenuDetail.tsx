import { NavigationDetail } from '@meemoo/admin-core-ui';
import React, { FunctionComponent } from 'react';
import MetaTags from 'react-meta-tags';

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { GENERATE_SITE_TITLE } from '../../../constants';
import useTranslation from '../../../shared/hooks/useTranslation';
import { withAdminCoreConfig } from '../../shared/hoc/with-admin-core-config';

import './MenuDetail.scss';

type MenuDetailProps = DefaultSecureRouteProps<{ menu: string }>;

const MenuDetail: FunctionComponent<MenuDetailProps> = ({ match }) => {
	const { tText } = useTranslation();

	const menuId = match.params.menu;
	console.log('menuId: ', menuId);

	return (
		<>
			<MetaTags>
				<title>
					{GENERATE_SITE_TITLE(
						menuId,
						tText('admin/menu/views/menu-detail___menu-beheer-detail-pagina-titel')
					)}
				</title>
				<meta
					name="description"
					content={tText(
						'admin/menu/views/menu-detail___menu-beheer-detail-pagina-beschrijving'
					)}
				/>
			</MetaTags>
			<NavigationDetail navigationBarId={menuId} />
		</>
	);
};

export default withAdminCoreConfig(MenuDetail as FunctionComponent);

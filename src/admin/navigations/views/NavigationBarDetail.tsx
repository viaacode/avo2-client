import { NavigationDetail } from '@meemoo/admin-core-ui';
import React, { FunctionComponent } from 'react';
import MetaTags from 'react-meta-tags';

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { GENERATE_SITE_TITLE } from '../../../constants';
import useTranslation from '../../../shared/hooks/useTranslation';
import { withAdminCoreConfig } from '../../shared/hoc/with-admin-core-config';

import './NavigationBarDetail.scss';

type NavigationBarDetailProps = DefaultSecureRouteProps<{ menu: string }>;

const NavigationBarDetail: FunctionComponent<NavigationBarDetailProps> = ({ match }) => {
	const { tText } = useTranslation();

	const navigationBarId = match.params.menu;

	return (
		<div className="c-admin__navigation-detail">
			<MetaTags>
				<title>
					{GENERATE_SITE_TITLE(
						navigationBarId,
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
			<NavigationDetail navigationBarId={navigationBarId} />
		</div>
	);
};

export default withAdminCoreConfig(NavigationBarDetail as FunctionComponent);

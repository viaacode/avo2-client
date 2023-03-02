import { NavigationOverview } from '@meemoo/admin-core-ui';
import React, { FC } from 'react';
import MetaTags from 'react-meta-tags';

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { GENERATE_SITE_TITLE } from '../../../constants';
import useTranslation from '../../../shared/hooks/useTranslation';
import { withAdminCoreConfig } from '../../shared/hoc/with-admin-core-config';

import './NavigationBarOverview.scss';

type NavigationBarOverviewProps = DefaultSecureRouteProps;

const NavigationBarOverview: FC<NavigationBarOverviewProps> = () => {
	const { tText } = useTranslation();

	return (
		<div className="c-admin__navigation-overview">
			<MetaTags>
				<title>
					{GENERATE_SITE_TITLE(
						tText('admin/menu/views/menu-overview___menu-overzicht-beheer-pagina-titel')
					)}
				</title>
				<meta
					name="description"
					content={tText(
						'admin/menu/views/menu-overview___menu-overzicht-beheer-pagina-beschrijving'
					)}
				/>
			</MetaTags>
			<NavigationOverview />
		</div>
	);
};

export default withAdminCoreConfig(NavigationBarOverview as FC) as FC;

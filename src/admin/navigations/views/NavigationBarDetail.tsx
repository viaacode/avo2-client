import { NavigationDetail } from '@meemoo/admin-core-ui';
import React, { FunctionComponent } from 'react';
import { Helmet } from 'react-helmet';

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { GENERATE_SITE_TITLE } from '../../../constants';
import useTranslation from '../../../shared/hooks/useTranslation';
import { withAdminCoreConfig } from '../../shared/hoc/with-admin-core-config';

import './NavigationBarDetail.scss';

type NavigationBarDetailProps = DefaultSecureRouteProps<{ navigationBarId: string }>;

const NavigationBarDetail: FunctionComponent<NavigationBarDetailProps> = ({ match }) => {
	const { tText } = useTranslation();

	const navigationBarId = match.params.navigationBarId;

	return (
		<div className="c-admin__navigation-detail">
			<Helmet>
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
			</Helmet>
			<NavigationDetail navigationBarId={navigationBarId} />
		</div>
	);
};

export default withAdminCoreConfig(NavigationBarDetail as FunctionComponent);

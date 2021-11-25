import React, { FunctionComponent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import MetaTags from 'react-meta-tags';

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { GENERATE_SITE_TITLE } from '../../../constants';
import { LoadingErrorLoadedComponent, LoadingInfo } from '../../../shared/components';
import { AdminLayout, AdminLayoutBody } from '../../shared/layouts';

interface QuickLaneOverviewProps extends DefaultSecureRouteProps {}

const QuickLaneOverview: FunctionComponent<QuickLaneOverviewProps> = ({ user }) => {
	const [t] = useTranslation();
	const [loadingInfo] = useState<LoadingInfo>({ state: 'loaded' });

	console.info(user);

	return (
		<AdminLayout
			pageTitle={t('admin/quick-lane/views/quick-lane-overview___gedeelde-links')}
			size="full-width"
		>
			<AdminLayoutBody>
				<MetaTags>
					<title>
						{GENERATE_SITE_TITLE(
							t(
								'admin/quick-lane/views/quick-lane-overview___gedeelde-links-overview-pagina-titel'
							)
						)}
					</title>
					<meta
						name="description"
						content={t(
							'admin/quick-lane/views/quick-lane-overview___gedeelde-links-overview-pagina-beschrijving'
						)}
					/>
				</MetaTags>
				<LoadingErrorLoadedComponent
					loadingInfo={loadingInfo}
					dataObject={[]}
					render={() => <h1>Overview</h1>}
				/>
			</AdminLayoutBody>
		</AdminLayout>
	);
};

export default QuickLaneOverview;

import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import MetaTags from 'react-meta-tags';

import { GENERATE_SITE_TITLE } from '../../constants';

const Notifications: FunctionComponent = () => {
	const [t] = useTranslation();

	return (
		<>
			<MetaTags>
				<title>
					{GENERATE_SITE_TITLE(
						t('settings/components/notifications___notificatie-voorkeuren-pagina-titel')
					)}
				</title>
				<meta
					name="description"
					content={t(
						'settings/components/notifications___notificatie-voorkeuren-pagina-beschrijving'
					)}
				/>
			</MetaTags>
			<span>TODO notificaties</span>
		</>
	);
};

export default Notifications;

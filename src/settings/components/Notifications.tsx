import React, { FunctionComponent } from 'react';
import MetaTags from 'react-meta-tags';

import { GENERATE_SITE_TITLE } from '../../constants';
import useTranslation from '../../shared/hooks/useTranslation';

const Notifications: FunctionComponent = () => {
	const { tText } = useTranslation();

	return (
		<>
			<MetaTags>
				<title>
					{GENERATE_SITE_TITLE(
						tText(
							'settings/components/notifications___notificatie-voorkeuren-pagina-titel'
						)
					)}
				</title>
				<meta
					name="description"
					content={tText(
						'settings/components/notifications___notificatie-voorkeuren-pagina-beschrijving'
					)}
				/>
			</MetaTags>
			<span>TODO notificaties</span>
		</>
	);
};

export default Notifications;

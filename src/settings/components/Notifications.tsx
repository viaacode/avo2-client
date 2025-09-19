import React, { type FC } from 'react';
import { Helmet } from 'react-helmet';

import { GENERATE_SITE_TITLE } from '../../constants';
import { useTranslation } from '../../shared/hooks/useTranslation';

const Notifications: FC = () => {
	const { tText } = useTranslation();

	return (
		<>
			<Helmet>
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
			</Helmet>
			<span>TODO notificaties</span>
		</>
	);
};

Notifications as FC;

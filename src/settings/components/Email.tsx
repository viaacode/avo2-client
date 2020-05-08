import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import MetaTags from 'react-meta-tags';

import { GENERATE_SITE_TITLE } from '../../constants';

export interface EmailProps {}

const Email: FunctionComponent<EmailProps> = () => {
	const [t] = useTranslation();

	return (
		<>
			<MetaTags>
				<title>{GENERATE_SITE_TITLE(t('Nieuwsbrief voorkeuren pagina titel'))}</title>
				<meta
					name="description"
					content={t('Nieuwsbrief voorkeuren pagina beschrijving')}
				/>
			</MetaTags>
			<span>TODO email</span>
		</>
	);
};

export default Email;

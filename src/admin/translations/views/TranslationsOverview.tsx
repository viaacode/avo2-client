import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import { Container } from '@viaa/avo2-components';
import {
	KeyValueEditor,
	// KeyValuePair,
	// KeyValueEditorTableCols,
} from '@viaa/avo2-components/src/components/KeyValueEditor/KeyValueEditor';

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';

import { AdminLayout, AdminLayoutBody } from '../../shared/layouts';

// import { TRANSLATIONS_PATH } from '../translations.const';

interface TranslationsOverviewProps extends DefaultSecureRouteProps {}

const TranslationsOverview: FunctionComponent<TranslationsOverviewProps> = () => {
	const [t] = useTranslation();

	const translations = [
		{
			name: 'translations-front-end',
			value: {
				'my-button-tekst': 'Toepassen',
				'my-title-on-home-page': 'Homepagina',
			},
		},
		{
			name: 'translations-back-end',
			value: {
				'my-error': 'Incorrect',
			},
		},
	];

	const renderTranslationsEditor = (translations: any) => {
		return <KeyValueEditor data={translations[0].value} />;
	};

	return (
		<AdminLayout pageTitle={t('admin/menu/views/menu-overview___navigatie-overzicht')}>
			<AdminLayoutBody>
				<Container mode="vertical" size="small">
					<Container mode="horizontal">
						<h1>test</h1>
						{renderTranslationsEditor(translations)}
						{/* <DataQueryComponent
							renderData={renderTranslationsOverview}
							resultPath="app_content_nav_elements"
							query={GET_MENUS}
						/> */}
					</Container>
				</Container>
			</AdminLayoutBody>
		</AdminLayout>
	);
};

export default TranslationsOverview;

import { get } from 'lodash-es';
import React, { FunctionComponent, Reducer, useEffect, useReducer } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Container, KeyValueEditor } from '@viaa/avo2-components';

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';

import { AdminLayout, AdminLayoutActions, AdminLayoutBody } from '../../shared/layouts';
import { translationsReducer } from '../translations.reducers';
import { fetchTranslations, updateTranslations } from '../translations.service';
import {
	Translation,
	TranslationsAction,
	TranslationsActionType,
	TranslationsState,
} from '../translations.types';

interface TranslationsOverviewProps extends DefaultSecureRouteProps {}

const TranslationsOverview: FunctionComponent<TranslationsOverviewProps> = () => {
	const [t] = useTranslation();

	const [translations, dispatch] = useReducer<Reducer<Translation[], TranslationsAction>>(
		translationsReducer,
		[]
	);

	useEffect(() => {
		// retrieve translations
		fetchTranslations().then((translations: TranslationsState[]) =>
			dispatch({
				type: TranslationsActionType.SET_TRANSLATIONS,
				payload: convertTranslationsToData(translations),
			})
		);
	}, []);

	const onChangeTranslations = (updatedTranslations: Translation[]) => {
		// update translations state
		dispatch({
			type: TranslationsActionType.SET_TRANSLATIONS,
			payload: updatedTranslations,
		});
	};

	const onSaveTranslations = () => {
		// convert translations to db format and save translations
		convertDataToTranslations(translations).forEach((context: TranslationsState) => {
			updateTranslations(context.name, context);
		});
	};

	const convertTranslationsToData = (translations: TranslationsState[]) => {
		// convert translations to state format
		return translations
			.map((context: TranslationsState) => {
				// convert object-based translations to array-based translations
				const translationsArray: Translation[] = Object.entries(get(context, 'value'));

				// add context to translations id
				return translationsArray.map(item => [
					`${get(context, 'name').replace('translations-', '')}/${item[0]}`,
					item[1],
				]);
			})
			.flat(1);
	};

	const convertDataToTranslations = (data: Translation[]) => {
		return data.reduce((acc: TranslationsState[], curr: Translation) => {
			// retrieve context name
			const currentContext = curr[0].split('/')[0];

			// retrieve index of translations of the current context
			const currentContextIndex = acc.findIndex(
				(context: any) => context.name === `translations-${currentContext}`
			);

			// if current context does not exist, make it exist
			if (!acc.length || !acc[currentContextIndex]) {
				acc.push({
					name: `translations-${currentContext}`,
					value: {
						[curr[0].replace(`${currentContext}/`, '')]: curr[1],
					},
				});
			} else {
				// if current context exists, add translation
				acc[currentContextIndex].value[curr[0].replace(`${currentContext}/`, '')] = curr[1];
			}

			return acc;
		}, []);
	};

	return (
		<AdminLayout pageTitle={t('Vertalingen')}>
			<AdminLayoutBody>
				<Container mode="vertical" size="small">
					<Container mode="horizontal">
						{!!translations.length && (
							<KeyValueEditor data={translations} onChange={onChangeTranslations} />
						)}
					</Container>
				</Container>
			</AdminLayoutBody>
			<AdminLayoutActions>
				<Button label="Opslaan" onClick={onSaveTranslations} />
			</AdminLayoutActions>
		</AdminLayout>
	);
};

export default TranslationsOverview;

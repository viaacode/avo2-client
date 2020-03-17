import { flatten, fromPairs, get, groupBy, map } from 'lodash-es';
import React, { FunctionComponent, Reducer, useEffect, useReducer } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Container, KeyValueEditor } from '@viaa/avo2-components';

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { ToastService } from '../../../shared/services';

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

	const onSaveTranslations = async () => {
		// convert translations to db format and save translations
		const promises: any = [];

		// TODO: type
		await convertDataToTranslations(translations).forEach((context: any) => {
			promises.push(updateTranslations(context.name, context));
		});

		Promise.all(promises)
			.then(() => {
				ToastService.success(t('De vertalingen zijn opgeslagen.'));
			})
			.catch(() => {
				ToastService.danger(t('Het opslaan van de vertaling is mislukt.'));
			});
	};

	const convertTranslationsToData = (translations: TranslationsState[]) => {
		// convert translations to state format
		return flatten(
			translations.map((context: TranslationsState) => {
				// convert object-based translations to array-based translations
				const translationsArray: Translation[] = Object.entries(get(context, 'value'));

				// add context to translations id
				return translationsArray.map(item => [
					`${get(context, 'name').replace('translations-', '')}/${item[0]}`,
					item[1],
				]);
			})
		);
	};

	const splitOnFirstSlash = (text: string): string[] => {
		const firstSlashIndex = text.indexOf('/');
		return [text.substring(0, firstSlashIndex), text.substring(firstSlashIndex + 1)];
	};

	const convertDataToTranslations = (data: Translation[]) => {
		const translationsPerContext = groupBy(data, dataItem => {
			return splitOnFirstSlash(dataItem[0])[0];
		});

		return map(translationsPerContext, (translations: Translation, context: string) => ({
			name: `translations-${context}`,
			value: fromPairs(
				translations.map(translation => [
					splitOnFirstSlash(translation[0])[1],
					translation[1],
				])
			),
		}));
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

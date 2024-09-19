import { Button, Flex, Modal, ModalBody, ModalFooterRight, Spinner } from '@viaa/avo2-components';
import { flatten, fromPairs, get, groupBy, isNil, map } from 'lodash-es';
import React, {
	type FunctionComponent,
	lazy,
	type ReactNode,
	Suspense,
	useCallback,
	useState,
} from 'react';
import { Helmet } from 'react-helmet';

import { GENERATE_SITE_TITLE } from '../../../constants';
import { CustomError } from '../../../shared/helpers';
import useTranslation from '../../../shared/hooks/useTranslation';
import { ToastService } from '../../../shared/services/toast-service';
import { withAdminCoreConfig } from '../../shared/hoc/with-admin-core-config';
import { AdminLayout, AdminLayoutBody, AdminLayoutTopBarRight } from '../../shared/layouts';
import { fetchTranslations, updateTranslations } from '../translations.service';
import { type Translation, type TranslationsState } from '../translations.types';

import './TranslationsOverviewPage.scss';

const TranslationsOverview = lazy(() =>
	import('@meemoo/admin-core-ui/dist/admin.mjs').then((adminCoreModule) => ({
		default: adminCoreModule.TranslationsOverview,
	}))
);

const TranslationsOverviewPage: FunctionComponent = () => {
	const { tText, tHtml } = useTranslation();

	const [initialTranslations, setInitialTranslations] = useState<Translation[]>([]);
	const [translations, setTranslations] = useState<Translation[]>([]);

	const getTranslations = useCallback(async () => {
		fetchTranslations()
			.then((translationsState: TranslationsState[]) => {
				const translationRows = convertTranslationsToData(translationsState);
				setInitialTranslations(translationRows);
				setTranslations(translationRows);
			})
			.catch((err) => {
				console.error(new CustomError('Failed to fetch translations', err));
				ToastService.danger(
					tHtml(
						'admin/translations/views/translations-overview___het-ophalen-van-de-vertalingen-is-mislukt'
					)
				);
			});
	}, [tText]);

	const onSaveTranslations = async () => {
		// convert translations to db format and save translations
		const promises: any = [];

		const freshTranslations = convertTranslationsToData(await fetchTranslations());

		const updatedTranslations = freshTranslations.map(
			(freshTranslation: Translation): [string, string] => {
				const initialTranslation = initialTranslations.find(
					(trans) => trans[0] === freshTranslation[0]
				);
				const currentTranslation = translations.find(
					(trans) => trans[0] === freshTranslation[0]
				);

				if (isNil(currentTranslation)) {
					// This translation has been added to the database but didn't exist yet when the page was loaded
					return freshTranslation;
				}

				if (
					!isNil(initialTranslation) &&
					!isNil(currentTranslation) &&
					initialTranslation[1] !== currentTranslation[1]
				) {
					// This translation has changed since the page was loaded
					return currentTranslation;
				}

				// This translation has not changed, we write the fresh value from the database back to the database
				return freshTranslation;
			}
		);

		convertDataToTranslations(updatedTranslations).forEach((context: any) => {
			promises.push(updateTranslations(context.name, context));
		});

		try {
			await Promise.all(promises);

			await getTranslations();

			ToastService.success(
				tHtml(
					'admin/translations/views/translations-overview___de-vertalingen-zijn-opgeslagen'
				)
			);
		} catch (err) {
			console.error(new CustomError('Failed to save translations', err));
			ToastService.danger(
				tHtml(
					'admin/translations/views/translations-overview___het-opslaan-van-de-vertalingen-is-mislukt'
				)
			);
		}
	};

	const convertDataToTranslations = (data: Translation[]) => {
		const translationsPerContext = groupBy(data, (dataItem) => {
			return splitOnFirstSlash(dataItem[0])[0];
		});

		return map(translationsPerContext, (translations: Translation, context: string) => ({
			name: `translations-${context}`,
			value: fromPairs(
				translations.map((translation) => [
					splitOnFirstSlash(translation[0])[1],
					translation[1],
				])
			),
		}));
	};

	const splitOnFirstSlash = (text: string): string[] => {
		const firstSlashIndex = text.indexOf('/');
		return [text.substring(0, firstSlashIndex), text.substring(firstSlashIndex + 1)];
	};

	const convertTranslationsToData = (translations: TranslationsState[]): Translation[] => {
		// convert translations to state format
		return flatten(
			translations.map((context: TranslationsState) => {
				// convert object-based translations to array-based translations
				const translationsArray: Translation[] = Object.entries(get(context, 'value'));

				// add context to translations id
				return translationsArray.map(
					(item: Translation): Translation => [
						`${get(context, 'name').replace('translations-', '')}/${item[0]}`,
						item[1],
					]
				);
			})
		);
	};

	const renderPopup = ({
		title,
		body,
		isOpen,
		onSave,
		onClose,
	}: {
		title: string | ReactNode;
		body: ReactNode;
		onSave: () => void;
		onClose: () => void;
		isOpen: boolean;
	}) => {
		const renderFooter = () => {
			return (
				<div className="u-px-32 u-py-24">
					<Button
						onClick={onSave}
						label={tText('pages/admin/vertalingen-v-2/index___bewaar-wijzigingen')}
					/>

					<Button
						onClick={onClose}
						label={tText('pages/admin/vertalingen-v-2/index___annuleer')}
					/>
				</div>
			);
		};

		return (
			<Modal
				className="c-translations-overview__modal"
				title={title}
				isOpen={isOpen}
				onClose={onClose}
			>
				<ModalBody>{body}</ModalBody>
				<ModalFooterRight>{renderFooter()}</ModalFooterRight>
			</Modal>
		);
	};

	return (
		<AdminLayout
			pageTitle={tText('admin/translations/views/translations-overview___vertalingen')}
			size="full-width"
		>
			<AdminLayoutTopBarRight>
				<Button label="Opslaan" onClick={onSaveTranslations} />
			</AdminLayoutTopBarRight>
			<AdminLayoutBody>
				<Helmet>
					<title>
						{GENERATE_SITE_TITLE(
							tText(
								'admin/translations/views/translations-overview___vertalingen-beheer-pagina-titel'
							)
						)}
					</title>
					<meta
						name="description"
						content={tText(
							'admin/translations/views/translations-overview___vertalingen-beheer-pagina-beschrijving'
						)}
					/>
				</Helmet>
				<Suspense
					fallback={
						<Flex orientation="horizontal" center>
							<Spinner size="large" />
						</Flex>
					}
				>
					<TranslationsOverview
						renderPopup={renderPopup}
						className="c-translations-overview"
					/>
				</Suspense>
			</AdminLayoutBody>
		</AdminLayout>
	);
};

export default withAdminCoreConfig(TranslationsOverviewPage) as FunctionComponent;

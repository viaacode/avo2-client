import { get, truncate } from 'lodash-es';
import React, { FunctionComponent, ReactText, useCallback, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import MetaTags from 'react-meta-tags';
import { Link } from 'react-router-dom';

import { Button, ButtonToolbar, TagList } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { CollectionService } from '../../../collection/collection.service';
import { QualityLabel } from '../../../collection/collection.types';
import { APP_PATH, GENERATE_SITE_TITLE } from '../../../constants';
import { ErrorView } from '../../../error/views';
import {
	CheckboxOption,
	LoadingErrorLoadedComponent,
	LoadingInfo,
} from '../../../shared/components';
import { buildLink, CustomError } from '../../../shared/helpers';
import { useEducationLevels, useSubjects } from '../../../shared/hooks';
import { ToastService } from '../../../shared/services';
import { ITEMS_PER_PAGE } from '../../content/content.const';
import FilterTable, { getFilters } from '../../shared/components/FilterTable/FilterTable';
import { AdminLayout, AdminLayoutBody } from '../../shared/layouts';
import { useUserGroups } from '../../user-groups/hooks';
import {
	COLLECTIONS_OR_BUNDLES_PATH,
	GET_COLLECTION_ACTUALISATION_COLUMNS,
} from '../collections-or-bundles.const';
import { CollectionsOrBundlesService } from '../collections-or-bundles.service';
import {
	CollectionOrBundleActualisationOverviewTableCols,
	CollectionOrBundleActualisationTableState,
} from '../collections-or-bundles.types';
import { generateCollectionWhereObject } from '../helpers/collection-filters';
import { renderCollectionOverviewColumns } from '../helpers/render-collection-columns';

interface CollectionOrBundleActualisationOverviewProps extends DefaultSecureRouteProps {}

const CollectionOrBundleActualisationOverview: FunctionComponent<CollectionOrBundleActualisationOverviewProps> = ({
	location,
	user,
}) => {
	const [t] = useTranslation();

	const [collections, setCollections] = useState<Avo.Collection.Collection[] | null>(null);
	const [collectionCount, setCollectionCount] = useState<number>(0);
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	const [tableState, setTableState] = useState<
		Partial<CollectionOrBundleActualisationTableState>
	>({});
	const [collectionLabels, setCollectionLabels] = useState<QualityLabel[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const [selectedCollectionIds, setSelectedCollectionIds] = useState<string[]>([]);

	const [userGroups] = useUserGroups(false);
	const [subjects] = useSubjects();
	const [educationLevels] = useEducationLevels();

	// computed
	const isCollection =
		location.pathname === COLLECTIONS_OR_BUNDLES_PATH.COLLECTION_ACTUALISATION_OVERVIEW;

	// methods
	const generateWhereObject = useCallback(
		(filters: Partial<CollectionOrBundleActualisationTableState>) => {
			const andFilters: any[] = generateCollectionWhereObject(
				filters,
				user,
				isCollection,
				true,
				false
			);
			andFilters.push({
				is_managed: { _eq: true },
			});

			return { _and: andFilters };
		},
		[isCollection, user]
	);

	const fetchCollectionsOrBundles = useCallback(async () => {
		setIsLoading(true);

		try {
			const [
				collectionsTemp,
				collectionsCountTemp,
			] = await CollectionsOrBundlesService.getCollectionEditorial(
				tableState.page || 0,
				(tableState.sort_column ||
					'created_at') as CollectionOrBundleActualisationOverviewTableCols,
				tableState.sort_order || 'desc',
				generateWhereObject(getFilters(tableState)),
				'actualisation'
			);
			setCollections(collectionsTemp);
			setCollectionCount(collectionsCountTemp);
		} catch (err) {
			console.error(
				new CustomError('Failed to get collection actualisations from the database', err, {
					tableState,
				})
			);
			setLoadingInfo({
				state: 'error',
				message: isCollection
					? t('Het ophalen van de collectie actualisaties is mislukt')
					: t('Het ophalen van de bundel actualisaties is mislukt'),
			});
		}
		setIsLoading(false);
	}, [
		setLoadingInfo,
		setCollections,
		setCollectionCount,
		tableState,
		isCollection,
		t,
		generateWhereObject,
	]);

	const fetchCollectionLabels = useCallback(async () => {
		try {
			setCollectionLabels(await CollectionService.fetchQualityLabels());
		} catch (err) {
			console.error(new CustomError('Failed to get quality labels from the database', err));
			ToastService.danger(
				t(
					'admin/collections-or-bundles/views/collections-or-bundles-overview___het-ophalen-van-de-labels-is-mislukt'
				)
			);
		}
	}, [setCollectionLabels, t]);

	useEffect(() => {
		fetchCollectionsOrBundles();
		fetchCollectionLabels();
	}, [fetchCollectionsOrBundles, fetchCollectionLabels]);

	useEffect(() => {
		if (collections) {
			setLoadingInfo({
				state: 'loaded',
			});
		}

		// Update selected rows to always be a subset of the collections array
		// In other words, you cannot have something selected that isn't part of the current filtered/paginated results
		const collectionIds: string[] = (collections || []).map((coll) => coll.id);
		setSelectedCollectionIds((currentSelectedCollectionIds) => {
			return (currentSelectedCollectionIds || []).filter(
				(collId) => collId && collectionIds.includes(collId)
			);
		});
	}, [setLoadingInfo, collections, setSelectedCollectionIds]);

	const setAllCollectionsAsSelected = async () => {
		setIsLoading(true);
		try {
			const collectionIds = await CollectionsOrBundlesService.getCollectionIds(
				generateWhereObject(getFilters(tableState))
			);
			ToastService.info(
				t(
					'admin/collections-or-bundles/views/collections-or-bundles-overview___je-hebt-num-of-selected-collections-collecties-geselecteerd',
					{
						numOfSelectedCollections: collectionIds.length,
					}
				)
			);
			setSelectedCollectionIds(collectionIds);
		} catch (err) {
			console.error(
				new CustomError(
					'Failed to get all collection ids that match the selected filter',
					err,
					{ tableState }
				)
			);
			ToastService.danger('Het ophalen van de collectie ids is mislukt');
		}
		setIsLoading(false);
	};

	const userGroupOptions = userGroups.map(
		(option): CheckboxOption => ({
			id: String(option.id),
			label: option.label as string,
			checked: get(tableState, 'author.user_groups', [] as string[]).includes(
				String(option.id)
			),
		})
	);

	const collectionLabelOptions = [
		{
			id: 'NO_LABEL',
			label: t(
				'admin/collections-or-bundles/views/collections-or-bundles-overview___geen-label'
			),
			checked: get(tableState, 'collection_labels', [] as string[]).includes('NO_LABEL'),
		},
		...collectionLabels.map(
			(option): CheckboxOption => ({
				id: String(option.value),
				label: option.description,
				checked: get(tableState, 'collection_labels', [] as string[]).includes(
					String(option.value)
				),
			})
		),
	];

	const renderTableCell = (
		rowData: Partial<Avo.Collection.Collection>,
		columnId: CollectionOrBundleActualisationOverviewTableCols
	) => {
		const editLink = buildLink(
			isCollection ? APP_PATH.COLLECTION_EDIT_TAB.route : APP_PATH.BUNDLE_EDIT_TAB.route,
			{ id: rowData.id, tabId: 'actualisation' }
		);
		switch (columnId) {
			case 'title':
				// TODO remove cast to any once update to typings v2.28.0
				const title = truncate((rowData as any)[columnId] || '-', { length: 50 });
				return (
					<Link to={editLink}>
						<span>{title}</span>
						{!!get(rowData, 'relations[0].object') && (
							<a
								href={buildLink(APP_PATH.COLLECTION_DETAIL.route, {
									id: get(rowData, 'relations[0].object'),
								})}
							>
								<TagList
									tags={[
										{ id: get(rowData, 'relations[0].object'), label: 'Kopie' },
									]}
									swatches={false}
								/>
							</a>
						)}
					</Link>
				);

			case 'actions':
				return (
					<ButtonToolbar>
						<Link to={editLink}>
							<Button
								type="secondary"
								icon="edit"
								ariaLabel={
									isCollection
										? t(
												'admin/collections-or-bundles/views/collections-or-bundles-overview___bewerk-de-collectie'
										  )
										: t(
												'admin/collections-or-bundles/views/collections-or-bundles-overview___bewerk-de-bundel'
										  )
								}
								title={
									isCollection
										? t(
												'admin/collections-or-bundles/views/collections-or-bundles-overview___bewerk-de-collectie'
										  )
										: t(
												'admin/collections-or-bundles/views/collections-or-bundles-overview___bewerk-de-bundel'
										  )
								}
							/>
						</Link>
					</ButtonToolbar>
				);

			default:
				return renderCollectionOverviewColumns(rowData, columnId, collectionLabels);
		}
	};

	const renderNoResults = () => {
		return (
			<ErrorView
				message={t(
					'admin/collections-or-bundles/views/collections-or-bundles-overview___er-bestaan-nog-geen-collecties'
				)}
			>
				<p>
					<Trans i18nKey="admin/collections-or-bundles/views/collections-or-bundles-overview___beschrijving-wanneer-er-nog-geen-collecties-zijn">
						Beschrijving wanneer er nog geen collecties zijn
					</Trans>
				</p>
			</ErrorView>
		);
	};

	const renderCollectionOrBundleActualisationOverview = () => {
		if (!collections) {
			return null;
		}
		return (
			<>
				<FilterTable
					columns={GET_COLLECTION_ACTUALISATION_COLUMNS(
						userGroupOptions,
						collectionLabelOptions,
						subjects,
						educationLevels
					)}
					data={collections}
					dataCount={collectionCount}
					renderCell={renderTableCell as any}
					searchTextPlaceholder={t('Zoek op titel, beschrijving, auteur')}
					noContentMatchingFiltersMessage={
						isCollection
							? t(
									'Er zijn geen collectie actualisaties die voldoen aan de opgegeven filters'
							  )
							: t(
									'Er zijn geen bundel actualisaties die voldoen aan de opgegeven filters'
							  )
					}
					itemsPerPage={ITEMS_PER_PAGE}
					onTableStateChanged={setTableState}
					renderNoResults={renderNoResults}
					rowKey="id"
					selectedItemIds={selectedCollectionIds}
					onSelectionChanged={setSelectedCollectionIds as (ids: ReactText[]) => void}
					onSelectAll={setAllCollectionsAsSelected}
					isLoading={isLoading}
				/>
			</>
		);
	};

	return (
		<AdminLayout
			pageTitle={isCollection ? t('Collecties Actualisatie') : t('Bundels Actualisatie')}
			size="full-width"
		>
			<AdminLayoutBody>
				<MetaTags>
					<title>
						{GENERATE_SITE_TITLE(
							isCollection
								? t('collectie-actualisation-beheer-overview-pagina-titel')
								: t('bundel-actualisation-beheer-overview-pagina-titel')
						)}
					</title>
					<meta
						name="description"
						content={
							isCollection
								? t('collectie-actualisation-beheer-overview-pagina-beschrijving')
								: t('bundel-actualisation-beheer-overview-pagina-beschrijving')
						}
					/>
				</MetaTags>
				<LoadingErrorLoadedComponent
					loadingInfo={loadingInfo}
					dataObject={collections}
					render={renderCollectionOrBundleActualisationOverview}
				/>
			</AdminLayoutBody>
		</AdminLayout>
	);
};

export default CollectionOrBundleActualisationOverview;

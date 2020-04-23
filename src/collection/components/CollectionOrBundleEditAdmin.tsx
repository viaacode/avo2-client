import H from 'history';
import React, { FunctionComponent, ReactNode, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
	BlockHeading,
	Button,
	Column,
	Container,
	Form,
	FormGroup,
	Grid,
	Spacer,
	Table,
	TagInfo,
	TagsInput,
	TextArea,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { ContentPicker } from '../../admin/shared/components/ContentPicker/ContentPicker';
import { PickerItem } from '../../admin/shared/types';
import { buildLink, CustomError } from '../../shared/helpers';
import { ToastService } from '../../shared/services';

import { get, orderBy } from 'lodash-es';
import { redirectToClientPage } from '../../authentication/helpers/redirects';
import { APP_PATH } from '../../constants';
import { CollectionService } from '../collection.service';
import { QualityLabel } from '../collection.types';
import { CollectionAction } from './CollectionOrBundleEdit';

type BundleColumnId = 'title' | 'author' | 'organization' | 'actions';

const columnIdToBundlePath: { [columnId in BundleColumnId]: string } = {
	title: 'title',
	author: 'profile.usersByuserId.last_name',
	organization: 'profile.profile_organizations[0].organization_id',
	actions: '',
};

interface CollectionOrBundleEditAdminProps {
	collection: Avo.Collection.Collection;
	changeCollectionState: (action: CollectionAction) => void;
	history: H.History;
}

const CollectionOrBundleEditAdmin: FunctionComponent<CollectionOrBundleEditAdminProps> = ({
	collection,
	changeCollectionState,
	history,
}) => {
	const [t] = useTranslation();

	// State
	const [qualityLabels, setQualityLabels] = useState<TagInfo[] | null>(null);
	const [bundlesContainingCollection, setBundlesContainingCollection] = useState<
		Avo.Collection.Collection[] | undefined
	>(undefined);
	const [bundleSortColumn, setBundleSortColumn] = useState<string>('title');
	const [bundleSortOrder, setBundleSortOrder] = useState<Avo.Search.OrderDirection>('asc');

	// Computed
	const isCollection: boolean = collection.type_id === 3;

	const fetchBundlesByCollectionUuid = useCallback(async () => {
		try {
			if (!collection) {
				return;
			}
			const colls = await CollectionService.fetchCollectionsByFragmentId(collection.id);
			setBundlesContainingCollection(colls);
		} catch (err) {
			console.error(
				new CustomError('Failed to get bundles containing collection', err, {
					collection,
				})
			);
			ToastService.danger(
				t('Het ophalen van de bundles die deze collectie bevatten is mislukt')
			);
		}
	}, [setBundlesContainingCollection, t, collection]);

	const fetchQualityLabels = useCallback(async () => {
		try {
			const dbLabels = await CollectionService.fetchQualityLabels();
			setQualityLabels(
				dbLabels.map((dbLabel: QualityLabel) => ({
					label: dbLabel.description,
					value: dbLabel.value,
				}))
			);
		} catch (err) {
			console.error(new CustomError('Failed to fetch quality labels', err));
			ToastService.danger(
				t(
					'collection/components/collection-or-bundle-edit-admin___het-ophalen-van-de-kwaliteitslabels-is-mislukt'
				)
			);
		}
	}, [setQualityLabels, t]);

	useEffect(() => {
		fetchBundlesByCollectionUuid();
		fetchQualityLabels();
	}, [fetchBundlesByCollectionUuid, fetchQualityLabels]);

	const updateCollectionMultiProperty = (
		selectedTagOptions: TagInfo[],
		collectionProp: keyof Avo.Collection.Collection
	) => {
		changeCollectionState({
			collectionProp,
			type: 'UPDATE_COLLECTION_PROP',
			collectionPropValue: (selectedTagOptions || []).map(tag => ({
				label: tag.value as string,
			})) as any,
		});
	};

	const getCollectionLabels = (): TagInfo[] => {
		if (!qualityLabels) {
			return [];
		}
		const labelIds = ((collection.collection_labels || []) as Avo.Collection.Label[]).map(
			(item: any) => item.label
		);
		return qualityLabels.filter(qualityLabel => labelIds.includes(qualityLabel.value));
	};

	const navigateToBundleDetail = (id: string) => {
		const link = buildLink(APP_PATH.BUNDLE_DETAIL.route, { id });
		redirectToClientPage(link, history);
	};

	const handleBundleColumnClick = (columnId: BundleColumnId) => {
		const sortOrder = bundleSortOrder === 'asc' ? 'desc' : 'asc'; // toggle
		setBundleSortColumn(columnId);
		setBundleSortOrder(sortOrder);
		setBundlesContainingCollection(
			orderBy(
				bundlesContainingCollection,
				[coll => get(coll, columnIdToBundlePath[columnId])],
				[sortOrder]
			)
		);
	};

	const renderBundleCell = (
		rowData: Partial<Avo.Collection.Collection>,
		columnId: BundleColumnId
	): ReactNode => {
		switch (columnId) {
			case 'author':
				const user = get(rowData, 'profile.usersByuserId');
				if (!user) {
					return '-';
				}
				return `${user.first_name} ${user.last_name}`;

			case 'organization':
				return get(rowData, 'profile.profile_organizations[0].organization_id', '-');

			case 'actions':
				return (
					<Button
						type="borderless"
						icon="eye"
						title={t('Ga naar de bundel detail pagina')}
						ariaLabel={t('Ga naar de bundel detail pagina')}
						onClick={evt => {
							evt.stopPropagation();
							navigateToBundleDetail(rowData.id as string);
						}}
					/>
				);

			default:
				return rowData[columnId];
		}
	};

	const owner: PickerItem | undefined = collection.profile
		? {
				label: `${collection.profile.user.first_name} ${collection.profile.user.last_name} (${collection.profile.user.mail})`,
				type: 'PROFILE',
				value: collection.profile.id,
		  }
		: undefined;

	return (
		<>
			<Container mode="vertical">
				<Container mode="horizontal">
					<Form>
						<Spacer margin="bottom">
							<Grid>
								<Column size="3-7">
									<FormGroup
										label={t(
											'collection/components/collection-or-bundle-edit-admin___kwaliteitslabels'
										)}
									>
										{!!qualityLabels && (
											<TagsInput
												options={qualityLabels}
												value={getCollectionLabels()}
												onChange={(values: TagInfo[]) =>
													updateCollectionMultiProperty(
														values,
														'collection_labels'
													)
												}
											/>
										)}
									</FormGroup>
									<FormGroup label={t('Eigenaar')}>
										<ContentPicker
											initialValue={owner}
											hideTargetSwitch
											hideTypeDropdown
											allowedTypes={['PROFILE']}
											onSelect={(value: PickerItem | null) => {
												if (!value) {
													return;
												}
												changeCollectionState({
													type: 'UPDATE_COLLECTION_PROP',
													collectionProp: 'owner_profile_id',
													collectionPropValue: value.value,
												});
											}}
										/>
									</FormGroup>
									<FormGroup
										label={t(
											'collection/views/collection-edit-meta-data___persoonlijke-opmerkingen-notities'
										)}
										labelFor="personalRemarkId"
									>
										<TextArea
											name="personalRemarkId"
											value={collection.note || ''}
											id="personalRemarkId"
											height="medium"
											placeholder={t(
												'collection/views/collection-edit-meta-data___geef-hier-je-persoonlijke-opmerkingen-notities-in'
											)}
											onChange={(value: string) =>
												changeCollectionState({
													type: 'UPDATE_COLLECTION_PROP',
													collectionProp: 'note',
													collectionPropValue: value,
												})
											}
										/>
									</FormGroup>
								</Column>
								<Column size="3-5">
									<></>
								</Column>
							</Grid>

							{/* Show bundles that contain this collection */}
							{isCollection && (
								<>
									<Spacer margin="top-extra-large">
										<BlockHeading type="h2">
											{t('Bundels die deze collectie bevatten')}
										</BlockHeading>
									</Spacer>
									{!!bundlesContainingCollection &&
									!!bundlesContainingCollection.length ? (
										<Table
											columns={[
												{ label: t('Titel'), id: 'title', sortable: true },
												{
													label: t('Auteur'),
													id: 'author',
													sortable: true,
												},
												{
													label: 'Organisatie',
													id: 'organization',
													sortable: false,
												},
												{ label: '', id: 'actions', sortable: false },
											]}
											data={bundlesContainingCollection}
											emptyStateMessage={t(
												'Deze collectie is in geen enkele bundel opgenomen'
											)}
											onColumnClick={handleBundleColumnClick as any}
											onRowClick={coll => navigateToBundleDetail(coll.id)}
											renderCell={renderBundleCell as any}
											sortColumn={bundleSortColumn}
											sortOrder={bundleSortOrder}
											variant="bordered"
											rowKey="id"
										/>
									) : (
										t('Deze collectie is in geen enkele bundel opgenomen')
									)}
								</>
							)}
						</Spacer>
					</Form>
				</Container>
			</Container>
		</>
	);
};

export default CollectionOrBundleEditAdmin;

import { BlockHeading } from '@meemoo/admin-core-ui/dist/client.mjs';
import {
	Button,
	Checkbox,
	Column,
	Container,
	Form,
	FormGroup,
	Grid,
	Icon,
	IconName,
	Spacer,
	Table,
	type TagInfo,
	TagsInput,
	TextArea,
	TextInput,
} from '@viaa/avo2-components';
import { type Avo, PermissionName } from '@viaa/avo2-types';
import { get, noop, orderBy } from 'lodash-es';
import React, { type FC, type ReactNode, useCallback, useEffect, useState } from 'react';
import { type RouteComponentProps } from 'react-router-dom';

import { ContentPicker } from '../../admin/shared/components/ContentPicker/ContentPicker';
import { type PickerItem } from '../../admin/shared/types';
import { PermissionService } from '../../authentication/helpers/permission-service';
import { redirectToClientPage } from '../../authentication/helpers/redirects';
import { APP_PATH } from '../../constants';
import AssociatedQuickLaneTable, {
	AssociatedQuickLaneTableOrderBy,
} from '../../quick-lane/components/AssociatedQuickLaneTable';
import { OrderDirection } from '../../search/search.const';
import { QUICK_LANE_DEFAULTS } from '../../shared/constants/quick-lane';
import { buildLink, CustomError, formatTimestamp, getFullName } from '../../shared/helpers';
import { ACTIONS_TABLE_COLUMN_ID } from '../../shared/helpers/table-column-list-to-csv-column-list';
import { toggleSortOrder } from '../../shared/helpers/toggle-sort-order';
import { truncateTableValue } from '../../shared/helpers/truncate';
import withUser, { type UserProps } from '../../shared/hocs/withUser';
import useTranslation from '../../shared/hooks/useTranslation';
import { QualityLabelsService } from '../../shared/services/quality-labels.service';
import { QuickLaneContainingService } from '../../shared/services/quick-lane-containing.service';
import { ToastService } from '../../shared/services/toast-service';
import { type QuickLaneUrlObject } from '../../shared/types';
import { TableColumnDataType } from '../../shared/types/table-column-data-type';
import { CollectionService } from '../collection.service';
import { type QualityLabel } from '../collection.types';

import { type CollectionAction } from './CollectionOrBundleEdit';

type BundleColumnId =
	| 'title'
	| 'author'
	| 'is_public'
	| 'organization'
	| typeof ACTIONS_TABLE_COLUMN_ID;

/* eslint-disable @typescript-eslint/no-unused-vars */
const columnIdToBundlePath: { [columnId in BundleColumnId]: string } = {
	/* eslint-enable @typescript-eslint/no-unused-vars */
	title: 'title',
	author: 'profile.user.last_name',
	is_public: 'is_public',
	organization: 'profile.profile_organizations[0].organization_id',
	actions: '',
};

interface CollectionOrBundleEditAdminProps {
	collection: Avo.Collection.Collection;
	changeCollectionState: (action: CollectionAction) => void;
	history: RouteComponentProps['history'];
	onFocus?: () => void;
}

const CollectionOrBundleEditAdmin: FC<CollectionOrBundleEditAdminProps & UserProps> = ({
	collection,
	changeCollectionState,
	history,
	commonUser,
	onFocus,
}) => {
	const { tText, tHtml } = useTranslation();

	// State
	const [qualityLabels, setQualityLabels] = useState<TagInfo[] | null>(null);

	const [bundlesContainingCollection, setBundlesContainingCollection] = useState<
		Avo.Collection.Collection[] | undefined
	>(undefined);
	const [bundleSortColumn, setBundleSortColumn] = useState<string>('title');
	const [bundleSortOrder, setBundleSortOrder] = useState<Avo.Search.OrderDirection>(
		OrderDirection.asc
	);

	const [associatedQuickLanes, setAssociatedQuickLanes] = useState<QuickLaneUrlObject[]>([]);
	const [quickLaneSortColumn, setQuickLaneSortColumn] = useState<string>(
		QUICK_LANE_DEFAULTS.sort_column
	);
	const [quickLaneSortOrder, setQuickLaneSortOrder] = useState<Avo.Search.OrderDirection>(
		OrderDirection.asc
	);

	// Computed
	const isCollection: boolean = collection.type_id === 3;

	const fetchBundlesByCollectionUuid = useCallback(async () => {
		try {
			if (!collection) {
				return;
			}
			setBundlesContainingCollection(
				await CollectionService.fetchCollectionsByFragmentId(collection.id)
			);
		} catch (err) {
			console.error(
				new CustomError('Failed to get bundles containing collection', err, {
					collection,
				})
			);
			ToastService.danger(
				tHtml(
					'collection/components/collection-or-bundle-edit-admin___het-ophalen-van-de-bundles-die-deze-collectie-bevatten-is-mislukt'
				)
			);
		}
	}, [collection, tHtml]);

	const fetchQualityLabels = useCallback(async () => {
		try {
			const dbLabels = await QualityLabelsService.fetchQualityLabels();
			setQualityLabels(
				dbLabels.map((dbLabel: QualityLabel) => ({
					label: dbLabel.description,
					value: dbLabel.value,
				}))
			);
		} catch (err) {
			console.error(new CustomError('Failed to fetch quality labels', err));
			ToastService.danger(
				tHtml(
					'collection/components/collection-or-bundle-edit-admin___het-ophalen-van-de-kwaliteitslabels-is-mislukt'
				)
			);
		}
	}, [tHtml]);

	const fetchAssociatedQuickLanes = useCallback(async () => {
		try {
			if (!collection) {
				return;
			}

			const quickLanes = await QuickLaneContainingService.fetchQuickLanesByContentId(
				collection.id
			);

			setAssociatedQuickLanes(quickLanes);
		} catch (err) {
			console.error(
				new CustomError('Failed to get quick lane urls containing item', err, {
					collection,
				})
			);
			ToastService.danger(
				tHtml(
					'collection/components/collection-or-bundle-edit-admin___het-ophalen-van-de-gedeelde-links-die-naar-deze-collectie-leiden-is-mislukt'
				)
			);
		}
	}, [collection, tHtml]);

	useEffect(() => {
		fetchBundlesByCollectionUuid().then(noop);
		fetchQualityLabels().then(noop);
		fetchAssociatedQuickLanes().then(noop);
	}, [fetchBundlesByCollectionUuid, fetchQualityLabels, fetchAssociatedQuickLanes]);

	const updateCollectionMultiProperty = (
		selectedTagOptions: TagInfo[],
		collectionProp: keyof Avo.Collection.Collection
	) => {
		changeCollectionState({
			collectionProp,
			type: 'UPDATE_COLLECTION_PROP',
			collectionPropValue: (selectedTagOptions || []).map((tag) => ({
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
		return qualityLabels.filter((qualityLabel) => labelIds.includes(qualityLabel.value));
	};

	const navigateToBundleDetail = (id: string) => {
		const link = buildLink(APP_PATH.BUNDLE_DETAIL.route, { id });
		redirectToClientPage(link, history);
	};

	const handleBundleColumnClick = (columnId: BundleColumnId) => {
		const sortOrder = toggleSortOrder(bundleSortOrder);
		setBundleSortColumn(columnId);
		setBundleSortOrder(sortOrder);
		setBundlesContainingCollection(
			orderBy(
				bundlesContainingCollection,
				[(coll) => get(coll, columnIdToBundlePath[columnId])],
				[sortOrder]
			)
		);
	};

	const handleQuickLaneColumnClick = (id: string) => {
		const sortOrder = toggleSortOrder(quickLaneSortOrder);

		setQuickLaneSortColumn(id);
		setQuickLaneSortOrder(sortOrder);

		setAssociatedQuickLanes(
			orderBy(
				associatedQuickLanes,
				[(col) => get(col, AssociatedQuickLaneTableOrderBy[id] || id)],
				[sortOrder]
			)
		);
	};

	const renderBundleCell = (
		rowData: Partial<Avo.Collection.Collection>,
		columnId: BundleColumnId
	): ReactNode => {
		switch (columnId) {
			case 'author': {
				const user = rowData.profile?.user;
				if (user) {
					return truncateTableValue(`${user.first_name} ${user.last_name}`);
				}
				return '-';
			}

			case 'organization':
				return get(rowData, 'profile.organisation.name', '-');

			case 'is_public':
				return (
					<div
						title={
							rowData.is_public
								? tText(
										'collection/components/collection-or-bundle-overview___publiek'
								  )
								: tText(
										'collection/components/collection-or-bundle-overview___niet-publiek'
								  )
						}
					>
						<Icon name={rowData.is_public ? IconName.unlock3 : IconName.lock} />
					</div>
				);

			case ACTIONS_TABLE_COLUMN_ID:
				return (
					<Button
						type="borderless"
						icon={IconName.eye}
						title={tText(
							'collection/components/collection-or-bundle-edit-admin___ga-naar-de-bundel-detail-pagina'
						)}
						ariaLabel={tText(
							'collection/components/collection-or-bundle-edit-admin___ga-naar-de-bundel-detail-pagina'
						)}
						onClick={(evt) => {
							evt.stopPropagation();
							navigateToBundleDetail(rowData.id as string);
						}}
					/>
				);

			default:
				return rowData[columnId];
		}
	};

	const renderBundlesContainingCollection = () => (
		<>
			<Spacer margin={['top-extra-large', 'bottom-small']}>
				<BlockHeading type="h2">
					{tText(
						'collection/components/collection-or-bundle-edit-admin___bundels-die-deze-collectie-bevatten'
					)}
				</BlockHeading>
			</Spacer>
			{!!bundlesContainingCollection && !!bundlesContainingCollection.length ? (
				<Table
					columns={[
						{
							label: tText(
								'collection/components/collection-or-bundle-edit-admin___titel'
							),
							id: 'title',
							sortable: true,
							dataType: TableColumnDataType.string,
						},
						{
							label: tText(
								'collection/components/collection-or-bundle-edit-admin___auteur'
							),
							id: 'author',
							sortable: true,
							dataType: TableColumnDataType.string,
						},
						{
							label: 'Organisatie',
							id: 'organization',
							sortable: false,
						},
						{
							label: tText('admin/items/items___publiek'),
							id: 'is_public',
							sortable: true,
							dataType: TableColumnDataType.boolean,
						},
						{
							tooltip: tText(
								'collection/components/collection-or-bundle-edit-admin___acties'
							),
							id: ACTIONS_TABLE_COLUMN_ID,
							sortable: false,
						},
					]}
					data={bundlesContainingCollection}
					onColumnClick={handleBundleColumnClick as any}
					onRowClick={(coll) => navigateToBundleDetail(coll.id)}
					renderCell={renderBundleCell as any}
					sortColumn={bundleSortColumn}
					sortOrder={bundleSortOrder}
					variant="bordered"
					rowKey="id"
				/>
			) : (
				tText(
					'collection/components/collection-or-bundle-edit-admin___deze-collectie-is-in-geen-enkele-bundel-opgenomen'
				)
			)}
		</>
	);

	const renderAssociatedQuickLaneTable = () => (
		<>
			<Spacer margin={['top-extra-large', 'bottom-small']}>
				<BlockHeading type="h2">
					{tText(
						'collection/components/collection-or-bundle-edit-admin___gedeelde-links-naar-deze-collectie'
					)}
				</BlockHeading>
			</Spacer>
			{!!associatedQuickLanes && !!associatedQuickLanes.length ? (
				<AssociatedQuickLaneTable
					data={associatedQuickLanes}
					emptyStateMessage={tText(
						'collection/components/collection-or-bundle-edit-admin___deze-collectie-is-nog-niet-gedeeld'
					)}
					onColumnClick={handleQuickLaneColumnClick as any}
					sortColumn={quickLaneSortColumn}
					sortOrder={quickLaneSortOrder}
				/>
			) : (
				tText(
					'collection/components/collection-or-bundle-edit-admin___deze-collectie-is-nog-niet-gedeeld'
				)
			)}
		</>
	);

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
										label={tText(
											'admin/collections-or-bundles/views/collections-or-bundles-overview___laatste-bewerkt-door'
										)}
									>
										<TextInput
											disabled
											value={
												getFullName(collection.updated_by, true, false) ||
												'-'
											}
										/>
									</FormGroup>
									<FormGroup
										label={tText(
											'admin/collections-or-bundles/collections-or-bundles___aangepast-op'
										)}
									>
										<TextInput
											disabled
											value={
												collection.updated_at
													? formatTimestamp(collection.updated_at)
													: '-'
											}
										/>
									</FormGroup>
									{isCollection && (
										<FormGroup
											label={tText(
												'collection/components/collection-or-bundle-edit-admin___briefing-s'
											)}
										>
											<TextArea
												height="auto"
												value={collection.briefing_id || undefined}
												onChange={(newBriefing: string) =>
													changeCollectionState({
														type: 'UPDATE_COLLECTION_PROP',
														collectionProp: 'briefing_id',
														collectionPropValue: newBriefing,
													})
												}
												onFocus={onFocus}
											/>
										</FormGroup>
									)}
									{PermissionService.hasPerm(
										commonUser,
										isCollection
											? PermissionName.EDIT_COLLECTION_QUALITY_LABELS
											: PermissionName.EDIT_BUNDLE_QUALITY_LABELS
									) && (
										<FormGroup
											label={tText(
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
									)}
									{PermissionService.hasPerm(
										commonUser,
										isCollection
											? PermissionName.EDIT_COLLECTION_AUTHOR
											: PermissionName.EDIT_BUNDLE_AUTHOR
									) && (
										<FormGroup
											label={tText(
												'collection/components/collection-or-bundle-edit-admin___eigenaar'
											)}
											required
										>
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
									)}
									{PermissionService.hasPerm(
										commonUser,
										isCollection
											? PermissionName.EDIT_COLLECTION_EDITORIAL_STATUS
											: PermissionName.EDIT_BUNDLE_EDITORIAL_STATUS
									) ? (
										<FormGroup>
											<Checkbox
												label={tText(
													'collection/components/collection-or-bundle-edit-admin___redactie'
												)}
												checked={get(collection, 'is_managed', false)}
												onChange={() => {
													changeCollectionState({
														type: 'UPDATE_COLLECTION_PROP',
														collectionProp: 'is_managed',
														collectionPropValue: !get(
															collection,
															'is_managed',
															false
														),
													});
												}}
											/>
										</FormGroup>
									) : (
										<Spacer margin="top">
											{`${tText(
												'collection/components/collection-or-bundle-edit-admin___redactie'
											)}: ${
												get(collection, 'is_managed', false)
													? tText(
															'collection/components/collection-or-bundle-edit-admin___ja'
													  )
													: tText(
															'collection/components/collection-or-bundle-edit-admin___nee'
													  )
											}
											`}
										</Spacer>
									)}
								</Column>
								<Column size="3-5">
									<></>
								</Column>
							</Grid>

							{isCollection && (
								<>
									{/* Show bundles that contain this collection */}
									{renderBundlesContainingCollection()}

									{/* Show quick lane urls leading to this collection */}
									{renderAssociatedQuickLaneTable()}
								</>
							)}
						</Spacer>
					</Form>
				</Container>
			</Container>
		</>
	);
};

export default withUser(CollectionOrBundleEditAdmin) as FC<CollectionOrBundleEditAdminProps>;

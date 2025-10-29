import { toggleSortOrder } from '@meemoo/admin-core-ui/admin';
import { BlockHeading } from '@meemoo/admin-core-ui/client';
import {
	Checkbox,
	Column,
	Container,
	Form,
	FormGroup,
	Grid,
	Spacer,
	type TagInfo,
	TagsInput,
	TextArea,
	TextInput,
} from '@viaa/avo2-components';
import { type Avo, PermissionName } from '@viaa/avo2-types';
import { get, noop, orderBy } from 'lodash-es';
import React, { type FC, useCallback, useEffect, useState } from 'react';
import { type RouteComponentProps } from 'react-router-dom';

import { ContentPicker } from '../../admin/shared/components/ContentPicker/ContentPicker';
import { type PickerItem } from '../../admin/shared/types';
import { PermissionService } from '../../authentication/helpers/permission-service';
import ContainedInBundlesTable from '../../bundle/components/ContainedInBundlesTable';
import AssociatedQuickLaneTable, {
	AssociatedQuickLaneTableOrderBy,
} from '../../quick-lane/components/AssociatedQuickLaneTable';
import { OrderDirection } from '../../search/search.const';
import { QUICK_LANE_DEFAULTS } from '../../shared/constants/quick-lane';
import { CustomError } from '../../shared/helpers/custom-error';
import { formatTimestamp, getFullNameCommonUser } from '../../shared/helpers/formatters';
import withUser, { type UserProps } from '../../shared/hocs/withUser';
import useTranslation from '../../shared/hooks/useTranslation';
import { QualityLabelsService } from '../../shared/services/quality-labels.service';
import { QuickLaneContainingService } from '../../shared/services/quick-lane-containing.service';
import { ToastService } from '../../shared/services/toast-service';
import { type QuickLaneUrlObject } from '../../shared/types';
import { type QualityLabel } from '../collection.types';

import { type CollectionAction } from './CollectionOrBundleEdit.types';

interface CollectionOrBundleEditAdminProps {
	collection: Avo.Collection.Collection;
	changeCollectionState: (action: CollectionAction) => void;
	history: RouteComponentProps['history'];
	onFocus?: () => void;
}

const CollectionOrBundleEditAdmin: FC<CollectionOrBundleEditAdminProps & UserProps> = ({
	collection,
	changeCollectionState,
	commonUser,
	onFocus,
}) => {
	const { tText, tHtml } = useTranslation();

	// State
	const [qualityLabels, setQualityLabels] = useState<TagInfo[] | null>(null);

	const [associatedQuickLanes, setAssociatedQuickLanes] = useState<QuickLaneUrlObject[]>([]);
	const [quickLaneSortColumn, setQuickLaneSortColumn] = useState<string>(
		QUICK_LANE_DEFAULTS.sort_column
	);
	const [quickLaneSortOrder, setQuickLaneSortOrder] = useState<OrderDirection>(
		OrderDirection.asc
	);

	// Computed
	const isCollection: boolean = collection.type_id === 3;

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
		fetchQualityLabels().then(noop);
		fetchAssociatedQuickLanes().then(noop);
	}, [fetchQualityLabels, fetchAssociatedQuickLanes]);

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
												getFullNameCommonUser(
													collection.updated_by,
													true,
													false
												) || '-'
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
									<ContainedInBundlesTable
										fragmentId={collection.id}
										title={tText(
											'collection/components/collection-or-bundle-edit-admin___bundels-die-deze-collectie-bevatten'
										)}
										emptyTableLabel={tText(
											'collection/components/collection-or-bundle-edit-admin___deze-collectie-is-in-geen-enkele-bundel-opgenomen'
										)}
									/>

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

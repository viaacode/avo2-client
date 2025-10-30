import {
	Column,
	Container,
	DatePicker,
	Form,
	FormGroup,
	Grid,
	Select,
	type SelectOption,
	Spacer,
	TextArea,
} from '@viaa/avo2-components';
import { type Avo } from '@viaa/avo2-types';
import React, { type FC } from 'react';

import { getCollectionManagementStatuses } from '../../admin/collectionsOrBundles/collections-or-bundles.const';
import { ContentPicker } from '../../admin/shared/components/ContentPicker/ContentPicker';
import { NULL_FILTER } from '../../admin/shared/helpers/filters';
import { type PickerItem } from '../../admin/shared/types';
import { getFullName, toDateObject } from '../../shared/helpers/formatters';
import { useTranslation } from '../../shared/hooks/useTranslation';

import { type CollectionAction } from './CollectionOrBundleEdit.types';

interface CollectionOrBundleEditActualisationProps {
	collection: Avo.Collection.Collection;
	changeCollectionState: (action: CollectionAction) => void;
	onFocus?: () => void;
}

export const CollectionOrBundleEditActualisation: FC<CollectionOrBundleEditActualisationProps> = ({
	collection,
	changeCollectionState,
	onFocus,
}) => {
	const { tText } = useTranslation();

	const actualisationStatuses = getCollectionManagementStatuses()
		.filter((option) => option.id !== NULL_FILTER)
		.map(
			(option): SelectOption<string> => ({
				label: option.label,
				value: option.id,
			})
		);

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
											'collection/components/collection-or-bundle-edit-actualisation___status'
										)}
									>
										<Select
											options={actualisationStatuses}
											onChange={(selectedOption) => {
												changeCollectionState({
													type: 'UPDATE_COLLECTION_PROP',
													collectionProp: 'management.current_status',
													collectionPropValue: selectedOption,
												});
											}}
											clearable
											value={collection?.management?.current_status || null}
										/>
									</FormGroup>
									<FormGroup
										label={tText(
											'collection/components/collection-or-bundle-edit-actualisation___datum-laatste-actualisatie'
										)}
									>
										<DatePicker
											value={toDateObject(collection?.management?.updated_at)}
											onChange={(selectedDate) =>
												changeCollectionState({
													type: 'UPDATE_COLLECTION_PROP',
													collectionProp: 'management.updated_at',
													collectionPropValue: selectedDate
														? selectedDate.toISOString()
														: null,
												})
											}
										/>
									</FormGroup>
									<FormGroup
										label={tText(
											'collection/components/collection-or-bundle-edit-actualisation___vervaldatum'
										)}
									>
										<DatePicker
											value={toDateObject(
												collection?.management?.status_valid_until
											)}
											onChange={(selectedDate) =>
												changeCollectionState({
													type: 'UPDATE_COLLECTION_PROP',
													collectionProp: 'management.status_valid_until',
													collectionPropValue: selectedDate
														? selectedDate.toISOString()
														: null,
												})
											}
										/>
									</FormGroup>
									<FormGroup
										label={tText(
											'collection/components/collection-or-bundle-edit-actualisation___verantwoordelijke-actualisatie'
										)}
									>
										<ContentPicker
											initialValue={
												collection?.management?.manager_profile_id
													? {
															label:
																getFullName(
																	collection?.management
																		?.manager as unknown as Avo.User.CommonUser,
																	false,
																	true
																) || '',
															value:
																collection?.management
																	?.manager_profile_id ?? '',
															type: 'PROFILE',
													  }
													: null
											}
											placeholder={tText(
												'collection/components/collection-or-bundle-edit-actualisation___selecteer-een-verantwoordelijke'
											)}
											hideTargetSwitch
											hideTypeDropdown
											allowedTypes={['PROFILE']}
											onSelect={(value: PickerItem | null) => {
												changeCollectionState({
													type: 'UPDATE_COLLECTION_PROP',
													collectionProp: 'management.manager_profile_id',
													collectionPropValue: value ? value.value : null,
												});
											}}
										/>
									</FormGroup>
									<FormGroup
										label={tText(
											'collection/components/collection-or-bundle-edit-actualisation___opmerkingen'
										)}
									>
										<TextArea
											height="auto"
											value={collection?.management?.note || ''}
											onChange={(newNotes: string) =>
												changeCollectionState({
													type: 'UPDATE_COLLECTION_PROP',
													collectionProp: 'management.note',
													collectionPropValue: newNotes || null,
												})
											}
											onFocus={onFocus}
										/>
									</FormGroup>
								</Column>
								<Column size="3-5">
									<></>
								</Column>
							</Grid>
						</Spacer>
					</Form>
				</Container>
			</Container>
		</>
	);
};

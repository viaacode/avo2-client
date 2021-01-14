import H from 'history';
import { get, without } from 'lodash-es';
import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import {
	Column,
	Container,
	DatePicker,
	Form,
	FormGroup,
	Grid,
	Select,
	Spacer,
	TextArea,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { getCollectionManagementStatuses } from '../../admin/collectionsOrBundles/collections-or-bundles.const';
import { ContentPicker } from '../../admin/shared/components/ContentPicker/ContentPicker';
import { NULL_FILTER } from '../../admin/shared/helpers/filters';
import { PickerItem } from '../../admin/shared/types';
import { toDateObject } from '../../shared/helpers';
import { stringToSelectOption } from '../../shared/helpers/string-to-select-options';
import withUser, { UserProps } from '../../shared/hocs/withUser';

import { CollectionAction } from './CollectionOrBundleEdit';

interface CollectionOrBundleEditActualisationProps {
	collection: Avo.Collection.Collection;
	changeCollectionState: (action: CollectionAction) => void;
	history: H.History;
}

const CollectionOrBundleEditActualisation: FunctionComponent<
	CollectionOrBundleEditActualisationProps & UserProps
> = ({ collection, changeCollectionState }) => {
	const [t] = useTranslation();

	return (
		<>
			<Container mode="vertical">
				<Container mode="horizontal">
					<Form>
						<Spacer margin="bottom">
							<Grid>
								<Column size="3-7">
									<FormGroup label={t('Status')}>
										<Select
											options={without(
												getCollectionManagementStatuses().map(
													(option) => option.id
												),
												NULL_FILTER
											).map(stringToSelectOption)}
											onChange={(selectedOption) =>
												changeCollectionState({
													type: 'UPDATE_COLLECTION_PROP',
													collectionProp: 'management.current_status',
													collectionPropValue: selectedOption,
												})
											}
											clearable
											value={
												get(collection, 'management.current_status') || null
											}
										/>
									</FormGroup>
									<FormGroup label={t('Datum laatste actualisatie')}>
										<DatePicker
											value={toDateObject(
												get(collection, 'management.updated_at')
											)}
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
									<FormGroup label={t('Vervaldatum')}>
										<DatePicker
											value={toDateObject(
												get(collection, 'management.status_valid_until')
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
									<FormGroup label={t('Verantwoordelijke actualisatie')}>
										<ContentPicker
											initialValue={get(
												collection,
												'management.manager_profile_id'
											)}
											placeholder={t('Selecteer een verantwoordelijke')}
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
									<FormGroup label={t('Opmerkingen')}>
										<TextArea
											height="auto"
											disabled
											value={
												'TODO add field to database' /*get(collection, 'management.comments') || ''*/
											}
											onChange={(newNotes: string) =>
												changeCollectionState({
													type: 'UPDATE_COLLECTION_PROP',
													collectionProp: 'management.notes',
													collectionPropValue: newNotes || null,
												})
											}
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

export default withUser(CollectionOrBundleEditActualisation) as FunctionComponent<
	CollectionOrBundleEditActualisationProps
>;

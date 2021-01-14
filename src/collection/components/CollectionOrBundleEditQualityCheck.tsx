import H from 'history';
import { get } from 'lodash-es';
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

import { ContentPicker } from '../../admin/shared/components/ContentPicker/ContentPicker';
import { PickerItem } from '../../admin/shared/types';
import { toDateObject } from '../../shared/helpers';
import withUser, { UserProps } from '../../shared/hocs/withUser';

import { CollectionAction } from './CollectionOrBundleEdit';

interface CollectionOrBundleEditQualityCheckProps {
	collection: Avo.Collection.Collection;
	changeCollectionState: (action: CollectionAction) => void;
	history: H.History;
}

const CollectionOrBundleEditQualityCheck: FunctionComponent<
	CollectionOrBundleEditQualityCheckProps & UserProps
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
									<FormGroup label={t('Taalcheck')}>
										<Select
											options={[
												{ label: t('OK'), value: 'OK' },
												{ label: t('NOK'), value: 'NOK' },
											]}
											onChange={(selectedOption) =>
												changeCollectionState({
													type: 'UPDATE_COLLECTION_PROP',
													collectionProp:
														'management.language_check[0].qc_status',
													collectionPropValue: selectedOption,
												})
											}
											clearable
											value={
												get(
													collection,
													'management.language_check[0].qc_status'
												) || null
											}
										/>
									</FormGroup>
									<FormGroup label={t('Kwaliteitscontrole')}>
										<Select
											options={[
												{ label: t('OK'), value: 'OK' },
												{ label: t('NOK'), value: 'NOK' },
											]}
											onChange={(selectedOption) =>
												changeCollectionState({
													type: 'UPDATE_COLLECTION_PROP',
													collectionProp:
														'management.quality_check[0].qc_status',
													collectionPropValue: selectedOption,
												})
											}
											clearable
											value={
												get(
													collection,
													'management.quality_check[0].qc_status'
												) || null
											}
										/>
									</FormGroup>
									<FormGroup label={t('Datum goedkeuring')}>
										<DatePicker
											value={toDateObject(
												get(
													collection,
													'management.approved_at[0].created_at'
												)
											)}
											onChange={(selectedDate) =>
												changeCollectionState({
													type: 'UPDATE_COLLECTION_PROP',
													collectionProp:
														'management.approved_at[0].created_at',
													collectionPropValue: selectedDate
														? selectedDate.toISOString()
														: null,
												})
											}
										/>
									</FormGroup>
									<FormGroup label={t('Verantwoordelijke kwaliteitscontrole')}>
										<ContentPicker
											initialValue={get(
												collection,
												'management.quality_check[0].assignee_profile_id'
											)}
											hideTargetSwitch
											hideTypeDropdown
											placeholder={t('Selecteer een verantwoordelijke')}
											allowedTypes={['PROFILE']}
											onSelect={(value: PickerItem | null) => {
												changeCollectionState({
													type: 'UPDATE_COLLECTION_PROP',
													collectionProp:
														'management.quality_check[0].assignee_profile_id',
													collectionPropValue: value ? value.value : null,
												});
											}}
										/>
									</FormGroup>
									<FormGroup label={t('Opmerkingen')}>
										<TextArea
											height="auto"
											value={
												get(
													collection,
													'management.quality_check[0].comment'
												) || ''
											}
											onChange={(newNotes: string) =>
												changeCollectionState({
													type: 'UPDATE_COLLECTION_PROP',
													collectionProp:
														'management.quality_check[0].comment',
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

export default withUser(CollectionOrBundleEditQualityCheck) as FunctionComponent<
	CollectionOrBundleEditQualityCheckProps
>;

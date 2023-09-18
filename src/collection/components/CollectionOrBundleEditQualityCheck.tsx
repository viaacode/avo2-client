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
import { type Avo } from '@viaa/avo2-types';
import { get } from 'lodash-es';
import React, { FunctionComponent } from 'react';
import { RouteComponentProps } from 'react-router-dom';

import { ContentPicker } from '../../admin/shared/components/ContentPicker/ContentPicker';
import { PickerItem } from '../../admin/shared/types';
import { getFullName, toDateObject } from '../../shared/helpers';
import withUser, { UserProps } from '../../shared/hocs/withUser';
import useTranslation from '../../shared/hooks/useTranslation';
import { booleanToOkNok, okNokToBoolean } from '../helpers/ok-nok-parser';

import { CollectionAction } from './CollectionOrBundleEdit';

interface CollectionOrBundleEditQualityCheckProps {
	collection: Avo.Collection.Collection;
	changeCollectionState: (action: CollectionAction) => void;
	history: RouteComponentProps['history'];
}

const CollectionOrBundleEditQualityCheck: FunctionComponent<
	CollectionOrBundleEditQualityCheckProps & UserProps
> = ({ collection, changeCollectionState }) => {
	const { tText } = useTranslation();

	const getApprovedAtDate = (collection: Avo.Collection.Collection): Date | null => {
		if (
			get(collection, 'management_language_check[0].qc_status') &&
			get(collection, 'management_quality_check[0].qc_status')
		) {
			return (
				toDateObject(get(collection, 'management_approved_at[0].created_at')) || new Date()
			);
		}
		return null;
	};

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
											'collection/components/collection-or-bundle-edit-quality-check___taalcheck'
										)}
									>
										<Select
											options={[
												{
													label: tText(
														'collection/components/collection-or-bundle-edit-quality-check___ok'
													),
													value: 'OK',
												},
												{
													label: tText(
														'collection/components/collection-or-bundle-edit-quality-check___nok'
													),
													value: 'NOK',
												},
											]}
											onChange={(selectedOption) =>
												changeCollectionState({
													type: 'UPDATE_COLLECTION_PROP',
													collectionProp:
														'management_language_check[0].qc_status',
													collectionPropValue: okNokToBoolean(
														selectedOption as any
													),
												})
											}
											clearable
											value={booleanToOkNok(
												get(
													collection,
													'management_language_check[0].qc_status'
												) ?? null
											)}
										/>
									</FormGroup>
									<FormGroup
										label={tText(
											'collection/components/collection-or-bundle-edit-quality-check___kwaliteitscontrole'
										)}
									>
										<Select
											options={[
												{
													label: tText(
														'collection/components/collection-or-bundle-edit-quality-check___ok'
													),
													value: 'OK',
												},
												{
													label: tText(
														'collection/components/collection-or-bundle-edit-quality-check___nok'
													),
													value: 'NOK',
												},
											]}
											onChange={(selectedOption) =>
												changeCollectionState({
													type: 'UPDATE_COLLECTION_PROP',
													collectionProp:
														'management_quality_check[0].qc_status',
													collectionPropValue: okNokToBoolean(
														selectedOption as any
													),
												})
											}
											clearable
											value={booleanToOkNok(
												get(
													collection,
													'management_quality_check[0].qc_status'
												) ?? null
											)}
										/>
									</FormGroup>
									<FormGroup
										label={tText(
											'collection/components/collection-or-bundle-edit-quality-check___datum-goedkeuring'
										)}
									>
										<DatePicker
											value={getApprovedAtDate(collection)}
											onChange={(selectedDate) =>
												changeCollectionState({
													type: 'UPDATE_COLLECTION_PROP',
													collectionProp:
														'management_approved_at[0].created_at',
													collectionPropValue: selectedDate
														? selectedDate.toISOString()
														: null,
												})
											}
											disabled
										/>
									</FormGroup>
									<FormGroup
										label={tText(
											'collection/components/collection-or-bundle-edit-quality-check___verantwoordelijke-kwaliteitscontrole'
										)}
									>
										<ContentPicker
											initialValue={
												collection?.management_language_check?.[0]
													?.assignee_profile_id
													? {
															label:
																getFullName(
																	collection
																		?.management_language_check?.[0]
																		?.assignee as unknown as Avo.User.Profile,
																	false,
																	true
																) || '',
															value:
																collection
																	?.management_language_check?.[0]
																	?.assignee_profile_id ?? '',
															type: 'PROFILE',
													  }
													: null
											}
											hideTargetSwitch
											hideTypeDropdown
											placeholder={tText(
												'collection/components/collection-or-bundle-edit-quality-check___selecteer-een-verantwoordelijke'
											)}
											allowedTypes={['PROFILE']}
											onSelect={(value: PickerItem | null) => {
												changeCollectionState({
													type: 'UPDATE_COLLECTION_PROP',
													collectionProp:
														'management_language_check[0].assignee_profile_id',
													collectionPropValue: value ? value.value : null,
												});
											}}
										/>
									</FormGroup>
									<FormGroup
										label={tText(
											'collection/components/collection-or-bundle-edit-quality-check___opmerkingen'
										)}
									>
										<TextArea
											height="auto"
											value={
												get(
													collection,
													'management_language_check[0].comment'
												) || ''
											}
											onChange={(newNotes: string) =>
												changeCollectionState({
													type: 'UPDATE_COLLECTION_PROP',
													collectionProp:
														'management_language_check[0].comment',
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

export default withUser(
	CollectionOrBundleEditQualityCheck
) as FunctionComponent<CollectionOrBundleEditQualityCheckProps>;

import React, { FunctionComponent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
	Button,
	Column,
	Container,
	Form,
	FormGroup,
	Grid,
	Spacer,
	TagInfo,
	TagsInput,
	TextArea,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { DataQueryComponent } from '../../shared/components';
import { GET_CLASSIFICATIONS_AND_SUBJECTS } from '../../shared/queries/lookup.gql';
import { ContextAndClassificationData } from '../../shared/types/lookup';

import { getValidationFeedbackForShortDescription } from '../collection.helpers';
import { CollectionStillsModal } from '../components';

interface CollectionEditMetaDataProps {
	collection: Avo.Collection.Collection;
	updateCollectionProperty: (value: string | string[], fieldName: string) => void;
}

const CollectionEditMetaData: FunctionComponent<CollectionEditMetaDataProps> = ({
	collection,
	updateCollectionProperty,
}) => {
	const [t] = useTranslation();

	// State
	const [isCollectionsStillsModalOpen, setCollectionsStillsModalOpen] = useState<boolean>(false);

	const updateCollectionMultiProperty = (selectedTagOptions: TagInfo[], fieldName: string) => {
		updateCollectionProperty(
			(selectedTagOptions || []).map(tag => tag.value as string),
			fieldName
		);
	};

	const renderCollectionMetaData = (data: ContextAndClassificationData) => {
		return (
			<>
				<Container mode="vertical">
					<Container mode="horizontal">
						<Form>
							<Spacer margin="bottom">
								<Grid>
									<Column size="3-7">
										<FormGroup
											label={t('collection/views/collection-edit-meta-data___onderwijsniveau')}
											labelFor="classificationId"
										>
											<TagsInput
												options={(data.lookup_enum_lom_context || []).map(item => ({
													value: item.description,
													label: item.description,
												}))}
												value={(collection.lom_context || []).map((item: string) => ({
													value: item,
													label: item,
												}))}
												onChange={(values: TagInfo[]) =>
													updateCollectionMultiProperty(values, 'lom_context')
												}
											/>
										</FormGroup>
										<FormGroup
											label={t('collection/views/collection-edit-meta-data___vakken')}
											labelFor="subjectsId"
										>
											<TagsInput
												options={(data.lookup_enum_lom_classification || []).map(item => ({
													value: item.description,
													label: item.description,
												}))}
												value={(collection.lom_classification || []).map((item: string) => ({
													value: item,
													label: item,
												}))}
												onChange={(values: TagInfo[]) =>
													updateCollectionMultiProperty(values, 'lom_classification')
												}
											/>
										</FormGroup>
										<FormGroup
											label={t('collection/views/collection-edit-meta-data___korte-omschrijving')}
											labelFor="shortDescriptionId"
											error={getValidationFeedbackForShortDescription(collection.description, true)}
										>
											<TextArea
												name="shortDescriptionId"
												value={collection.description || ''}
												id="shortDescriptionId"
												height="medium"
												onChange={(value: string) => updateCollectionProperty(value, 'description')}
											/>
											<label>
												{getValidationFeedbackForShortDescription(collection.description)}
											</label>
										</FormGroup>
										<FormGroup
											label={t(
												'collection/views/collection-edit-meta-data___persoonlijke-opmerkingen-notities'
											)}
											labelFor="personalRemarkId"
										>
											<TextArea
												name="personalRemarkId"
												value={(collection as any).note || ''} // TODO: cleanup when note is available from types repo
												id="personalRemarkId"
												height="medium"
												placeholder={t(
													'collection/views/collection-edit-meta-data___geef-hier-je-persoonlijke-opmerkingen-notities-in'
												)}
												onChange={(value: string) => updateCollectionProperty(value, 'note')}
											/>
										</FormGroup>
									</Column>
									<Column size="3-5">
										<FormGroup
											label={t('collection/views/collection-edit-meta-data___cover-afbeelding')}
											labelFor="coverImageId"
										>
											<Button
												type="secondary"
												label={t(
													'collection/views/collection-edit-meta-data___stel-een-afbeelding-in'
												)}
												onClick={() => setCollectionsStillsModalOpen(true)}
											/>
										</FormGroup>
										{/* TODO: DISABLED FEATURE
											<FormGroup label={t('collection/views/collection-edit-meta-data___map')} labelFor="mapId">
												<Button type="secondary" icon="add" label={t('collection/views/collection-edit-meta-data___voeg-toe-aan-een-map')} />
											</FormGroup>
										*/}
									</Column>
								</Grid>
							</Spacer>
						</Form>
					</Container>
				</Container>
				<CollectionStillsModal
					isOpen={isCollectionsStillsModalOpen}
					onClose={() => setCollectionsStillsModalOpen(false)}
					collection={collection}
				/>
			</>
		);
	};

	return (
		<DataQueryComponent
			query={GET_CLASSIFICATIONS_AND_SUBJECTS}
			renderData={renderCollectionMetaData}
		/>
	);
};

export default CollectionEditMetaData;

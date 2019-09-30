import React, { Fragment, FunctionComponent, useState } from 'react';

import {
	Button,
	Column,
	Container,
	Form,
	FormGroup,
	Grid,
	Spacer,
	TagsInput,
	TextArea,
} from '@viaa/avo2-components';
import { TagInfo } from '@viaa/avo2-components/dist/components/TagsInput/TagsInput';
import { Avo } from '@viaa/avo2-types';

import { DataQueryComponent } from '../../shared/components/DataComponent/DataQueryComponent';
import CollectionStillsModal from '../components/modals/CollectionStillsModal';
import { GET_CLASSIFICATIONS_AND_SUBJECTS } from '../graphql';
import { getValidationFeedbackForShortDescription } from './EditCollection';

interface EditCollectionMetadataProps {
	collection: Avo.Collection.Response;
	updateCollectionProperty: (value: string | string[], fieldName: string) => void;
}

const EditCollectionMetadata: FunctionComponent<EditCollectionMetadataProps> = ({
	collection,
	updateCollectionProperty,
}) => {
	const [isCollectionsStillsModalOpen, setCollectionsStillsModalOpen] = useState<boolean>(false);

	const updateCollectionMultiProperty = (selectedTagOptions: TagInfo[], fieldName: string) => {
		updateCollectionProperty((selectedTagOptions || []).map(tag => tag.value as string), fieldName);
	};

	const renderCollectionMetaData = (data: {
		lookup_enum_lom_context: { description: string }[];
		lookup_enum_lom_classification: { description: string }[];
	}) => {
		return (
			<Fragment>
				<Container mode="vertical">
					<Container mode="horizontal">
						<Form>
							<Spacer margin="bottom">
								<Grid>
									<Column size="3-7">
										<FormGroup label="Onderwijsniveau" labelFor="classificationId">
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
										<FormGroup label="Vakken" labelFor="subjectsId">
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
											label="Korte omschrijving"
											labelFor="shortDescriptionId"
											error={getValidationFeedbackForShortDescription(collection, true)}
										>
											<TextArea
												name="shortDescriptionId"
												value={collection.description || ''}
												id="shortDescriptionId"
												height="medium"
												onChange={(value: string) => updateCollectionProperty(value, 'description')}
											/>
											<label>{getValidationFeedbackForShortDescription(collection)}</label>
										</FormGroup>
										<FormGroup
											label="Persoonlijke opmerkingen/notities"
											labelFor="personalRemarkId"
										>
											<TextArea
												name="personalRemarkId"
												value={(collection as any).note} // TODO cleanup when note is available from types repo
												id="personalRemarkId"
												height="medium"
												placeholder="Geef hier je persoonlijke opmerkingen/notities in..."
												onChange={(value: string) => updateCollectionProperty(value, 'note')}
											/>
										</FormGroup>
									</Column>
									<Column size="3-5">
										<FormGroup label="Cover afbeelding" labelFor="coverImageId">
											<Button
												type="secondary"
												label="Stel een afbeelding in..."
												onClick={() => setCollectionsStillsModalOpen(true)}
											/>
										</FormGroup>
										<FormGroup label="Map" labelFor="mapId">
											<Button type="secondary" icon="add" label="Voeg toe aan een map" />
										</FormGroup>
									</Column>
								</Grid>
							</Spacer>
						</Form>
					</Container>
				</Container>
				<CollectionStillsModal
					isOpen={isCollectionsStillsModalOpen}
					setIsOpen={setCollectionsStillsModalOpen}
					collection={collection}
				/>
			</Fragment>
		);
	};

	return (
		<DataQueryComponent
			query={GET_CLASSIFICATIONS_AND_SUBJECTS}
			renderData={renderCollectionMetaData}
		/>
	);
};

export default EditCollectionMetadata;

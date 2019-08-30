import React, { FunctionComponent } from 'react';

import { Avo } from '@viaa/avo2-types';

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
	TextInput,
} from '@viaa/avo2-components';
import { TagInfo } from '@viaa/avo2-components/dist/components/TagsInput/TagsInput';
import { DataQueryComponent } from '../../shared/components/DataComponent/DataQueryComponent';
import { GET_COLLECTION_BY_ID } from '../collection.gql';
import { getValidationFeedbackForShortDescription } from './EditCollection';

interface EditCollectionMetadataProps {
	collection: Avo.Collection.Response;
	updateCollectionProperty: (value: string | string[], fieldName: string) => void;
}

const EditCollectionMetadata: FunctionComponent<EditCollectionMetadataProps> = ({
	collection,
	updateCollectionProperty,
}) => {
	const updateCollectionMultiProperty = (selectedTagOptions: TagInfo[], fieldName: string) => {
		updateCollectionProperty(selectedTagOptions.map(tag => tag.value as string), fieldName);
	};

	const renderCollectionMetaData = () => {
		return (
			<Container mode="vertical">
				<Container mode="horizontal">
					<Form>
						<Spacer margin="bottom">
							<Grid>
								<Column size="3-7">
									<FormGroup label="Onderwijsniveau" labelFor="classificationId">
										<TextInput value={''} id="classificationId" />
										<TagsInput
											options={}
											onChange={(values: TagInfo[]) =>
												updateCollectionMultiProperty(values, 'classification')
											}
										/>
									</FormGroup>
									<FormGroup label="Vakken" labelFor="subjectsId">
										<TextInput value={''} id="subjectsId" />
										<TagsInput
											options={}
											onChange={(values: TagInfo[]) =>
												updateCollectionMultiProperty(values, 'subjects')
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
									<FormGroup label="Persoonlijke opmerkingen/notities" labelFor="personalRemarkId">
										<TextArea
											name="personalRemarkId"
											value={''}
											id="personalRemarkId"
											height="medium"
											placeholder="Geef hier je persoonlijke opmerkingen/notities in..."
										/>
									</FormGroup>
								</Column>
								<Column size="3-5">
									<FormGroup label="Cover afbeelding" labelFor="coverImageId">
										<Button type="secondary" label="Stel een afbeelding in..." />
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

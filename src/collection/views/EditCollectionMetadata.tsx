import React, { FunctionComponent } from 'react';

import {
	Button,
	Column,
	Container,
	Form,
	FormGroup,
	Grid,
	Spacer,
	TextArea,
	TextInput,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { getValidationFeedbackForShortDescription } from './EditCollection';

interface EditCollectionMetadataProps {
	collection: Avo.Collection.Response;
	updateCollectionProperty: (value: string, fieldName: string) => void;
}

const EditCollectionMetadata: FunctionComponent<EditCollectionMetadataProps> = ({
	collection,
	updateCollectionProperty,
}) => (
	<Container mode="vertical">
		<Container mode="horizontal">
			<Form>
				<Spacer margin="bottom">
					<Grid>
						<Column size="3-7">
							<FormGroup label="Onderwijsniveau" labelFor="classificationId">
								<TextInput value={''} id="classificationId" />
							</FormGroup>
							<FormGroup label="Vakken" labelFor="subjectsId">
								<TextInput value={''} id="subjectsId" />
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

export default EditCollectionMetadata;

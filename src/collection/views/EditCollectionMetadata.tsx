import React, { FunctionComponent } from 'react';

import { Column, Container, Form, FormGroup, Grid, Spacer, TextArea } from '@viaa/avo2-components';

interface EditCollectionMetadataProps {
	collection: any;
	updateCollectionProperty: (value: string, fieldName: string) => void;
}

const EditCollectionMetadata: FunctionComponent<EditCollectionMetadataProps> = ({
	collection,
	updateCollectionProperty,
}) => {
	return (
		<Container mode="vertical">
			<Container mode="horizontal">
				<Form>
					<Spacer margin="bottom">
						<Grid>
							<Column size="3-7">
								<FormGroup label="Korte omschrijving" labelFor="shortDescriptionId">
									<TextArea
										name="shortDescriptionId"
										value={collection.description}
										id="shortDescriptionId"
										onChange={(value: string) => updateCollectionProperty(value, 'description')}
									/>
								</FormGroup>
								<FormGroup label="Persoonlijke opmerkingen/notities" labelFor="personalRemarkId">
									<TextArea name="personalRemarkId" value={''} id="personalRemarkId" />
								</FormGroup>
							</Column>
						</Grid>
					</Spacer>
				</Form>
			</Container>
		</Container>
	);
};

export default EditCollectionMetadata;

import React, { Fragment, FunctionComponent, useState } from 'react';

import { Avo } from '@viaa/avo2-types';
import { uniq } from 'lodash-es';

import {
	Button,
	Column,
	Container,
	Form,
	FormGroup,
	Grid,
	ImageGrid,
	Modal,
	ModalBody,
	ModalFooterLeft,
	ModalFooterRight,
	Spacer,
	TagsInput,
	TextArea,
	Toolbar,
	ToolbarItem,
	ToolbarRight,
} from '@viaa/avo2-components';
import { TagInfo } from '@viaa/avo2-components/dist/components/TagsInput/TagsInput';
import { DataQueryComponent } from '../../shared/components/DataComponent/DataQueryComponent';
import toastService, { TOAST_TYPE } from '../../shared/services/toast-service';
import { GET_CLASSIFICATIONS_AND_SUBJECTS } from '../collection.gql';
import { getValidationFeedbackForShortDescription } from './EditCollection';

interface EditCollectionMetadataProps {
	collection: Avo.Collection.Response;
	updateCollectionProperty: (value: string | string[], fieldName: string) => void;
}

const EditCollectionMetadata: FunctionComponent<EditCollectionMetadataProps> = ({
	collection,
	updateCollectionProperty,
}) => {
	const [showCoverImageModal, setShowCoverImageModal] = useState(false);
	const [selectedCoverImages, setSelectedCoverImages] = useState(
		collection.thumbnail_path ? [collection.thumbnail_path] : []
	);

	const saveCoverImage = () => {
		collection.thumbnail_path = selectedCoverImages[0];
		setShowCoverImageModal(false);
		toastService('De cover afbeelding is ingesteld', TOAST_TYPE.SUCCESS);
	};

	const getCollectionStills = (): string[] => {
		console.log(collection.collection_fragments);
		return uniq([
			...(collection.thumbnail_path ? [collection.thumbnail_path] : []),
			'/images/100x100.svg?id=0', // TODO replace these by stills from the videos once graphql relationship is created
			'/images/100x100.svg?id=1',
			'/images/100x100.svg?id=2',
			'/images/100x100.svg?id=3',
			'/images/100x100.svg?id=4',
		]);
	};

	const updateCollectionMultiProperty = (selectedTagOptions: TagInfo[], fieldName: string) => {
		updateCollectionProperty((selectedTagOptions || []).map(tag => tag.value as string), fieldName);
	};

	const renderCollectionMetaData = (data: { vocabularies_lom_contexts: { label: string }[] }) => {
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
												options={(data.vocabularies_lom_contexts || []).map(item => ({
													value: item.label,
													label: item.label,
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
											{/* TODO get subjects from the database once the table is filled in */}
											<TagsInput
												options={[]}
												// onChange={(values: TagInfo[]) =>
												// 	updateCollectionMultiProperty(values, 'subjects')
												// }
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
												value={''}
												id="personalRemarkId"
												height="medium"
												placeholder="Geef hier je persoonlijke opmerkingen/notities in..."
											/>
										</FormGroup>
									</Column>
									<Column size="3-5">
										<FormGroup label="Cover afbeelding" labelFor="coverImageId">
											<Button
												type="secondary"
												label="Stel een afbeelding in..."
												onClick={() => setShowCoverImageModal(true)}
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
				<Modal
					isOpen={showCoverImageModal}
					title="Stel een cover afbeelding in"
					size="large"
					onClose={() => setShowCoverImageModal(false)}
					scrollable={true}
				>
					<ModalBody>
						<div className="u-spacer">
							<Form>
								<ImageGrid
									images={getCollectionStills()}
									allowSelect={true}
									value={selectedCoverImages}
									onChange={setSelectedCoverImages}
									width={177}
									height={100}
								/>
							</Form>
						</div>
					</ModalBody>
					<ModalFooterRight>
						<Toolbar spaced>
							<ToolbarRight>
								<ToolbarItem>
									<div className="c-button-toolbar">
										<Button
											label="Annuleren"
											type="secondary"
											block={true}
											onClick={() => setShowCoverImageModal(false)}
										/>
										<Button
											label="Opslaan"
											type="primary"
											block={true}
											onClick={() => saveCoverImage()}
										/>
									</div>
								</ToolbarItem>
							</ToolbarRight>
						</Toolbar>
					</ModalFooterRight>
				</Modal>
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

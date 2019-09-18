import React, { Fragment, FunctionComponent, useEffect, useState } from 'react';

import { Avo } from '@viaa/avo2-types';
import { compact, uniq } from 'lodash-es';

import {
	Blankslate,
	Button,
	Column,
	Container,
	Form,
	FormGroup,
	Grid,
	ImageGrid,
	Modal,
	ModalBody,
	ModalFooterRight,
	Spacer,
	Spinner,
	TagsInput,
	TextArea,
	Toolbar,
	ToolbarItem,
	ToolbarRight,
} from '@viaa/avo2-components';
import { TagInfo } from '@viaa/avo2-components/dist/components/TagsInput/TagsInput';

import { DataQueryComponent } from '../../shared/components/DataComponent/DataQueryComponent';
import toastService, { TOAST_TYPE } from '../../shared/services/toast-service';
import { GET_CLASSIFICATIONS_AND_SUBJECTS } from '../graphql';
import { isVideoFragment } from '../helpers';
import { getVideoStills, VideoStill } from '../service';
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
	const [videoStills, setVideoStills] = useState<string[] | null>(null);
	const [selectedCoverImages, setSelectedCoverImages] = useState(
		collection.thumbnail_path ? [collection.thumbnail_path] : []
	);

	const saveCoverImage = () => {
		collection.thumbnail_path = selectedCoverImages[0];
		setShowCoverImageModal(false);
		toastService('De cover afbeelding is ingesteld', TOAST_TYPE.SUCCESS);
	};

	const fetchThumbnailImages = async () => {
		// Only update thumbnails when modal is opened, not when closed
		try {
			const externalIds = compact(
				collection.collection_fragments.map(fragment =>
					isVideoFragment(fragment) ? fragment.external_id : undefined
				)
			);
			const videoStills: VideoStill[] = await getVideoStills(externalIds, 20);
			setVideoStills(
				uniq([
					...(collection.thumbnail_path ? [collection.thumbnail_path] : []),
					...videoStills.map(videoStill => videoStill.thumbnailImagePath),
				])
			);
		} catch (err) {
			toastService('Het ophalen van de video thumbnails is mislukt', TOAST_TYPE.DANGER);
			console.error(err);
		}
	};

	useEffect(() => {
		if (showCoverImageModal) {
			fetchThumbnailImages().then(() => {});
		}
	}, [collection, showCoverImageModal, fetchThumbnailImages]);

	const updateCollectionMultiProperty = (selectedTagOptions: TagInfo[], fieldName: string) => {
		updateCollectionProperty((selectedTagOptions || []).map(tag => tag.value as string), fieldName);
	};

	const renderCollectionMetaData = (data: {
		vocabularies_lom_contexts: { label: string }[];
		vocabularies_lom_classifications: { label: string }[];
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
											<TagsInput
												options={(data.vocabularies_lom_classifications || []).map(item => ({
													value: item.label,
													label: item.label,
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
								{videoStills === null ? (
									<div className="o-flex o-flex--horizontal-center">
										<Spinner size="large" />
									</div>
								) : videoStills.length === 0 ? (
									<Blankslate
										body=""
										icon="search"
										title="Er zijn geen thumbnails beschikbaar voor de fragmenten in de collectie"
									/>
								) : (
									<ImageGrid
										images={videoStills}
										allowSelect={true}
										value={selectedCoverImages}
										onChange={setSelectedCoverImages}
										width={177}
										height={100}
									/>
								)}
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

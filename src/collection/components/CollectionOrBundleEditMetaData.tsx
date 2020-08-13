import React, { FunctionComponent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
	Button,
	Column,
	Container,
	Form,
	FormGroup,
	Grid,
	RichEditorState,
	Spacer,
	TagInfo,
	TagsInput,
	TextArea,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { SettingsService } from '../../settings/settings.service';
import { FileUpload } from '../../shared/components';
import WYSIWYGWrapper from '../../shared/components/WYSIWYGWrapper/WYSIWYGWrapper';
import {
	WYSIWYG_OPTIONS_BUNDLE_DESCRIPTION,
	WYSIWYG_OPTIONS_DEFAULT_NO_TITLES,
} from '../../shared/constants/wysiwyg';
import { CustomError, sanitizeHtml } from '../../shared/helpers';
import { MAX_LONG_DESCRIPTION_LENGTH, MAX_SEARCH_DESCRIPTION_LENGTH } from '../collection.const';
import { getValidationFeedbackForShortDescription } from '../collection.helpers';
import { CollectionStillsModal } from '../components';

import { CollectionAction } from './CollectionOrBundleEdit';

interface CollectionOrBundleEditMetaDataProps {
	type: 'collection' | 'bundle';
	collection: Avo.Collection.Collection;
	changeCollectionState: (action: CollectionAction) => void;
}

const CollectionOrBundleEditMetaData: FunctionComponent<CollectionOrBundleEditMetaDataProps> = ({
	type,
	collection,
	changeCollectionState,
}) => {
	const [t] = useTranslation();

	// State
	const [isCollectionsStillsModalOpen, setCollectionsStillsModalOpen] = useState<boolean>(false);
	const [subjects, setSubjects] = useState<TagInfo[]>([]);
	const [educationLevels, setEducationLevels] = useState<TagInfo[]>([]);
	const [descriptionLongEditorState, setDescriptionLongEditorState] = useState<
		RichEditorState | undefined
	>(undefined);

	const isCollection = type === 'collection';

	useEffect(() => {
		Promise.all([SettingsService.fetchSubjects(), SettingsService.fetchEducationLevels()])
			.then((response: [string[], string[]]) => {
				setSubjects(
					response[0].map(subject => ({
						value: subject,
						label: subject,
					}))
				);
				setEducationLevels(
					response[1].map(educationLevel => ({
						value: educationLevel,
						label: educationLevel,
					}))
				);
			})
			.catch(err => {
				console.error(
					new CustomError(
						'Failed to get education levels and subjects from the database',
						err
					)
				);
			});
	}, [setEducationLevels, setSubjects]);

	const updateCollectionMultiProperty = (
		selectedTagOptions: TagInfo[],
		collectionProp: keyof Avo.Collection.Collection
	) => {
		changeCollectionState({
			collectionProp,
			type: 'UPDATE_COLLECTION_PROP',
			collectionPropValue: (selectedTagOptions || []).map(tag => tag.value as string),
		});
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
										label={t(
											'collection/views/collection-edit-meta-data___onderwijsniveau'
										)}
										labelFor="classificationId"
									>
										<TagsInput
											options={educationLevels}
											value={(collection.lom_context || []).map(
												(item: string) => ({
													value: item,
													label: item,
												})
											)}
											onChange={(values: TagInfo[]) =>
												updateCollectionMultiProperty(values, 'lom_context')
											}
										/>
									</FormGroup>
									<FormGroup
										label={t(
											'collection/views/collection-edit-meta-data___vakken'
										)}
										labelFor="subjectsId"
									>
										<TagsInput
											options={subjects}
											value={(collection.lom_classification || []).map(
												(item: string) => ({
													value: item,
													label: item,
												})
											)}
											onChange={(values: TagInfo[]) =>
												updateCollectionMultiProperty(
													values,
													'lom_classification'
												)
											}
										/>
									</FormGroup>
									<FormGroup
										label={t(
											'collection/views/collection-edit-meta-data___korte-omschrijving'
										)}
										labelFor="shortDescriptionId"
										error={getValidationFeedbackForShortDescription(
											collection.description,
											MAX_SEARCH_DESCRIPTION_LENGTH,
											true
										)}
									>
										<TextArea
											name="shortDescriptionId"
											value={collection.description || ''}
											id="shortDescriptionId"
											height="medium"
											onChange={(value: string) =>
												changeCollectionState({
													type: 'UPDATE_COLLECTION_PROP',
													collectionProp: 'description',
													collectionPropValue: value,
												})
											}
										/>
										<label>
											{getValidationFeedbackForShortDescription(
												collection.description,
												MAX_SEARCH_DESCRIPTION_LENGTH
											)}
										</label>
									</FormGroup>
									{!isCollection && (
										<FormGroup
											label={t(
												'collection/components/collection-or-bundle-edit-meta-data___beschrijving'
											)}
											labelFor="longDescriptionId"
											error={getValidationFeedbackForShortDescription(
												collection.description_long,
												MAX_LONG_DESCRIPTION_LENGTH,
												true
											)}
										>
											<WYSIWYGWrapper
												id="longDescriptionId"
												controls={
													isCollection
														? WYSIWYG_OPTIONS_DEFAULT_NO_TITLES
														: WYSIWYG_OPTIONS_BUNDLE_DESCRIPTION
												}
												initialHtml={collection.description_long || ''}
												state={descriptionLongEditorState}
												onChange={setDescriptionLongEditorState}
												onBlur={() =>
													changeCollectionState({
														type: 'UPDATE_COLLECTION_PROP',
														collectionProp: 'description_long',
														collectionPropValue: sanitizeHtml(
															descriptionLongEditorState
																? descriptionLongEditorState.toHTML()
																: collection.description_long || '',
															'link'
														),
													})
												}
											/>
											<label>
												{getValidationFeedbackForShortDescription(
													sanitizeHtml(
														descriptionLongEditorState
															? descriptionLongEditorState.toHTML()
															: collection.description_long || '',
														'link'
													),
													MAX_LONG_DESCRIPTION_LENGTH
												)}
											</label>
										</FormGroup>
									)}
									<FormGroup
										label={t(
											'collection/views/collection-edit-meta-data___persoonlijke-opmerkingen-notities'
										)}
										labelFor="personalRemarkId"
									>
										<TextArea
											name="personalRemarkId"
											value={collection.note || ''}
											id="personalRemarkId"
											height="medium"
											placeholder={t(
												'collection/views/collection-edit-meta-data___geef-hier-je-persoonlijke-opmerkingen-notities-in'
											)}
											onChange={(value: string) =>
												changeCollectionState({
													type: 'UPDATE_COLLECTION_PROP',
													collectionProp: 'note',
													collectionPropValue: value,
												})
											}
										/>
									</FormGroup>
								</Column>
								<Column size="3-5">
									<FormGroup
										label={t(
											'collection/views/collection-edit-meta-data___cover-afbeelding'
										)}
										labelFor="coverImageId"
									>
										{isCollection ? (
											<Button
												type="secondary"
												label={t(
													'collection/views/collection-edit-meta-data___stel-een-afbeelding-in'
												)}
												title={
													isCollection
														? t(
																'collection/components/collection-or-bundle-edit-meta-data___kies-een-afbeelding-om-te-gebruiken-als-de-cover-van-deze-collectie'
														  )
														: t(
																'collection/components/collection-or-bundle-edit-meta-data___kies-een-afbeelding-om-te-gebruiken-als-de-cover-van-deze-bundel'
														  )
												}
												onClick={() => setCollectionsStillsModalOpen(true)}
											/>
										) : (
											<FileUpload
												label={t(
													'collection/components/collection-or-bundle-edit-meta-data___upload-een-cover-afbeelding'
												)}
												urls={
													collection.thumbnail_path
														? [collection.thumbnail_path]
														: []
												}
												allowMulti={false}
												assetType="BUNDLE_COVER"
												ownerId={collection.id}
												onChange={urls =>
													changeCollectionState({
														type: 'UPDATE_COLLECTION_PROP',
														collectionProp: 'thumbnail_path',
														collectionPropValue: urls[0] || null,
													})
												}
											/>
										)}
									</FormGroup>
									{/* TODO: DISABLED FEATURE
											{ isCollection &&
												<FormGroup label={t('collection/views/collection-edit-meta-data___map')} labelFor="mapId">
													<Button type="secondary" icon="add" label={t('collection/views/collection-edit-meta-data___voeg-toe-aan-een-map')} />
												</FormGroup>
											}
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

export default CollectionOrBundleEditMetaData;

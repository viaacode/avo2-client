import { sanitizeHtml, SanitizePreset } from '@meemoo/admin-core-ui';
import {
	Button,
	Column,
	Container,
	Form,
	FormGroup,
	Grid,
	Spacer,
	TagInfo,
	TextArea,
} from '@viaa/avo2-components';
import { RichEditorState } from '@viaa/avo2-components/dist/esm/wysiwyg';
import type { Avo } from '@viaa/avo2-types';
import { StringMap } from 'i18next';
import React, { FunctionComponent, useState } from 'react';

import {
	EducationLevelsField,
	FileUpload,
	ShortDescriptionField,
	SubjectsField,
} from '../../shared/components';
import WYSIWYGWrapper from '../../shared/components/WYSIWYGWrapper/WYSIWYGWrapper';
import {
	WYSIWYG_OPTIONS_BUNDLE_DESCRIPTION,
	WYSIWYG_OPTIONS_DEFAULT_NO_TITLES,
} from '../../shared/constants/wysiwyg';
import { stripHtml } from '../../shared/helpers';
import useTranslation from '../../shared/hooks/useTranslation';
import { MAX_LONG_DESCRIPTION_LENGTH } from '../collection.const';
import { getValidationFeedbackForDescription } from '../collection.helpers';
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
	const { tText } = useTranslation();

	// State
	const [isCollectionsStillsModalOpen, setCollectionsStillsModalOpen] = useState<boolean>(false);
	const [descriptionLongEditorState, setDescriptionLongEditorState] = useState<
		RichEditorState | undefined
	>(undefined);

	const isCollection = type === 'collection';

	const updateCollectionMultiProperty = (
		selectedTagOptions: TagInfo[],
		collectionProp: keyof Avo.Collection.Collection
	) => {
		changeCollectionState({
			collectionProp,
			type: 'UPDATE_COLLECTION_PROP',
			collectionPropValue: (selectedTagOptions || []).map((tag) => tag.value as string),
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
									<EducationLevelsField
										value={collection.lom_context}
										onChange={(values: TagInfo[]) =>
											updateCollectionMultiProperty(values, 'lom_context')
										}
									/>
									<SubjectsField
										value={collection.lom_classification}
										onChange={(values: TagInfo[]) =>
											updateCollectionMultiProperty(
												values,
												'lom_classification'
											)
										}
									/>
									<ShortDescriptionField
										value={collection.description}
										onChange={(value: string) =>
											changeCollectionState({
												type: 'UPDATE_COLLECTION_PROP',
												collectionProp: 'description',
												collectionPropValue: value,
											})
										}
									/>
									{!isCollection && (
										<FormGroup
											label={tText(
												'collection/components/collection-or-bundle-edit-meta-data___beschrijving'
											)}
											labelFor="longDescriptionId"
											error={getValidationFeedbackForDescription(
												stripHtml(
													descriptionLongEditorState
														? descriptionLongEditorState.toHTML()
														: collection.description_long || ''
												),
												MAX_LONG_DESCRIPTION_LENGTH,
												(count) => {
													return tText(
														'collection/components/collection-or-bundle-edit-meta-data___de-beschrijving-is-te-lang-count',
														{
															count,
														} as StringMap
													);
												},
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
															SanitizePreset.link
														),
													})
												}
											/>
											<label>
												{getValidationFeedbackForDescription(
													stripHtml(
														descriptionLongEditorState
															? descriptionLongEditorState.toHTML()
															: collection.description_long || ''
													),
													MAX_LONG_DESCRIPTION_LENGTH,
													(count) =>
														tText(
															'collection/components/collection-or-bundle-edit-meta-data___de-beschrijving-is-te-lang-count',
															{
																count,
															} as StringMap
														)
												)}
											</label>
										</FormGroup>
									)}
									<FormGroup
										label={tText(
											'collection/views/collection-edit-meta-data___persoonlijke-opmerkingen-notities'
										)}
										labelFor="personalRemarkId"
									>
										<TextArea
											name="personalRemarkId"
											value={collection.note || ''}
											id="personalRemarkId"
											height="medium"
											placeholder={tText(
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
										label={tText(
											'collection/views/collection-edit-meta-data___cover-afbeelding'
										)}
										labelFor="coverImageId"
									>
										{isCollection ? (
											<Button
												type="secondary"
												label={tText(
													'collection/views/collection-edit-meta-data___stel-een-afbeelding-in'
												)}
												title={
													isCollection
														? tText(
																'collection/components/collection-or-bundle-edit-meta-data___kies-een-afbeelding-om-te-gebruiken-als-de-cover-van-deze-collectie'
														  )
														: tText(
																'collection/components/collection-or-bundle-edit-meta-data___kies-een-afbeelding-om-te-gebruiken-als-de-cover-van-deze-bundel'
														  )
												}
												onClick={() => setCollectionsStillsModalOpen(true)}
											/>
										) : (
											<FileUpload
												label={tText(
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
												onChange={(urls) =>
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
												<FormGroup label={tText('collection/views/collection-edit-meta-data___map')} labelFor="mapId">
													<Button type="secondary" icon="add" label={tText('collection/views/collection-edit-meta-data___voeg-toe-aan-een-map')} />
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

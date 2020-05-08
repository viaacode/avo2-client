import { ApolloQueryResult } from 'apollo-boost';
import { get } from 'lodash-es';
import React, { FunctionComponent, useEffect, useState } from 'react';
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

import { FileUpload } from '../../shared/components';
import { CustomError } from '../../shared/helpers';
import { GET_CLASSIFICATIONS_AND_SUBJECTS } from '../../shared/queries/lookup.gql';
import { dataService } from '../../shared/services';
import { ContextAndClassificationData } from '../../shared/types/lookup';
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

	const isCollection = type === 'collection';

	useEffect(() => {
		dataService
			.query({
				query: GET_CLASSIFICATIONS_AND_SUBJECTS,
			})
			.then((response: ApolloQueryResult<ContextAndClassificationData>) => {
				setEducationLevels(
					get(response, 'data.lookup_enum_lom_context', []).map((item: any) => ({
						value: item.description,
						label: item.description,
					}))
				);
				setSubjects(
					get(response, 'data.lookup_enum_lom_classification', []).map((item: any) => ({
						value: item.description,
						label: item.description,
					}))
				);
			})
			.catch(err => {
				console.error(
					new CustomError(
						'Failed to get classifications and subjects from the database',
						err,
						{
							query: 'GET_CLASSIFICATIONS_AND_SUBJECTS',
						}
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
											label={t('Beschrijving')}
											labelFor="longDescriptionId"
											error={getValidationFeedbackForShortDescription(
												(collection as any).description_long,
												MAX_LONG_DESCRIPTION_LENGTH,
												true
											)} // TODO: Remove as any when typings update releases, 2.17.0
										>
											<TextArea
												name="longDescriptionId"
												value={(collection as any).description_long || ''} // TODO: Remove as any when typings update releases, 2.17.0
												id="longDescriptionId"
												height="medium"
												onChange={(value: string) =>
													changeCollectionState({
														type: 'UPDATE_COLLECTION_PROP',
														collectionProp: 'description_long',
														collectionPropValue: value,
													})
												}
											/>
											<label>
												{getValidationFeedbackForShortDescription(
													(collection as any).description_long,
													MAX_LONG_DESCRIPTION_LENGTH
												) /* TODO: Remove as any when typings update releases, 2.17. */}
											</label>
										</FormGroup>
									)}
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

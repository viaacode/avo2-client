import {
	Button,
	ButtonToolbar,
	Column,
	Form,
	FormGroup,
	Grid,
	Modal,
	ModalBody,
	ModalFooterRight,
	RadioButton,
	Select,
	Spacer,
	Spinner,
	TextInput,
	Toolbar,
	ToolbarItem,
	ToolbarRight,
} from '@viaa/avo2-components';
import type { Avo } from '@viaa/avo2-types';
import React, { FunctionComponent, useEffect, useState } from 'react';

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { getProfileId } from '../../../authentication/helpers/get-profile-id';
import { CollectionService } from '../../../collection/collection.service';
import { ContentTypeNumber } from '../../../collection/collection.types';
import { canManageEditorial } from '../../../collection/helpers/can-manage-editorial';
import TimeCropControls from '../../../shared/components/TimeCropControls/TimeCropControls';
import { isMobileWidth, toSeconds } from '../../../shared/helpers';
import { getValidStartAndEnd } from '../../../shared/helpers/cut-start-and-end';
import { setModalVideoSeekTime } from '../../../shared/helpers/set-modal-video-seek-time';
import useTranslation from '../../../shared/hooks/useTranslation';
import { trackEvents } from '../../../shared/services/event-logging-service';
import { ToastService } from '../../../shared/services/toast-service';
import { VideoStillService } from '../../../shared/services/video-stills-service';
import ItemVideoDescription from '../ItemVideoDescription';

import './AddToCollectionModal.scss';

interface AddToCollectionModalProps extends DefaultSecureRouteProps {
	externalId: string;
	itemMetaData: Avo.Item.Item;
	isOpen: boolean;
	onClose: () => void;
}

const AddToCollectionModal: FunctionComponent<AddToCollectionModalProps> = ({
	externalId,
	itemMetaData,
	isOpen,
	onClose,
	user,
}) => {
	const { tText, tHtml } = useTranslation();

	const [isProcessing, setIsProcessing] = useState<boolean>(false);
	const [createNewCollection, setCreateNewCollection] = useState<boolean>(false);
	const [selectedCollectionId, setSelectedCollectionId] = useState<string>('');
	const [selectedCollection, setSelectedCollection] = useState<Avo.Collection.Collection | null>(
		null
	);
	const [newCollectionTitle, setNewCollectionTitle] = useState<string>('');
	const [fragmentStartTime, setFragmentStartTime] = useState<number>(0);
	const [fragmentEndTime, setFragmentEndTime] = useState<number>(
		toSeconds(itemMetaData.duration) || 0
	);
	const [collections, setCollections] = useState<Partial<Avo.Collection.Collection>[]>([]);

	const fetchCollections = React.useCallback(
		() =>
			CollectionService.fetchCollectionsOrBundlesByUser('collection', user)
				.then((collectionTitles: Partial<Avo.Collection.Collection>[]) => {
					setCollections(collectionTitles);
				})
				.catch((err) => {
					console.error(err);
					ToastService.danger(
						tHtml(
							'item/components/modals/add-to-collection-modal___het-ophalen-van-de-bestaande-collections-is-mislukt'
						)
					);
				}),
		[user, tText]
	);

	useEffect(() => {
		fetchCollections().catch((err) => {
			console.error('Failed to fetch collections', err);
			ToastService.danger(
				tHtml(
					'item/components/modals/add-to-collection-modal___het-ophalen-van-de-collecties-is-mislukt'
				)
			);
		});
	}, [fetchCollections, tText]);

	useEffect(() => {
		if (isOpen) {
			// Reset the state
			setCreateNewCollection(!collections.length);
			setSelectedCollectionId('');
			setSelectedCollection(null);
			setNewCollectionTitle('');
			setFragmentStartTime(0);
			setFragmentEndTime(toSeconds(itemMetaData.duration) || 0);
		}
	}, [isOpen, itemMetaData.duration, collections.length]);

	const setSelectedCollectionIdAndGetCollectionInfo = async (id: string) => {
		try {
			setSelectedCollection(null);
			setSelectedCollectionId(id);
			setSelectedCollection(
				await CollectionService.fetchCollectionOrBundleById(
					id,
					'collection',
					undefined,
					false
				)
			);
		} catch (err) {
			ToastService.danger(
				tHtml(
					'item/components/modals/add-to-collection-modal___het-ophalen-van-de-collectie-details-is-mislukt'
				)
			);
		}
	};

	const getFragment = async (
		collection: Partial<Avo.Collection.Collection>
	): Promise<Partial<Avo.Collection.Fragment>> => {
		const hasCut =
			fragmentEndTime !== toSeconds(itemMetaData.duration) || fragmentStartTime !== 0;

		return {
			use_custom_fields: false,
			position: (collection.collection_fragments || []).length,
			external_id: externalId,
			start_oc: hasCut ? fragmentStartTime : null,
			end_oc: hasCut ? fragmentEndTime : null,
			custom_title: null,
			custom_description: null,
			collection_uuid: collection.id,
			item_meta: itemMetaData,
			type: 'ITEM',
			thumbnail_path: fragmentStartTime
				? await VideoStillService.getVideoStill(externalId, fragmentStartTime * 1000)
				: null,
		};
	};

	const addItemToExistingCollection = async (collection: Partial<Avo.Collection.Collection>) => {
		// Disable apply button
		setIsProcessing(true);

		try {
			const fragment = await getFragment(collection);
			delete fragment.item_meta;
			await CollectionService.insertFragments(collection.id as string, [
				fragment as Avo.Collection.Fragment,
			]);
			ToastService.success(
				tHtml(
					'item/components/modals/add-to-collection-modal___het-fragment-is-toegevoegd-aan-de-collectie'
				)
			);
			onClose();
			trackEvents(
				{
					object: String(collection.id),
					object_type: 'collection',
					action: 'add_to',
				},
				user
			);
		} catch (err) {
			console.error(err);
			ToastService.danger(
				tHtml(
					'item/components/modals/add-to-collection-modal___het-fragment-kon-niet-worden-toegevoegd-aan-de-collectie'
				)
			);
		}

		// Re-enable apply button
		setIsProcessing(false);
	};

	const addItemToNewCollection = async () => {
		// Disable "Toepassen" button
		setIsProcessing(true);

		let newCollection: Partial<Avo.Collection.Collection> | null = null;
		try {
			// Create new collection with one fragment in it
			newCollection = {
				title: newCollectionTitle,
				thumbnail_path: null,
				is_public: false,
				owner_profile_id: getProfileId(user),
				type_id: ContentTypeNumber.collection,
			};
			try {
				newCollection.thumbnail_path = await VideoStillService.getThumbnailForCollection({
					thumbnail_path: undefined,
					collection_fragments: [
						(await getFragment(newCollection)) as Avo.Collection.Fragment,
					],
				});
			} catch (err) {
				console.error('Failed to find cover image for new collection', err, {
					collectionFragments: [
						(await getFragment(newCollection)) as Avo.Collection.Fragment,
					],
				});
			}

			// Enable is_managed by default when one of these user groups creates a collection/bundle
			// https://meemoo.atlassian.net/browse/AVO-1453
			if (canManageEditorial(user)) {
				newCollection.is_managed = true;
			}

			const insertedCollection: Partial<Avo.Collection.Collection> =
				await CollectionService.insertCollection(newCollection);

			trackEvents(
				{
					object: insertedCollection.id || '',
					object_type: 'collection',
					action: 'create',
				},
				user
			);

			// Add fragment to collection
			await addItemToExistingCollection(insertedCollection);

			await fetchCollections();
			onClose();

			// Re-enable apply button
			setIsProcessing(false);
		} catch (err) {
			console.error('Failed to create collection', err, {
				variables: {
					collection: newCollection,
				},
			});
			ToastService.danger(
				tHtml(
					'item/components/modals/add-to-collection-modal___de-collectie-kon-niet-worden-aangemaakt'
				)
			);

			// Re-enable apply button
			setIsProcessing(false);
		}
	};

	const onApply = createNewCollection
		? addItemToNewCollection
		: () =>
				addItemToExistingCollection(
					selectedCollection as Partial<Avo.Collection.Collection>
				);

	const renderAddToCollectionModal = () => {
		const fragmentDuration = toSeconds(itemMetaData.duration) || 0;
		const [start, end] = getValidStartAndEnd(
			fragmentStartTime,
			fragmentEndTime,
			fragmentDuration
		);

		return (
			<Modal
				title={tText(
					'item/components/modals/add-to-collection-modal___voeg-fragment-toe-aan-collectie'
				)}
				size="extra-large"
				isOpen={isOpen}
				onClose={onClose}
				scrollable
			>
				<ModalBody>
					<div className="c-modal__body-add-fragment">
						<Spacer>
							<Form>
								<ItemVideoDescription
									itemMetaData={itemMetaData}
									showTitle
									showDescription
									canPlay={isOpen}
									cuePointsLabel={{ start, end }}
									verticalLayout={isMobileWidth()}
								/>
								<Grid>
									<Column size="2-7" className="u-spacer-top-l u-spacer-bottom-l">
										<TimeCropControls
											startTime={fragmentStartTime}
											endTime={fragmentEndTime}
											minTime={0}
											maxTime={fragmentDuration}
											onChange={(
												newStartTime: number,
												newEndTime: number
											) => {
												if (newStartTime !== fragmentStartTime) {
													setModalVideoSeekTime(newStartTime);
												} else if (newEndTime !== fragmentEndTime) {
													setModalVideoSeekTime(newEndTime);
												}
												setFragmentStartTime(newStartTime);
												setFragmentEndTime(newEndTime);
											}}
										/>
									</Column>
									<Column size="2-5">
										<FormGroup
											label={tText(
												'item/components/modals/add-to-collection-modal___collectie'
											)}
											required
										>
											<Spacer margin="bottom">
												<RadioButton
													label={tText(
														'item/components/modals/add-to-collection-modal___voeg-toe-aan-bestaande-collectie'
													)}
													checked={!createNewCollection}
													value="existing"
													name="collection"
													onChange={() => {
														setCreateNewCollection(false);
													}}
												/>
												<div>
													{collections.length ? (
														<Select
															id="existingCollection"
															options={[
																{
																	label: tText(
																		'item/components/modals/add-to-collection-modal___kies-collectie'
																	),
																	value: '',
																	disabled: true,
																},
																...collections.map(
																	(
																		collection: Partial<Avo.Collection.Collection>
																	) => ({
																		label:
																			collection.title || '',
																		value: String(
																			collection.id
																		),
																	})
																),
															]}
															value={selectedCollectionId}
															onChange={
																setSelectedCollectionIdAndGetCollectionInfo
															}
															disabled={createNewCollection}
														/>
													) : (
														<TextInput
															disabled
															value={tText(
																'item/components/modals/add-to-collection-modal___je-hebt-nog-geen-collecties'
															)}
														/>
													)}
												</div>
											</Spacer>
											<Spacer margin="bottom">
												<RadioButton
													label={tText(
														'item/components/modals/add-to-collection-modal___voeg-toe-aan-een-nieuwe-collectie'
													)}
													checked={createNewCollection}
													value="new"
													name="collection"
													onChange={() => {
														setCreateNewCollection(true);
													}}
												/>
												<div>
													<TextInput
														placeholder={tText(
															'item/components/modals/add-to-collection-modal___collectie-titel'
														)}
														disabled={!createNewCollection}
														value={newCollectionTitle}
														onChange={setNewCollectionTitle}
													/>
												</div>
											</Spacer>
										</FormGroup>
									</Column>
								</Grid>
							</Form>
						</Spacer>
					</div>
				</ModalBody>
				<ModalFooterRight>
					<Toolbar spaced>
						<ToolbarRight>
							<ToolbarItem>
								<ButtonToolbar>
									{isProcessing && <Spinner />}
									<Button
										label={tText(
											'item/components/modals/add-to-collection-modal___annuleren'
										)}
										type="link"
										block
										onClick={onClose}
										disabled={isProcessing}
									/>
									<Button
										label={tText(
											'item/components/modals/add-to-collection-modal___toepassen'
										)}
										type="primary"
										block
										title={
											createNewCollection && !newCollectionTitle
												? tText(
														'item/components/modals/add-to-collection-modal___u-moet-een-collectie-titel-opgeven'
												  )
												: !createNewCollection && !selectedCollection
												? tText(
														'item/components/modals/add-to-collection-modal___je-moet-een-collectie-kiezen-om-dit-item-aan-toe-te-voegen'
												  )
												: ''
										}
										disabled={
											(createNewCollection && !newCollectionTitle) ||
											(!createNewCollection && !selectedCollection) ||
											isProcessing
										}
										onClick={onApply}
									/>
								</ButtonToolbar>
							</ToolbarItem>
						</ToolbarRight>
					</Toolbar>
				</ModalFooterRight>
			</Modal>
		);
	};

	return renderAddToCollectionModal();
};

export default AddToCollectionModal;

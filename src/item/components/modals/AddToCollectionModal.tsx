import { get } from 'lodash-es';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
	Button,
	ButtonToolbar,
	Column,
	Container,
	Form,
	FormGroup,
	Grid,
	Modal,
	ModalBody,
	ModalFooterRight,
	MultiRange,
	RadioButton,
	Select,
	Spacer,
	Spinner,
	TextInput,
	Toolbar,
	ToolbarItem,
	ToolbarRight,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { getProfileId, getProfileName } from '../../../authentication/helpers/get-profile-info';
import { CollectionService } from '../../../collection/collection.service';
import { ContentTypeNumber } from '../../../collection/collection.types';
import { formatDurationHoursMinutesSeconds, toSeconds } from '../../../shared/helpers';
import { ToastService } from '../../../shared/services';
import { trackEvents } from '../../../shared/services/event-logging-service';
import { getThumbnailForCollection } from '../../../shared/services/stills-service';
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
	history,
	location,
	match,
	user,
}) => {
	const [t] = useTranslation();

	const [isProcessing, setIsProcessing] = useState<boolean>(false);
	const [createNewCollection, setCreateNewCollection] = useState<boolean>(false);
	const [selectedCollectionId, setSelectedCollectionId] = useState<string>('');
	const [selectedCollection, setSelectedCollection] = useState<
		Avo.Collection.Collection | undefined
	>(undefined);
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
				.catch(err => {
					console.error(err);
					ToastService.danger(
						t(
							'item/components/modals/add-to-collection-modal___het-ophalen-van-de-bestaande-collections-is-mislukt'
						)
					);
				}),
		[user, t]
	);

	useEffect(() => {
		fetchCollections().catch(err => {
			console.error('Failed to fetch collections', err);
			ToastService.danger(
				t(
					'item/components/modals/add-to-collection-modal___het-ophalen-van-de-collecties-is-mislukt'
				)
			);
		});
	}, [fetchCollections, t]);

	useEffect(() => {
		if (isOpen) {
			// Reset the state
			setCreateNewCollection(!collections.length);
			setSelectedCollectionId('');
			setSelectedCollection(undefined);
			setNewCollectionTitle('');
			setFragmentStartTime(0);
			setFragmentEndTime(toSeconds(itemMetaData.duration) || 0);
		}
	}, [isOpen, itemMetaData.duration, collections.length]);

	const setSelectedCollectionIdAndGetCollectionInfo = async (id: string) => {
		try {
			setSelectedCollection(undefined);
			setSelectedCollectionId(id);
			setSelectedCollection(
				await CollectionService.fetchCollectionOrBundleById(id, 'collection')
			);
		} catch (err) {
			ToastService.danger(
				t(
					'item/components/modals/add-to-collection-modal___het-ophalen-van-de-collectie-details-is-mislukt'
				)
			);
		}
	};

	const getFragment = (
		collection: Partial<Avo.Collection.Collection>
	): Partial<Avo.Collection.Fragment> => {
		const hasCut =
			fragmentEndTime !== toSeconds(itemMetaData.duration) || fragmentStartTime !== 0;

		return {
			use_custom_fields: false,
			start_oc: hasCut ? fragmentStartTime : null,
			position: (collection.collection_fragments || []).length,
			external_id: externalId,
			end_oc: hasCut ? fragmentEndTime : null,
			custom_title: null,
			custom_description: null,
			collection_uuid: collection.id,
			item_meta: itemMetaData,
		} as any;
	};

	const addItemToExistingCollection = async (collection: Partial<Avo.Collection.Collection>) => {
		// Disable apply button
		setIsProcessing(true);

		try {
			const fragment = getFragment(collection);
			delete fragment.item_meta;
			const fragments = await CollectionService.insertFragments(collection.id as string, [
				fragment as Avo.Collection.Fragment,
			]);
			ToastService.success(
				t(
					'item/components/modals/add-to-collection-modal___het-fragment-is-toegevoegd-aan-de-collectie'
				)
			);
			onClose();
			trackEvents(
				{
					object: String(collection.id),
					object_type: 'collections',
					message: `Gebruiker ${getProfileName(user)} heeft fragment ${get(
						fragments,
						'[0].id'
					)} toegevoegd aan collectie ${collection.id}`,
					action: 'add_to_collection',
				},
				user
			);
		} catch (err) {
			console.error(err);
			ToastService.danger(
				t(
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
				newCollection.thumbnail_path = await getThumbnailForCollection({
					thumbnail_path: undefined,
					collection_fragments: [getFragment(newCollection) as Avo.Collection.Fragment],
				});
			} catch (err) {
				console.error('Failed to find cover image for new collection', err, {
					collectionFragments: [getFragment(newCollection) as Avo.Collection.Fragment],
				});
			}

			const insertedCollection: Partial<Avo.Collection.Collection> = await CollectionService.insertCollection(
				newCollection
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
				t(
					'item/components/modals/add-to-collection-modal___de-collectie-kon-niet-worden-aangemaakt'
				)
			);

			// Re-enable apply button
			setIsProcessing(false);
		}
	};

	/**
	 * Converts a duration of the format "00:03:36" to number of seconds and stores it under the appropriate state
	 * @param timeString
	 * @param startOrEnd
	 */
	const setFragmentTime = (timeString: string, startOrEnd: 'start' | 'end') => {
		const setFunctions = {
			start: setFragmentStartTime,
			end: setFragmentEndTime,
		};
		const seconds = toSeconds(timeString);

		if (seconds !== null) {
			setFunctions[startOrEnd](seconds);
		}
	};

	const onUpdateMultiRangeValues = (values: number[]) => {
		setFragmentStartTime(values[0]);
		setFragmentEndTime(values[1]);
	};

	const onApply = createNewCollection
		? addItemToNewCollection
		: () =>
				addItemToExistingCollection(
					selectedCollection as Partial<Avo.Collection.Collection>
				);

	const renderAddToCollectionModal = () => {
		// const initFlowPlayer = () =>
		// 	!playerTicket && fetchPlayerTicket(externalId).then(data => setPlayerTicket(data));
		const fragmentDuration = toSeconds(itemMetaData.duration) || 0;

		return (
			<Modal
				title={t(
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
									user={user}
									history={history}
									location={location}
									match={match}
									showTitle
									showDescription
								/>
								<Grid>
									<Column size="2-7">
										<Container mode="vertical" className="m-time-crop-controls">
											<TextInput
												value={formatDurationHoursMinutesSeconds(
													fragmentStartTime
												)}
												onChange={timeString =>
													setFragmentTime(timeString, 'start')
												}
											/>
											<div className="m-multi-range-wrapper">
												<MultiRange
													values={[
														fragmentStartTime,
														Math.min(fragmentEndTime, fragmentDuration),
													]}
													onChange={onUpdateMultiRangeValues}
													min={0}
													max={fragmentDuration}
													step={1}
												/>
											</div>
											<TextInput
												value={formatDurationHoursMinutesSeconds(
													fragmentEndTime
												)}
												onChange={timeString =>
													setFragmentTime(timeString, 'end')
												}
											/>
										</Container>
									</Column>
									<Column size="2-5">
										<FormGroup
											label={t(
												'item/components/modals/add-to-collection-modal___collectie'
											)}
										>
											<Spacer margin="bottom">
												<RadioButton
													label={t(
														'item/components/modals/add-to-collection-modal___voeg-toe-aan-bestaande-collectie'
													)}
													checked={!createNewCollection}
													value="existing"
													name="collection"
													onChange={checked =>
														setCreateNewCollection(!checked)
													}
												/>
												<div>
													{collections.length ? (
														<Select
															id="existingCollection"
															options={[
																{
																	label: t(
																		'item/components/modals/add-to-collection-modal___kies-collectie'
																	),
																	value: '',
																	disabled: true,
																},
																...collections.map(
																	(
																		collection: Partial<
																			Avo.Collection.Collection
																		>
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
															value={t(
																'item/components/modals/add-to-collection-modal___je-hebt-nog-geen-collecties'
															)}
														/>
													)}
												</div>
											</Spacer>
											<Spacer margin="bottom">
												<RadioButton
													label={t(
														'item/components/modals/add-to-collection-modal___voeg-toe-aan-een-nieuwe-collectie'
													)}
													checked={createNewCollection}
													value="new"
													name="collection"
												/>
												<div>
													<TextInput
														placeholder={t(
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
										label={t(
											'item/components/modals/add-to-collection-modal___annuleren'
										)}
										type="link"
										block
										onClick={onClose}
										disabled={isProcessing}
									/>
									<Button
										label={t(
											'item/components/modals/add-to-collection-modal___toepassen'
										)}
										type="primary"
										block
										title={
											createNewCollection && !newCollectionTitle
												? t(
														'item/components/modals/add-to-collection-modal___u-moet-een-collectie-titel-opgeven'
												  )
												: !createNewCollection && !selectedCollection
												? t(
														'item/components/modals/add-to-collection-modal___bezig-met-collectie-detail-op-te-halen'
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

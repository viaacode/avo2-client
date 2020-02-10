import { ExecutionResult } from '@apollo/react-common';
import { useMutation } from '@apollo/react-hooks';
import { ApolloQueryResult } from 'apollo-client';
import { get, isNil } from 'lodash-es';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
	Button,
	ButtonToolbar,
	Column,
	Container,
	FlowPlayer,
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
import {
	GET_COLLECTION_BY_ID,
	INSERT_COLLECTION,
	INSERT_COLLECTION_FRAGMENTS,
} from '../../../collection/collection.gql';
import { CollectionService } from '../../../collection/collection.service';
import { ContentTypeNumber } from '../../../collection/collection.types';
import { formatDurationHoursMinutesSeconds, getEnv, toSeconds } from '../../../shared/helpers';
import { ApolloCacheManager, dataService } from '../../../shared/services/data-service';
import { trackEvents } from '../../../shared/services/event-logging-service';
import { fetchPlayerTicket } from '../../../shared/services/player-ticket-service';
import { getThumbnailForCollection } from '../../../shared/services/stills-service';
import toastService from '../../../shared/services/toast-service';

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
	const [t] = useTranslation();

	const [playerTicket, setPlayerTicket] = useState<string>();
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

	const [triggerCollectionFragmentsInsert] = useMutation(INSERT_COLLECTION_FRAGMENTS);
	const [triggerCollectionInsert] = useMutation(INSERT_COLLECTION);

	const fetchCollections = React.useCallback(
		() =>
			CollectionService.getCollectionTitlesByUser('collection', user)
				.then((collectionTitles: Partial<Avo.Collection.Collection>[]) => {
					setCollections(collectionTitles);
				})
				.catch(err => {
					console.error(err);
					toastService.danger(
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
			toastService.danger(
				t(
					'item/components/modals/add-to-collection-modal___het-ophalen-van-de-collecties-is-mislukt'
				)
			);
		});
	}, [fetchCollections, t]);

	useEffect(() => {
		if (isOpen) {
			// Reset the state
			setCreateNewCollection(false);
			setSelectedCollectionId('');
			setSelectedCollection(undefined);
			setNewCollectionTitle('');
			setFragmentStartTime(0);
			setFragmentEndTime(toSeconds(itemMetaData.duration) || 0);
		}
	}, [isOpen, itemMetaData.duration]);

	const setSelectedCollectionIdAndGetCollectionInfo = async (id: string) => {
		try {
			setSelectedCollection(undefined);
			setSelectedCollectionId(id);
			const response: ApolloQueryResult<Avo.Collection.Collection> = await dataService.query({
				query: GET_COLLECTION_BY_ID,
				variables: { id },
			});
			const collection = get(response, 'data.app_collections[0]');

			if (collection) {
				setSelectedCollection(collection);
			} else {
				toastService.danger(
					t(
						'item/components/modals/add-to-collection-modal___het-ophalen-van-de-collectie-details-is-mislukt'
					)
				);
			}
		} catch (err) {
			toastService.danger(
				t(
					'item/components/modals/add-to-collection-modal___het-ophalen-van-de-collectie-details-is-mislukt'
				)
			);
		}
	};

	const getFragment = (
		collection: Partial<Avo.Collection.Collection>
	): Partial<Avo.Collection.Fragment> => {
		const hasCut = fragmentEndTime !== toSeconds(itemMetaData.duration) || fragmentStartTime !== 0;

		return {
			use_custom_fields: false,
			start_oc: hasCut ? fragmentStartTime : null,
			position: (collection.collection_fragments || []).length,
			external_id: externalId,
			end_oc: hasCut ? fragmentEndTime : null,
			custom_title: null,
			custom_description: null,
			collection_uuid: collection.id, // TODO Remove conversion once update to typings 2.8
			collection_id: String((collection as any).avo1_id),
			item_meta: itemMetaData,
		} as any; // TODO Remove cast once update to typings 2.8
	};

	const addItemToExistingCollection = async (collection: Partial<Avo.Collection.Collection>) => {
		// Disable apply button
		setIsProcessing(true);

		try {
			const fragment = getFragment(collection);
			delete fragment.item_meta;
			const response: void | ExecutionResult<
				Avo.Collection.Fragment
			> = await triggerCollectionFragmentsInsert({
				variables: {
					id: collection.id,
					fragments: [fragment],
				},
				update: ApolloCacheManager.clearCollectionCache,
			});

			if (!response || response.errors) {
				console.error(get(response, 'errors'));
				toastService.danger(
					t(
						'item/components/modals/add-to-collection-modal___het-fragment-kon-niet-worden-toegevoegd-aan-de-collectie'
					)
				);
			} else {
				toastService.success(
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
							response,
							'data.insert_app_collection_fragments.returning[0].id'
						)} toegevoegd aan collectie ${collection.id}`,
						action: 'add_to_collection',
					},
					user
				);
			}
		} catch (err) {
			console.error(err);
			toastService.danger(
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

			const response: void | ExecutionResult<
				Avo.Collection.Collection
			> = await triggerCollectionInsert({
				variables: {
					collection: newCollection,
				},
				update: ApolloCacheManager.clearCollectionCache,
			});

			const insertedCollection: Partial<Avo.Collection.Collection> = get(
				response,
				'data.insert_app_collections.returning[0]'
			);

			if (!response || response.errors) {
				toastService.danger(
					t(
						'item/components/modals/add-to-collection-modal___de-collectie-kon-niet-worden-aangemaakt'
					)
				);
			} else if (!insertedCollection || isNil(insertedCollection.id)) {
				toastService.danger(
					t(
						'item/components/modals/add-to-collection-modal___de-aangemaakte-collectie-kon-niet-worden-opgehaald'
					)
				);
			} else {
				// Add fragment to collection
				await addItemToExistingCollection(insertedCollection);
				fetchCollections();
				onClose();
			}

			// Re-enable apply button
			setIsProcessing(false);
		} catch (err) {
			console.error('Failed to create collection', err, {
				variables: {
					collection: newCollection,
				},
			});
			toastService.danger(
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
		: () => addItemToExistingCollection(selectedCollection as Partial<Avo.Collection.Collection>);

	const renderAddToCollectionModal = () => {
		const initFlowPlayer = () =>
			!playerTicket && fetchPlayerTicket(externalId).then(data => setPlayerTicket(data));
		const fragmentDuration = toSeconds(itemMetaData.duration) || 0;

		return (
			<Modal
				title={t(
					'item/components/modals/add-to-collection-modal___voeg-fragment-toe-aan-collectie'
				)}
				size="auto"
				isOpen={isOpen}
				onClose={onClose}
				scrollable
			>
				<ModalBody>
					<div className="c-modal__body-add-fragment">
						<Spacer>
							<Form>
								<Grid>
									<Column size="2-7">
										<FlowPlayer
											src={playerTicket ? playerTicket.toString() : null}
											poster={itemMetaData.thumbnail_path}
											title={itemMetaData.title}
											onInit={initFlowPlayer}
											subtitles={['30-12-2011', 'VRT']}
											token={getEnv('FLOW_PLAYER_TOKEN')}
											dataPlayerId={getEnv('FLOW_PLAYER_ID')}
											logo={get(itemMetaData, 'organisation.logo_url')}
										/>
										<Container mode="vertical" className="m-time-crop-controls">
											<TextInput
												value={formatDurationHoursMinutesSeconds(fragmentStartTime)}
												onChange={timeString => setFragmentTime(timeString, 'start')}
											/>
											<div className="m-multi-range-wrapper">
												<MultiRange
													values={[fragmentStartTime, Math.min(fragmentEndTime, fragmentDuration)]}
													onChange={onUpdateMultiRangeValues}
													min={0}
													max={fragmentDuration}
													step={1}
												/>
											</div>
											<TextInput
												value={formatDurationHoursMinutesSeconds(fragmentEndTime)}
												onChange={timeString => setFragmentTime(timeString, 'end')}
											/>
										</Container>
									</Column>
									<Column size="2-5">
										<FormGroup label={t('item/components/modals/add-to-collection-modal___titel')}>
											<span>{itemMetaData.title}</span>
										</FormGroup>
										<FormGroup
											label={t('item/components/modals/add-to-collection-modal___beschrijving')}
										>
											<span>{itemMetaData.description}</span>
										</FormGroup>
										<FormGroup
											label={t('item/components/modals/add-to-collection-modal___collectie')}
										>
											<Spacer margin="bottom">
												<RadioButton
													label={t(
														'item/components/modals/add-to-collection-modal___voeg-toe-aan-bestaande-collectie'
													)}
													checked={!createNewCollection}
													value="existing"
													name="collection"
													onChange={checked => setCreateNewCollection(!checked)}
												/>
												<div>
													<Select
														id="existingCollection"
														options={[
															{
																label: collections.length
																	? t(
																			'item/components/modals/add-to-collection-modal___kies-collectie'
																	  )
																	: t(
																			'item/components/modals/add-to-collection-modal___je-hebt-nog-geen-collecties'
																	  ),
																value: '',
																disabled: true,
															},
															...collections.map(
																(collection: Partial<Avo.Collection.Collection>) => ({
																	label: collection.title || '',
																	value: String(collection.id),
																})
															),
														]}
														value={selectedCollectionId}
														onChange={setSelectedCollectionIdAndGetCollectionInfo}
														disabled={createNewCollection}
													/>
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
										label={t('item/components/modals/add-to-collection-modal___annuleren')}
										type="link"
										block
										onClick={onClose}
										disabled={isProcessing}
									/>
									<Button
										label={t('item/components/modals/add-to-collection-modal___toepassen')}
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

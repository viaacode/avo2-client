import { ExecutionResult } from '@apollo/react-common';
import { useMutation } from '@apollo/react-hooks';
import { ApolloQueryResult } from 'apollo-client';
import { get, isNil } from 'lodash-es';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { withRouter } from 'react-router';

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

import {
	GET_COLLECTION_BY_ID,
	GET_COLLECTION_TITLES_BY_OWNER,
	INSERT_COLLECTION,
	INSERT_COLLECTION_FRAGMENT,
} from '../../../collection/graphql';
import { getEnv } from '../../../shared/helpers/env';
import { formatDurationHoursMinutesSeconds } from '../../../shared/helpers/formatters/duration';
import { toSeconds } from '../../../shared/helpers/parsers/duration';
import { ApolloCacheManager, dataService } from '../../../shared/services/data-service';
import { trackEvents } from '../../../shared/services/event-logging-service';
import { fetchPlayerTicket } from '../../../shared/services/player-ticket-service';
import toastService, { TOAST_TYPE } from '../../../shared/services/toast-service';

import { getProfileId, getProfileName } from '../../../authentication/helpers/get-profile-info';
import './FragmentAddToCollection.scss';

interface FragmentAddToCollectionProps {
	externalId: string;
	itemMetaData: Avo.Item.Item;
	isOpen: boolean;
	onClose: () => void;
}

const FragmentAddToCollection: FunctionComponent<FragmentAddToCollectionProps> = ({
	externalId,
	itemMetaData,
	isOpen,
	onClose = () => {},
}) => {
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
	const [collections, setCollections] = useState<Avo.Collection.Collection[]>([]);

	const [triggerCollectionFragmentInsert] = useMutation(INSERT_COLLECTION_FRAGMENT);
	const [triggerInsertCollection] = useMutation(INSERT_COLLECTION);

	useEffect(() => {
		if (isOpen) {
			// Reset the state
			setCreateNewCollection(false);
			setSelectedCollectionId('');
			setSelectedCollection(undefined);
			setNewCollectionTitle('');
			setFragmentStartTime(0);
			setFragmentEndTime(toSeconds(itemMetaData.duration) || 0);

			const queryInfo = {
				query: GET_COLLECTION_TITLES_BY_OWNER,
				variables: { owner_profile_id: getProfileId() },
			};
			dataService
				.query(queryInfo)
				.then(response => {
					setCollections(get(response, 'data.app_collections'));
				})
				.catch(err => {
					console.error('Failed to get collection titles by owner', err, queryInfo);
					toastService('Het ophalen van de bestaande collecties is mislukt', TOAST_TYPE.DANGER);
				});
		}
	}, [isOpen]);

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
				toastService('Het ophalen van de collectie details is mislukt', TOAST_TYPE.DANGER);
			}
		} catch (err) {
			toastService('Het ophalen van de collectie details is mislukt', TOAST_TYPE.DANGER);
		}
	};

	const addItemToExistingCollection = async (collection: Partial<Avo.Collection.Collection>) => {
		// Disable "Toepassen" button
		setIsProcessing(true);

		try {
			const response: void | ExecutionResult<
				Avo.Collection.Fragment
			> = await triggerCollectionFragmentInsert({
				variables: {
					id: collection.id,
					fragment: {
						use_custom_fields: false,
						start_oc: fragmentStartTime,
						position: (collection.collection_fragments || []).length,
						external_id: externalId,
						end_oc: fragmentEndTime,
						custom_title: null,
						custom_description: null,
						collection_id: collection.id,
					},
				},
				update: ApolloCacheManager.clearCollectionCache,
			});

			if (!response || response.errors) {
				console.error(get(response, 'errors'));
				toastService('Het fragment kon niet worden toegevoegd aan de collectie', TOAST_TYPE.DANGER);
			} else {
				toastService('Het fragment is toegevoegd aan de collectie', TOAST_TYPE.SUCCESS);
				onClose();
				trackEvents({
					event_object: {
						type: 'collection',
						identifier: String(collection.id as number),
					},
					event_message: `Gebruiker ${getProfileName()} heeft fragment ${get(
						response,
						'data.insert_app_collection_fragments.returning[0].id'
					)} toegevoegd aan collectie ${collection.id}`,
					name: 'add_to_collection',
					category: 'item',
				});
			}
		} catch (err) {
			console.error(err);
			toastService('Het fragment kon niet worden toegevoegd aan de collectie', TOAST_TYPE.DANGER);
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
				thumbnail_path: '/images/100x100.svg', // TODO get video stills of fragment and set first frame as cover
				is_public: false,
				owner_profile_id: getProfileId(),
				type_id: 3,
			};

			const response: void | ExecutionResult<
				Avo.Collection.Collection
			> = await triggerInsertCollection({
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
				toastService('De collectie kon niet worden aangemaakt', TOAST_TYPE.DANGER);
			} else if (!insertedCollection || isNil(insertedCollection.id)) {
				toastService('De aangemaakte collectie kon niet worden opgehaald', TOAST_TYPE.DANGER);
			} else {
				// Add fragment to collection
				await addItemToExistingCollection(insertedCollection);
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
			toastService('De collectie kon niet worden aangemaakt', TOAST_TYPE.DANGER);

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

	const renderFragmentAddToCollectionModal = () => {
		const initFlowPlayer = () =>
			!playerTicket && fetchPlayerTicket(externalId).then(data => setPlayerTicket(data));

		return (
			<Modal
				title="Voeg fragment toe aan collectie"
				size="auto"
				scrollable={true}
				isOpen={isOpen}
				onClose={onClose}
			>
				<ModalBody>
					<div className="c-modal__body-add-fragment">
						<Spacer>
							<Form>
								<Grid>
									<Column size="2-7">
										{itemMetaData && ( // TODO: Replace publisher, published_at by real publisher
											<FlowPlayer
												src={playerTicket ? playerTicket.toString() : null}
												poster={itemMetaData.thumbnail_path}
												title={itemMetaData.title}
												onInit={initFlowPlayer}
												subtitles={['30-12-2011', 'VRT']}
												token={getEnv('FLOW_PLAYER_TOKEN')}
												dataPlayerId={getEnv('FLOW_PLAYER_ID')}
											/>
										)}
										<Container mode="vertical" className="m-time-crop-controls">
											<TextInput
												value={formatDurationHoursMinutesSeconds(fragmentStartTime)}
												onChange={timeString => setFragmentTime(timeString, 'start')}
											/>
											<div className="m-multi-range-wrapper">
												<MultiRange
													values={[fragmentStartTime, fragmentEndTime]}
													onChange={onUpdateMultiRangeValues}
													min={0}
													max={toSeconds(itemMetaData.duration) || 0}
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
										<FormGroup label="Titel">
											<span>{itemMetaData.title}</span>
										</FormGroup>
										<FormGroup label="Beschrijving">
											<span>{itemMetaData.description}</span>
										</FormGroup>
										<FormGroup label="Collectie">
											<Spacer margin="bottom">
												<RadioButton
													label="Voeg toe aan bestaande collectie"
													checked={!createNewCollection}
													value="existing"
													name="collection"
													onChange={checked => setCreateNewCollection(!checked)}
												/>
												<div>
													<Select
														id="existingCollection"
														options={[
															{ label: 'Kies collectie', value: '', disabled: true },
															...collections.map((collection: { id: number; title: string }) => ({
																label: collection.title,
																value: String(collection.id),
															})),
														]}
														value={selectedCollectionId}
														onChange={setSelectedCollectionIdAndGetCollectionInfo}
														disabled={createNewCollection}
													/>
												</div>
											</Spacer>
											<Spacer margin="bottom">
												<RadioButton
													label="Voeg toe aan een nieuwe collectie"
													checked={createNewCollection}
													value="new"
													name="collection"
												/>
												<div>
													<TextInput
														placeholder="Collectie titel"
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
										label="Annuleren"
										type="link"
										block
										onClick={onClose}
										disabled={isProcessing}
									/>
									<Button
										label="Toepassen"
										type="primary"
										block
										title={
											createNewCollection && !newCollectionTitle
												? 'U moet een collectie titel opgeven'
												: !createNewCollection && !selectedCollection
												? 'bezig met collectie detail op te halen'
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

	return renderFragmentAddToCollectionModal();
};

// https://github.com/DefinitelyTyped/DefinitelyTyped/issues/31363#issuecomment-484542717
// @ts-ignore
export default withRouter(FragmentAddToCollection);

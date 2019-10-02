import { ExecutionResult } from '@apollo/react-common';
import { useMutation } from '@apollo/react-hooks';
import { ApolloQueryResult } from 'apollo-client';
import { get } from 'lodash-es';
import React, { FunctionComponent, useState } from 'react';

import {
	Button,
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
import { DataQueryComponent } from '../../../shared/components/DataComponent/DataQueryComponent';
import { FlowPlayer } from '../../../shared/components/FlowPlayer/FlowPlayer';
import { formatDurationHoursMinutesSeconds } from '../../../shared/helpers/formatters/duration';
import { toSeconds } from '../../../shared/helpers/parsers/duration';
import { dataService } from '../../../shared/services/data-service';
import { trackEvents } from '../../../shared/services/event-logging-service';
import { fetchPlayerTicket } from '../../../shared/services/player-ticket-service';
import toastService, { TOAST_TYPE } from '../../../shared/services/toast-service';
import './AddFragmentToCollection.scss';

interface AddFragmentToCollectionProps {
	externalId: string;
	itemMetaData: Avo.Item.Response;
	isOpen: boolean;
	onClose: () => void;
}

export const AddFragmentToCollection: FunctionComponent<AddFragmentToCollectionProps> = ({
	externalId,
	itemMetaData,
	isOpen,
	onClose = () => {},
}) => {
	const [playerTicket, setPlayerTicket] = useState<string>();
	const [createNewCollection, setCreateNewCollection] = useState<boolean>(false);
	const [selectedCollectionId, setSelectedCollectionId] = useState<string>('');
	const [selectedCollection, setSelectedCollection] = useState<Avo.Collection.Response | undefined>(
		undefined
	);
	const [newCollectionTitle, setNewCollectionTitle] = useState<string>('');
	const [fragmentStartTime, setFragmentStartTime] = useState<number>(0);
	const [fragmentEndTime, setFragmentEndTime] = useState<number>(
		toSeconds(itemMetaData.duration) || 0
	);
	const [triggerCollectionFragmentInsert] = useMutation(INSERT_COLLECTION_FRAGMENT);
	const [triggerInsertCollection] = useMutation(INSERT_COLLECTION);

	const setSelectedCollectionIdAndGetCollectionInfo = async (id: string) => {
		try {
			setSelectedCollection(undefined);
			setSelectedCollectionId(id);
			const response: ApolloQueryResult<Avo.Collection.Response> = await dataService.query({
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

	const addItemToExistingCollection = async (collection: Partial<Avo.Collection.Response>) => {
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
			});
			if (!response || response.errors) {
				console.error(get(response, 'errors'));
				toastService('Het fragment kon niet worden toegevoegd aan de collectie', TOAST_TYPE.DANGER);
			} else {
				toastService('Het fragment is toegevoegd aan de collectie', TOAST_TYPE.SUCCESS);
				onClose();
			}
		} catch (err) {
			console.error(err);
			toastService('Het fragment kon niet worden toegevoegd aan de collectie', TOAST_TYPE.DANGER);
		}
	};

	const addItemToNewCollection = async () => {
		try {
			// Create new collection with one fragment in it
			const response: void | ExecutionResult<
				Avo.Collection.Response
			> = await triggerInsertCollection({
				variables: {
					collection: {
						title: newCollectionTitle,
						thumbnail_path: '/images/100x100.svg', // TODO get video stills of fragment and set first frame as cover
						is_public: false,
						owner_uid: '54859c98-d5d3-1038-8d91-6dfda901a78e',
						type_id: 3,
					} as Partial<Avo.Collection.Response>,
				},
			});
			const insertedCollection: Partial<Avo.Collection.Response> = get(
				response,
				'data.insert_app_collections.returning[0]'
			);

			if (!response || response.errors) {
				toastService('De collectie kon niet worden aangemaakt', TOAST_TYPE.DANGER);
			} else if (!insertedCollection) {
				toastService('De aangemaakte collectie kon niet worden opgehaald', TOAST_TYPE.DANGER);
			} else {
				trackEvents({
					activity: `User ??? has created a new collection ${insertedCollection.id}`, // TODO fill in user id
					message: {
						object: {
							identifier: String(insertedCollection.id),
							type: 'collection',
						},
					},
				});

				// Add fragment to collection
				await addItemToExistingCollection(insertedCollection);
				onClose();
			}
		} catch (err) {
			toastService('De collectie kon niet worden aangemaakt', TOAST_TYPE.DANGER);
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

	const renderAddFragmentToCollectionModal = (collections: { id: number; title: string }[]) => {
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
								<div className="c-button-toolbar">
									<Button label="Annuleren" type="link" block={true} onClick={onClose} />
									<Button
										label="Toepassen"
										type="primary"
										block={true}
										title={
											createNewCollection && !newCollectionTitle
												? 'U moet een collectie titel opgeven'
												: !createNewCollection && !selectedCollection
												? 'bezig met collectie detail op te halen'
												: ''
										}
										disabled={
											(createNewCollection && !newCollectionTitle) ||
											(!createNewCollection && !selectedCollection)
										}
										onClick={
											createNewCollection
												? addItemToNewCollection
												: () =>
														addItemToExistingCollection(selectedCollection as Partial<
															Avo.Collection.Response
														>)
										}
									/>
								</div>
							</ToolbarItem>
						</ToolbarRight>
					</Toolbar>
				</ModalFooterRight>
			</Modal>
		);
	};

	return (
		<DataQueryComponent
			query={GET_COLLECTION_TITLES_BY_OWNER}
			// TODO: replace with actual owner id from ldap object
			variables={{ ownerId: '54859c98-d5d3-1038-8d91-6dfda901a78e' }}
			resultPath="app_collections"
			renderData={renderAddFragmentToCollectionModal}
			notFoundMessage="Er konden geen collecties worden opgehaald"
		/>
	);
};

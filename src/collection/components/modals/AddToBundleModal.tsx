import { ExecutionResult } from '@apollo/react-common';
import { useMutation } from '@apollo/react-hooks';
import { ApolloQueryResult } from 'apollo-client';
import { get, isNil } from 'lodash-es';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
	Button,
	ButtonToolbar,
	Form,
	FormGroup,
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
import { Avo } from '@viaa/avo2-types';

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { getProfileId, getProfileName } from '../../../authentication/helpers/get-profile-info';
import { ApolloCacheManager, dataService } from '../../../shared/services/data-service';
import { trackEvents } from '../../../shared/services/event-logging-service';
import { getThumbnailForCollection } from '../../../shared/services/stills-service';
import toastService from '../../../shared/services/toast-service';
import {
	GET_COLLECTION_BY_ID,
	INSERT_COLLECTION,
	INSERT_COLLECTION_FRAGMENTS,
} from '../../collection.gql';
import { CollectionService } from '../../collection.service';

import './AddToBundleModal.scss';

interface AddToBundleModalProps extends DefaultSecureRouteProps {
	collectionId: string;
	collection: Avo.Collection.Collection;
	isOpen: boolean;
	onClose: () => void;
}

const AddToBundleModal: FunctionComponent<AddToBundleModalProps> = ({
	collectionId,
	collection,
	isOpen,
	onClose,
	user,
}) => {
	const [t] = useTranslation();

	const [isProcessing, setIsProcessing] = useState<boolean>(false);
	const [createNewBundle, setCreateNewBundle] = useState<boolean>(false);
	const [selectedBundleId, setSelectedBundleId] = useState<string>('');
	const [selectedBundle, setSelectedBundle] = useState<Avo.Collection.Collection | undefined>(
		undefined
	);
	const [newBundleTitle, setNewBundleTitle] = useState<string>('');
	const [bundles, setBundles] = useState<Partial<Avo.Collection.Collection>[]>([]);

	const [triggerCollectionFragmentsInsert] = useMutation(INSERT_COLLECTION_FRAGMENTS);
	const [triggerCollectionInsert] = useMutation(INSERT_COLLECTION);

	const fetchBundles = React.useCallback(
		() =>
			CollectionService.getCollectionTitlesByUser('bundle', user).then(
				(bundleTitles: Partial<Avo.Collection.Collection>[]) => {
					setBundles(bundleTitles);
				}
			),
		[user]
	);

	useEffect(() => {
		fetchBundles().catch(err => {
			console.error('Failed to fetch bundles', err);
			toastService.danger(t('Het ophalen van de bundels is mislukt'));
		});
	}, [fetchBundles, t]);

	const setSelectedBundleIdAndGetBundleInfo = async (id: string) => {
		try {
			setSelectedBundle(undefined);
			setSelectedBundleId(id);
			const response: ApolloQueryResult<Avo.Collection.Collection> = await dataService.query({
				query: GET_COLLECTION_BY_ID,
				variables: { id },
			});
			const collection = get(response, 'data.app_collections[0]');

			if (collection) {
				setSelectedBundle(collection);
			} else {
				toastService.danger(t('Het ophalen van de collectie details is mislukt'));
			}
		} catch (err) {
			toastService.danger(t('Het ophalen van de collectie details is mislukt'));
		}
	};

	const getFragment = (
		bundle: Partial<Avo.Collection.Collection>
	): Partial<Avo.Collection.Fragment> => {
		return {
			use_custom_fields: false,
			start_oc: null,
			position: (collection.collection_fragments || []).length,
			external_id: collectionId,
			end_oc: null,
			custom_title: null,
			custom_description: null,
			collection_id: bundle.id,
			item_meta: collection as any, // TODO remove once typings has item_meta?: ItemSchema | CollectionSchema;
		};
	};

	const addCollectionToExistingBundle = async (bundle: Partial<Avo.Collection.Collection>) => {
		// Disable "Toepassen" button
		setIsProcessing(true);

		try {
			const fragment = getFragment(bundle);
			delete fragment.item_meta;
			const response: void | ExecutionResult<
				Avo.Collection.Fragment
			> = await triggerCollectionFragmentsInsert({
				variables: {
					id: bundle.id,
					fragments: [fragment],
				},
				update: ApolloCacheManager.clearCollectionCache,
			});

			if (!response || response.errors) {
				console.error(get(response, 'errors'));
				toastService.danger(t('De collectie kon niet worden toegevoegd aan de bundel'));
			} else {
				toastService.success(t('De collectie is toegevoegd aan de bundel'));
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
			toastService.danger(t('De collectie kon niet worden toegevoegd aan de bundel'));
		}

		// Re-enable apply button
		setIsProcessing(false);
	};

	const addCollectionToNewBundle = async () => {
		// Disable "Toepassen" button
		setIsProcessing(true);

		let newBundle: Partial<Avo.Collection.Collection> | null = null;
		try {
			// Create new collection with one fragment in it
			newBundle = {
				title: newBundleTitle,
				thumbnail_path: null,
				is_public: false,
				owner_profile_id: getProfileId(user),
				type_id: 4,
			};
			try {
				newBundle.thumbnail_path = await getThumbnailForCollection({
					thumbnail_path: undefined,
					collection_fragments: [getFragment(newBundle) as Avo.Collection.Fragment],
				});
			} catch (err) {
				console.error('Failed to find cover image for new collection', err, {
					collectionFragments: [getFragment(newBundle) as Avo.Collection.Fragment],
				});
			}

			const response: void | ExecutionResult<
				Avo.Collection.Collection
			> = await triggerCollectionInsert({
				variables: {
					collection: newBundle,
				},
				update: ApolloCacheManager.clearCollectionCache,
			});

			const insertedBundle: Partial<Avo.Collection.Collection> = get(
				response,
				'data.insert_app_collections.returning[0]'
			);

			if (!response || response.errors) {
				toastService.danger(t('De bundel kon niet worden aangemaakt'));
			} else if (!insertedBundle || isNil(insertedBundle.id)) {
				toastService.danger(t('De aangemaakte bundel kon niet worden opgehaald'));
			} else {
				// Add collection to bundle
				await addCollectionToExistingBundle(insertedBundle);
				fetchBundles();
				onClose();
			}

			// Re-enable apply button
			setIsProcessing(false);
		} catch (err) {
			console.error('Failed to create bundle', err, {
				variables: {
					bundle: newBundle,
				},
			});
			toastService.danger(t('De bundel kon niet worden aangemaakt'));

			// Re-enable apply button
			setIsProcessing(false);
		}
	};

	const onApply = createNewBundle
		? addCollectionToNewBundle
		: () => addCollectionToExistingBundle(selectedBundle as Partial<Avo.Collection.Collection>);

	const renderAddToBundleModal = () => {
		return (
			<Modal
				title={t('Voeg collectie toe aan bundel')}
				size="medium"
				isOpen={isOpen}
				onClose={onClose}
				scrollable
			>
				<ModalBody>
					<div className="c-modal__body-add-collection">
						<Spacer>
							<Form>
								<FormGroup>
									<Spacer margin="bottom">
										<RadioButton
											label={t('Bestaande bundel')}
											checked={!createNewBundle}
											value="existing"
											name="collection"
											onChange={checked => checked && setCreateNewBundle(false)}
										/>
										<div>
											<Select
												id="existingCollection"
												placeholder={
													bundles.length ? t('Kies bundel') : t('Je hebt nog geen bundels')
												}
												options={[
													...bundles.map((bundle: Partial<Avo.Collection.Collection>) => ({
														label: bundle.title || '',
														value: String(bundle.id),
													})),
												]}
												value={selectedBundleId}
												onChange={setSelectedBundleIdAndGetBundleInfo}
												disabled={createNewBundle}
											/>
										</div>
									</Spacer>
									<Spacer margin="bottom">
										<RadioButton
											label={t('Nieuwe bundel')}
											checked={createNewBundle}
											value="new"
											name="bundle"
											onChange={checked => checked && setCreateNewBundle(true)}
										/>
										<div>
											<TextInput
												placeholder={t('Bundel titel')}
												disabled={!createNewBundle}
												value={newBundleTitle}
												onChange={setNewBundleTitle}
											/>
										</div>
									</Spacer>
								</FormGroup>
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
											createNewBundle && !newBundleTitle
												? t('U moet een bundel titel opgeven')
												: !createNewBundle && !selectedBundle
												? t('bezig met bundel detail op te halen')
												: ''
										}
										disabled={
											(createNewBundle && !newBundleTitle) ||
											(!createNewBundle && !selectedBundle) ||
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

	return renderAddToBundleModal();
};

export default AddToBundleModal;

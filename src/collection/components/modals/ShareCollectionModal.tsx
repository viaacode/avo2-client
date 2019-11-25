import { useMutation } from '@apollo/react-hooks';
import { get } from 'lodash-es';
import React, { FunctionComponent, useState } from 'react';

import {
	Button,
	ButtonToolbar,
	FormGroup,
	Modal,
	ModalBody,
	RadioButton,
	RadioButtonGroup,
	Spacer,
	Toolbar,
	ToolbarItem,
	ToolbarRight,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { getProfileName } from '../../../authentication/helpers/get-profile-info';
import { trackEvents } from '../../../shared/services/event-logging-service';
import toastService, { TOAST_TYPE } from '../../../shared/services/toast-service';
import { UPDATE_COLLECTION } from '../../collection.gql';
import { getValidationErrorsForPublish } from '../../collection.helpers';

interface ShareCollectionModalProps {
	isOpen: boolean;
	onClose: (collection?: Avo.Collection.Collection) => void;
	setIsPublic: (value: any) => void;
	collection: Avo.Collection.Collection;
}

const shareOptions = [
	{
		value: 'private',
		label: 'Niet openbaar',
		isPublic: false,
	},
	{
		value: 'public',
		label: 'Openbaar',
		isPublic: true,
	},
];

const ShareCollectionModal: FunctionComponent<ShareCollectionModalProps> = ({
	onClose,
	isOpen,
	collection,
	setIsPublic,
}) => {
	const [validationError, setValidationError] = useState<string[] | undefined>(undefined);
	const [isCollectionPublic, setIsCollectionPublic] = useState(collection.is_public);
	const [triggerCollectionPropertyUpdate] = useMutation(UPDATE_COLLECTION);

	const onSave = async () => {
		try {
			const isPublished = isCollectionPublic && !collection.is_public;
			const isDepublished = !isCollectionPublic && collection.is_public;

			// Close modal when isPublic doesn't change
			if (!isPublished && !isDepublished) {
				onClose();
				return;
			}

			// Validate if user wants to publish
			if (isPublished) {
				const validationErrors: string[] = getValidationErrorsForPublish(collection);

				if (validationErrors && validationErrors.length) {
					setValidationError(validationErrors.map(rule => get(rule[1], 'error')));
					toastService(validationErrors, TOAST_TYPE.DANGER);
					return;
				}
			}

			setIsPublic(isCollectionPublic);

			const newCollection: Avo.Collection.Collection = {
				is_public: isCollectionPublic,
			} as Avo.Collection.Collection;
			await triggerCollectionPropertyUpdate({
				variables: {
					id: collection.id,
					collection: newCollection,
				},
			});
			setValidationError(undefined);
			toastService(
				`De collectie staat nu ${isCollectionPublic ? 'publiek' : 'niet meer publiek'}.`,
				TOAST_TYPE.SUCCESS
			);
			closeModal(newCollection);

			// Public status changed => log as event
			trackEvents({
				event_object: {
					type: 'collection',
					identifier: String(collection.id),
				},
				event_message: `Gebruiker ${getProfileName()} heeft de collectie ${collection.id} ${
					isPublished ? 'gepubliceerd' : 'gedepubliceerd'
				}`,
				name: isPublished ? 'publish' : 'unpublish',
				category: 'item',
			});
		} catch (err) {
			toastService('De aanpassingen kunnen niet worden opgeslagen', TOAST_TYPE.DANGER);
		}
	};

	const closeModal = (collection?: Avo.Collection.Collection) => {
		setValidationError(undefined);
		onClose(collection);
	};

	return (
		<Modal isOpen={isOpen} title="Deel deze collectie" size="large" onClose={onClose} scrollable>
			<ModalBody>
				<>
					<p>Bepaal in hoeverre jouw collectie toegankelijk is voor andere personen.</p>
					<FormGroup error={validationError}>
						<Spacer margin="top-large">
							<h4 className="c-h4 u-m-0">Zichtbaarheid</h4>
						</Spacer>
						<RadioButtonGroup>
							{shareOptions.map((shareOption, index) => (
								<RadioButton
									key={index}
									name={shareOption.value}
									label={shareOption.label}
									value={shareOption.value}
									onChange={() => setIsCollectionPublic(shareOption.isPublic)}
									checked={isCollectionPublic === shareOption.isPublic}
								/>
							))}
						</RadioButtonGroup>
					</FormGroup>
					<Toolbar spaced>
						<ToolbarRight>
							<ToolbarItem>
								<ButtonToolbar>
									<Button type="secondary" label="Annuleren" onClick={() => onClose()} />
									<Button type="primary" label="Opslaan" onClick={onSave} />
								</ButtonToolbar>
							</ToolbarItem>
						</ToolbarRight>
					</Toolbar>
				</>
			</ModalBody>
		</Modal>
	);
};

export default ShareCollectionModal;

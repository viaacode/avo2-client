import { useMutation } from '@apollo/react-hooks';
import { get } from 'lodash-es';
import React, { FunctionComponent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
	Button,
	ButtonToolbar,
	FormGroup,
	Heading,
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

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { getProfileName } from '../../../authentication/helpers/get-profile-info';
import { trackEvents } from '../../../shared/services/event-logging-service';
import toastService from '../../../shared/services/toast-service';
import { UPDATE_COLLECTION } from '../../collection.gql';
import { getValidationErrorsForPublish } from '../../collection.helpers';

interface ShareCollectionModalProps extends DefaultSecureRouteProps {
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
	user,
}) => {
	const [t] = useTranslation();

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
					toastService.danger(validationErrors);
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
			toastService.success(
				`De collectie staat nu ${isCollectionPublic ? 'publiek' : 'niet meer publiek'}.`
			);
			closeModal(newCollection);

			// Public status changed => log as event
			trackEvents(
				{
					object: String(collection.id),
					object_type: 'collections',
					message: `Gebruiker ${getProfileName(user)} heeft de collectie ${collection.id} ${
						isPublished ? 'gepubliceerd' : 'gedepubliceerd'
					}`,
					action: isPublished ? 'publish' : 'unpublish',
				},
				user
			);
		} catch (err) {
			toastService.danger('De aanpassingen kunnen niet worden opgeslagen');
		}
	};

	const closeModal = (newCollection?: Avo.Collection.Collection) => {
		setValidationError(undefined);
		onClose(newCollection);
	};

	return (
		<Modal isOpen={isOpen} title="Deel deze collectie" size="large" onClose={onClose} scrollable>
			<ModalBody>
				<p>Bepaal in hoeverre jouw collectie toegankelijk is voor andere personen.</p>
				<FormGroup error={validationError}>
					<Spacer margin="top-large">
						<Heading className="u-m-0" type="h4">
							Zichtbaarheid
						</Heading>
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
								<Button type="secondary" label={t('Annuleren')} onClick={() => onClose()} />
								<Button type="primary" label={t('Opslaan')} onClick={onSave} />
							</ButtonToolbar>
						</ToolbarItem>
					</ToolbarRight>
				</Toolbar>
			</ModalBody>
		</Modal>
	);
};

export default ShareCollectionModal;

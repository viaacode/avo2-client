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

import toastService, { TOAST_TYPE } from '../../../shared/services/toast-service';
import { UPDATE_COLLECTION } from '../../graphql';
import { getValidationErrorsForPublish } from '../../helpers/validation';

interface ShareCollectionModalProps {
	isOpen: boolean;
	onClose: (collection?: Avo.Collection.Collection) => void;
	updateCollectionProperty: (value: any, fieldName: string) => void;
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
	updateCollectionProperty,
}) => {
	const [validationError, setValidationError] = useState<string[] | undefined>(undefined);
	const [isCollectionPublic, setIsCollectionPublic] = useState(collection.is_public);
	const [triggerCollectionPropertyUpdate] = useMutation(UPDATE_COLLECTION);

	const onSave = async () => {
		try {
			if (isCollectionPublic) {
				// We only need to check if you can publish if the user wants to publish
				// If the user wants to de-publish, we don't need to check anything
				const validationErrors: string[] = getValidationErrorsForPublish(collection);
				if (validationErrors && validationErrors.length) {
					setValidationError(validationErrors.map(rule => get(rule[1], 'error')));
					// <br> tags will be resolved to html by viaacode/avo2-components@v1.4.0
					toastService(validationErrors.join('</br>'), TOAST_TYPE.DANGER);
					return;
				}
			}

			updateCollectionProperty(isCollectionPublic, 'is_public');
			// TODO: Change when published_at is added in GraphQL
			updateCollectionProperty(new Date().toISOString(), 'publish_at');
			const newCollection: Avo.Collection.Collection = {
				is_public: isCollectionPublic,
				publish_at: new Date().toISOString(),
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
		} catch (err) {
			toastService('De aanpassingen kunnen niet worden opgeslagen', TOAST_TYPE.DANGER);
		}
	};

	const closeModal = (collection?: Avo.Collection.Collection) => {
		setValidationError(undefined);
		onClose(collection);
	};

	return (
		<Modal
			isOpen={isOpen}
			title="Deel deze collectie"
			size="large"
			onClose={onClose}
			scrollable={true}
		>
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
									<Button type="secondary" label="Annuleren" onClick={() => onClose} />
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

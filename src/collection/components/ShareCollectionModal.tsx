import { useMutation } from '@apollo/react-hooks';
import { get } from 'lodash-es';
import React, { Fragment, FunctionComponent, useState } from 'react';

import {
	Button,
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
import toastService, { TOAST_TYPE } from '../../shared/services/toast-service';
import { UPDATE_COLLECTION_PROPERTY } from '../collection.gql';

interface ShareCollectionModalProps {
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
	isPublic: boolean;
	updateCollectionProperty: (value: boolean, fieldName: string) => void;
	collection: Avo.Collection.Response;
}

const shareOptions = [
	{
		name: 'private',
		label: 'Niet openbaar',
		isPublicized: false,
	},
	{
		name: 'public',
		label: 'Openbaar',
		isPublicized: true,
	},
];

const ShareCollectionModal: FunctionComponent<ShareCollectionModalProps> = ({
	setIsOpen,
	isOpen,
	isPublic,
	collection,
	updateCollectionProperty,
}) => {
	const [validationError, setValidationError] = useState();
	const [isCollectionPublic, setIsCollectionPublic] = useState(isPublic);
	const [triggerCollectionPropertyUpdate] = useMutation(UPDATE_COLLECTION_PROPERTY);

	const validateBeforeSave = () => {
		const {
			title,
			description,
			lom_classification,
			lom_context,
			collection_fragment_ids,
		} = collection;

		const validationObject = {
			hasTitle: {
				error: 'Uw collectie heeft geen titel.',
				result: !!title,
			},
			hasDescription: {
				error: 'Uw collectie heeft geen beschrijving.',
				result: !!description,
			},
			hasContext: {
				error: 'Uw collectie heeft geen vakken.',
				result: !!(lom_context && lom_context.length),
			},
			hasClassification: {
				error: "Uw collectie heeft geen onderwijsniveau's",
				result: !!(lom_classification && lom_classification.length),
			},
			hasAtleastOneFragment: {
				error: 'Uw collectie heeft geen items.',
				result: !!(collection_fragment_ids && collection_fragment_ids.length),
			},
		};

		if (Object.values(validationObject).every(rule => rule.result === true)) {
			onSave();
			setValidationError(undefined);
			toastService('Opslaan volbracht.', TOAST_TYPE.SUCCESS);
		} else {
			const failedRules = Object.entries(validationObject).filter(rule => get(rule[1], 'result'));

			setValidationError(failedRules.map(rule => `${get(rule[1], 'error')}\n`));
			toastService(
				'Opslaan mislukt. Gelieve all verplichte velden in te vullen.',
				TOAST_TYPE.DANGER
			);
		}
	};

	const onSave = () => {
		setIsOpen(false);
		updateCollectionProperty(isCollectionPublic, 'is_public');
		triggerCollectionPropertyUpdate({
			variables: {
				id: collection.id,
				collectionChanges: {
					is_public: isCollectionPublic,
				},
			},
		});
	};

	return (
		<Modal
			isOpen={isOpen}
			title="Deel deze collectie"
			size="large"
			onClose={() => setIsOpen(false)}
			scrollable={true}
		>
			<ModalBody>
				<Fragment>
					<p>Bepaal in hoeverre jouw collectie toegankelijk is voor andere personen.</p>
					<FormGroup error={validationError}>
						<Spacer margin="top-large">
							<h4 className="c-h4 u-m-0">Zichtbaarheid</h4>
						</Spacer>
						<RadioButtonGroup>
							{shareOptions.map(({ name, label, isPublicized }, index) => (
								<RadioButton
									key={index}
									name={name}
									label={label}
									value={name}
									onChange={() => setIsCollectionPublic(isPublicized)}
									checked={isCollectionPublic === isPublicized}
								/>
							))}
						</RadioButtonGroup>
					</FormGroup>
					<Toolbar spaced>
						<ToolbarRight>
							<ToolbarItem>
								<div className="c-button-toolbar">
									<Button type="secondary" label="Annuleren" onClick={() => setIsOpen(false)} />
									<Button type="primary" label="Opslaan" onClick={validateBeforeSave} />
								</div>
							</ToolbarItem>
						</ToolbarRight>
					</Toolbar>
				</Fragment>
			</ModalBody>
		</Modal>
	);
};

export default ShareCollectionModal;

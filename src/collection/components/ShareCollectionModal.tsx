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
import { UPDATE_COLLECTION } from '../graphql';

interface ShareCollectionModalProps {
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
	initialIsPublic: boolean;
	updateCollectionProperty: (value: boolean, fieldName: string) => void;
	collection: Avo.Collection.Response;
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
	setIsOpen,
	isOpen,
	initialIsPublic,
	collection,
	updateCollectionProperty,
}) => {
	const [validationError, setValidationError] = useState();
	const [isCollectionPublic, setIsCollectionPublic] = useState(initialIsPublic);
	const [triggerCollectionPropertyUpdate] = useMutation(UPDATE_COLLECTION);

	const validateFragments = (fragments: Avo.Collection.Fragment[]) => {
		if (!fragments || !fragments.length) {
			return false;
		}

		let isValid: Boolean = true;

		// Check if fragment has custom_title and custom_description if necessary.
		fragments.forEach(fragment => {
			if (fragment.use_custom_fields && (!fragment.custom_title || !fragment.custom_description)) {
				isValid = false;
			}
		});

		return isValid;
	};

	const validateBeforeSave = () => {
		const {
			title,
			description,
			lom_classification,
			lom_context,
			collection_fragments,
		} = collection;

		// Validation ruleset
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
				error: "Uw collectie heeft geen onderwijsniveau's.",
				result: !!(lom_context && lom_context.length),
			},
			hasClassification: {
				error: 'Uw collectie heeft geen vakken.',
				result: !!(lom_classification && lom_classification.length),
			},
			hasAtleastOneFragment: {
				error: 'Uw collectie heeft geen items.',
				result: !!(collection_fragments && collection_fragments.length),
			},
			hasFullFragments: {
				error: 'Uw items moeten een titel en beschrijving bevatten.',
				result: validateFragments(collection_fragments),
			},
			// TODO: Add check if owner or write-rights.
		};

		if (Object.values(validationObject).every(rule => rule.result === true)) {
			// If all validations are valid, publish collection
			onSave();
			setValidationError(undefined);
			toastService('Opslaan volbracht.', TOAST_TYPE.SUCCESS);
		} else {
			// Strip failed rules from ruleset
			const failedRules = Object.entries(validationObject).filter(rule => !get(rule[1], 'result'));

			setValidationError(failedRules.map(rule => get(rule[1], 'error')));
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
				collection: {
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

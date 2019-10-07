import { useMutation } from '@apollo/react-hooks';
import { get } from 'lodash-es';
import React, { FunctionComponent, useState } from 'react';

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

import { stripHtml } from '../../../shared/helpers/formatters/strip-html';
import toastService, { TOAST_TYPE } from '../../../shared/services/toast-service';
import { UPDATE_COLLECTION } from '../../graphql';

interface ShareCollectionModalProps {
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
	initialIsPublic: boolean;
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
	setIsOpen,
	isOpen,
	initialIsPublic,
	collection,
	updateCollectionProperty,
}) => {
	const [validationError, setValidationError] = useState<string[] | undefined>(undefined);
	const [isCollectionPublic, setIsCollectionPublic] = useState(initialIsPublic);
	const [triggerCollectionPropertyUpdate] = useMutation(UPDATE_COLLECTION);

	const validateFragments = (fragments: Avo.Collection.Fragment[], type: string): boolean => {
		if (!fragments || !fragments.length) {
			return false;
		}

		let isValid = true;

		switch (type) {
			case 'video':
				// Check if video fragment has custom_title and custom_description if necessary.
				fragments.forEach(fragment => {
					if (
						fragment.external_id &&
						fragment.external_id !== '-1' &&
						fragment.use_custom_fields &&
						(!fragment.custom_title || !fragment.custom_description)
					) {
						isValid = false;
					}
				});
				break;
			case 'text':
				// Check if text fragment has custom_title or custom_description.
				fragments.forEach(fragment => {
					if (
						!fragment.external_id &&
						!stripHtml(fragment.custom_title || '').trim() &&
						!stripHtml(fragment.custom_description || '').trim()
					) {
						isValid = false;
					}
				});
				break;
			default:
				break;
		}

		return isValid;
	};

	const getValidationErrorsForPublish = (): [string, { error: string; isValid: boolean }][] => {
		const {
			title,
			description,
			lom_classification,
			lom_context,
			collection_fragments,
		} = collection;

		// Collection validation ruleset
		const collectionValidation: {
			[validationName: string]: { error: string; isValid: boolean };
		} = {
			hasTitle: {
				error: 'Uw collectie heeft geen titel.',
				isValid: !!title,
			},
			hasDescription: {
				error: 'Uw collectie heeft geen beschrijving.',
				isValid: !!description,
			},
			hasContext: {
				error: "Uw collectie heeft geen onderwijsniveau's.",
				isValid: !!(lom_context && lom_context.length),
			},
			hasClassification: {
				error: 'Uw collectie heeft geen vakken.',
				isValid: !!(lom_classification && lom_classification.length),
			},
			hasAtleastOneFragment: {
				error: 'Uw collectie heeft geen items.',
				isValid: !!(collection_fragments && collection_fragments.length),
			},
			hasFullVideoFragments: {
				error: 'Uw video-items moeten een titel en beschrijving bevatten.',
				isValid: validateFragments(collection_fragments, 'video'),
			},
			hasFullTextFragments: {
				error: 'Uw tekst-items moeten een titel of beschrijving bevatten.',
				isValid: validateFragments(collection_fragments, 'text'),
			},
			// TODO: Add check if owner or write-rights.
		};

		// Return errors
		return Object.entries(collectionValidation).filter(rule => !get(rule[1], 'isValid'));
	};

	const onSave = async () => {
		try {
			if (isCollectionPublic) {
				// We only need to check if you can publish if the user wants to publish
				// If the user wants to de-publish, we don't need to check anything
				const failedRules: [
					string,
					{ error: string; isValid: boolean }
				][] = getValidationErrorsForPublish();
				if (failedRules && failedRules.length) {
					setValidationError(failedRules.map(rule => get(rule[1], 'error')));
					toastService(
						'Opslaan mislukt. Gelieve all verplichte velden in te vullen.',
						TOAST_TYPE.DANGER
					);
					return;
				}
			}

			setIsOpen(false);

			updateCollectionProperty(isCollectionPublic, 'is_public');
			// TODO: Change when published_at is added in GraphQL
			updateCollectionProperty(new Date().toISOString(), 'publish_at');
			await triggerCollectionPropertyUpdate({
				variables: {
					id: collection.id,
					collection: {
						is_public: isCollectionPublic,
						publish_at: new Date().toISOString(),
					},
				},
			});
			setValidationError(undefined);
			toastService(
				`De collectie staat nu ${isCollectionPublic ? 'publiek' : 'niet meer publiek'}.`,
				TOAST_TYPE.SUCCESS
			);
			closeModal();
		} catch (err) {
			toastService('De aanpassingen kunnen niet worden opgeslagen', TOAST_TYPE.DANGER);
		}
	};

	const closeModal = () => {
		setValidationError(undefined);
		setIsOpen(false);
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
								<div className="c-button-toolbar">
									<Button type="secondary" label="Annuleren" onClick={closeModal} />
									<Button type="primary" label="Opslaan" onClick={onSave} />
								</div>
							</ToolbarItem>
						</ToolbarRight>
					</Toolbar>
				</>
			</ModalBody>
		</Modal>
	);
};

export default ShareCollectionModal;

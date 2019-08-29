import { useMutation } from '@apollo/react-hooks';
import { get } from 'lodash-es';
import React, { Fragment, FunctionComponent, useState } from 'react';

import {
	Button,
	Modal,
	ModalBody,
	RadioButton,
	RadioButtonGroup,
	Spacer,
	Toolbar,
	ToolbarItem,
	ToolbarRight,
} from '@viaa/avo2-components';
import { UPDATE_COLLECTION_PROPERTY } from '../collection.gql';

interface ShareCollectionModalProps {
	collectionId: number;
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
	isPublic: boolean;
	updateCollectionProperty: (value: boolean, fieldName: string) => void;
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
	collectionId,
	updateCollectionProperty,
}) => {
	const [isCollectionPublic, setIsCollectionPublic] = useState(isPublic);
	const [triggerCollectionPropertyUpdate] = useMutation(UPDATE_COLLECTION_PROPERTY);

	const onSave = () => {
		setIsOpen(false);
		updateCollectionProperty(isCollectionPublic, 'is_public');
		triggerCollectionPropertyUpdate({
			variables: {
				id: collectionId,
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
					<Toolbar spaced>
						<ToolbarRight>
							<ToolbarItem>
								<div className="c-button-toolbar">
									<Button type="secondary" label="Annuleren" onClick={() => setIsOpen(false)} />
									<Button type="primary" label="Opslaan" onClick={onSave} />
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

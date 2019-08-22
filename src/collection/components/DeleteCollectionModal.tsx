import React, { FunctionComponent } from 'react';

import {
	Button,
	Modal,
	ModalBody,
	Toolbar,
	ToolbarCenter,
	ToolbarItem,
} from '@viaa/avo2-components';

interface DeleteCollectionModalProps {
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
	deleteCollection: () => void;
}

const DeleteCollectionModal: FunctionComponent<DeleteCollectionModalProps> = ({
	setIsOpen,
	isOpen,
	deleteCollection,
}) => {
	const onDelete = () => {
		setIsOpen(false);
		deleteCollection();
	};

	return (
		<Modal
			isOpen={isOpen}
			title="Verwijder Collectie"
			size="small"
			onClose={() => setIsOpen(!isOpen)}
			scrollable={true}
		>
			<ModalBody>
				<Toolbar spaced>
					<ToolbarCenter>
						<ToolbarItem>
							<div className="c-button-toolbar">
								<Button type="secondary" label="Annuleren" onClick={() => setIsOpen(false)} />
								<Button type="primary" label="Verwijderen" onClick={onDelete} />
							</div>
						</ToolbarItem>
					</ToolbarCenter>
				</Toolbar>
			</ModalBody>
		</Modal>
	);
};

export default DeleteCollectionModal;

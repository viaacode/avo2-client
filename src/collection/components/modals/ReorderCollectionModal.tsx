import React, { FunctionComponent } from 'react';

import { Modal, ModalBody } from '@viaa/avo2-components';

interface ReorderCollectionModalProps {
	isOpen: boolean;
	onClose: () => void;
}

const ReorderCollectionModal: FunctionComponent<ReorderCollectionModalProps> = ({
	onClose,
	isOpen,
}) => {
	return (
		<Modal
			isOpen={isOpen}
			title="Herschik items in collectie"
			size="large"
			onClose={onClose}
			scrollable
		>
			{/* TODO: Add draggable list component */}
			<ModalBody>
				<p>REORDER</p>
			</ModalBody>
		</Modal>
	);
};

export default ReorderCollectionModal;

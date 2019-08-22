import React, { FunctionComponent } from 'react';

import { Modal, ModalBody } from '@viaa/avo2-components';

interface ReorderCollectionModalProps {
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
}

const ReorderCollectionModal: FunctionComponent<ReorderCollectionModalProps> = ({
	setIsOpen,
	isOpen,
}) => {
	return (
		<Modal
			isOpen={isOpen}
			title="Herschik items in collectie"
			size="large"
			onClose={() => setIsOpen(!isOpen)}
			scrollable={true}
		>
			{/* TODO: Add draggable list component */}
			<ModalBody>
				<p>REORDER</p>
			</ModalBody>
		</Modal>
	);
};

export default ReorderCollectionModal;

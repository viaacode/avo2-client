import React, { FunctionComponent } from 'react';

import { Modal, ModalBody } from '@viaa/avo2-components';

interface ShareCollectionModalProps {
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
}

const ShareCollectionModal: FunctionComponent<ShareCollectionModalProps> = ({
	setIsOpen,
	isOpen,
}) => {
	return (
		<Modal
			isOpen={isOpen}
			title="Deel deze collectie"
			size="large"
			onClose={() => setIsOpen(false)}
			scrollable={true}
		>
			<ModalBody>
				<p>SHARE</p>
			</ModalBody>
		</Modal>
	);
};

export default ShareCollectionModal;

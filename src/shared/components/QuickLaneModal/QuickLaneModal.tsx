import { Modal, ModalBody } from '@viaa/avo2-components';
import React, { type FC } from 'react';

import withUser, { type UserProps } from '../../hocs/withUser';
import QuickLaneContent from '../QuickLaneContent/QuickLaneContent';

import { type QuickLaneModalProps } from './QuickLaneModal.types';

const QuickLaneModal: FC<QuickLaneModalProps & UserProps> = (props) => {
	const { modalTitle, isOpen, onClose } = props;

	return (
		<Modal
			className="m-quick-lane-modal"
			title={modalTitle}
			size="medium"
			isOpen={isOpen}
			onClose={onClose}
			scrollable
		>
			<ModalBody>
				<QuickLaneContent {...props} />
			</ModalBody>
		</Modal>
	);
};

export default withUser(QuickLaneModal) as FC<QuickLaneModalProps>;

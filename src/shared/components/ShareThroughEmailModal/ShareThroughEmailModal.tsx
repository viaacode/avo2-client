import { Modal, ModalBody } from '@viaa/avo2-components';
import React, { type FC, type ReactNode } from 'react';

import withUser, { type UserProps } from '../../hocs/withUser';
import { type EmailTemplateType } from '../../services/campaign-monitor-service';
import ShareThroughEmailContent from '../ShareThroughEmailContent/ShareThroughEmailContent';

interface AddToCollectionModalProps {
	modalTitle: string | ReactNode;
	type: EmailTemplateType;
	emailLinkHref: string;
	emailLinkTitle: string;
	isOpen: boolean;
	onClose: () => void;
}

const ShareThroughEmailModal: FC<AddToCollectionModalProps & UserProps> = ({
	modalTitle,
	type,
	emailLinkHref,
	emailLinkTitle,
	isOpen,
	onClose,
}) => {
	return (
		<Modal
			className="m-share-through-email-modal"
			title={modalTitle}
			size="medium"
			isOpen={isOpen}
			onClose={onClose}
			scrollable
		>
			<ModalBody>
				<ShareThroughEmailContent
					emailLinkHref={emailLinkHref}
					emailLinkTitle={emailLinkTitle}
					type={type}
					onSendMail={onClose}
				/>
			</ModalBody>
		</Modal>
	);
};

export default withUser(ShareThroughEmailModal) as FC<AddToCollectionModalProps>;

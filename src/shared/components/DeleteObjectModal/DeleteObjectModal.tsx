import React, { FunctionComponent } from 'react';

import {
	Button,
	ButtonToolbar,
	Modal,
	ModalBody,
	Toolbar,
	ToolbarItem,
	ToolbarRight,
} from '@viaa/avo2-components';

import { sanitize, sanitizePresets } from '../../helpers/sanitize';
import i18n from '../../translations/i18n';

interface DeleteObjectModalProps {
	title?: string;
	body?: string;
	cancelLabel?: string;
	confirmLabel?: string;
	isOpen: boolean;
	onClose?: () => void;
	deleteObjectCallback: () => void;
}

const DeleteObjectModal: FunctionComponent<DeleteObjectModalProps> = ({
	title = i18n.t('shared/components/delete-object-modal/delete-object-modal___bent-u-zeker'),
	body = '',
	cancelLabel = 'Annuleer',
	confirmLabel = 'Verwijder',
	onClose = () => {},
	isOpen,
	deleteObjectCallback,
}) => {
	const handleDelete = () => {
		onClose();
		deleteObjectCallback();
	};

	return (
		<Modal
			isOpen={isOpen}
			title={title && sanitize(title)}
			size="small"
			onClose={onClose}
			scrollable
		>
			<ModalBody>
				{!!body && (
					<p dangerouslySetInnerHTML={{ __html: sanitize(body, sanitizePresets.link) }} />
				)}
				<Toolbar spaced>
					<ToolbarRight>
						<ToolbarItem>
							<ButtonToolbar>
								<Button type="secondary" label={cancelLabel} onClick={onClose} />
								<Button type="danger" label={confirmLabel} onClick={handleDelete} />
							</ButtonToolbar>
						</ToolbarItem>
					</ToolbarRight>
				</Toolbar>
			</ModalBody>
		</Modal>
	);
};

export default DeleteObjectModal;

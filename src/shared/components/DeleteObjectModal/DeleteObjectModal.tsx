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
	title = i18n.t('Bent u zeker?'),
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
		<Modal isOpen={isOpen} title={title} size="small" onClose={onClose} scrollable>
			<ModalBody>
				{!!body && <p>{body}</p>}
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

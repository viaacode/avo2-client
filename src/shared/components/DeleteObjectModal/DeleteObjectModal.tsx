import React, { FunctionComponent, useEffect } from 'react';

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
import ModalWrapper from '../ModalWrapper/ModalWrapper';

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
		<ModalWrapper isOpen={isOpen}>
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
		</ModalWrapper>
	);
};

export default DeleteObjectModal;

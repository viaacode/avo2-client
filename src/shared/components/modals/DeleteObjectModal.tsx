import React, { FunctionComponent } from 'react';

import {
	Button,
	Modal,
	ModalBody,
	Toolbar,
	ToolbarItem,
	ToolbarRight,
} from '@viaa/avo2-components';

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
	title = 'Bent u zeker?',
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
		<Modal isOpen={isOpen} title={title} size="small" onClose={onClose} scrollable={true}>
			<ModalBody>
				<>
					{!!body && <p>{body}</p>}
					<Toolbar spaced>
						<ToolbarRight>
							<ToolbarItem>
								<div className="c-button-toolbar">
									<Button type="secondary" label={cancelLabel} onClick={onClose} />
									<Button type="danger" label={confirmLabel} onClick={handleDelete} />
								</div>
							</ToolbarItem>
						</ToolbarRight>
					</Toolbar>
				</>
			</ModalBody>
		</Modal>
	);
};

export default DeleteObjectModal;

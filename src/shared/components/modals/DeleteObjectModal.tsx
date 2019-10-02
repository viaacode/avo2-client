import React, { Fragment, FunctionComponent } from 'react';

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
	setIsOpen: (isOpen: boolean) => void;
	deleteObjectCallback: () => void;
}

const DeleteObjectModal: FunctionComponent<DeleteObjectModalProps> = ({
	title = 'Bent u zeker?',
	body = '',
	cancelLabel = 'Annuleer',
	confirmLabel = 'Verwijder',
	setIsOpen,
	isOpen,
	deleteObjectCallback,
}) => {
	const onDelete = () => {
		setIsOpen(false);
		deleteObjectCallback();
	};

	return (
		<Modal
			isOpen={isOpen}
			title={title}
			size="small"
			onClose={() => setIsOpen(!isOpen)}
			scrollable={true}
		>
			<ModalBody>
				<Fragment>
					{!!body && <p>{body}</p>}
					<Toolbar spaced>
						<ToolbarRight>
							<ToolbarItem>
								<div className="c-button-toolbar">
									<Button type="secondary" label={cancelLabel} onClick={() => setIsOpen(false)} />
									<Button type="danger" label={confirmLabel} onClick={onDelete} />
								</div>
							</ToolbarItem>
						</ToolbarRight>
					</Toolbar>
				</Fragment>
			</ModalBody>
		</Modal>
	);
};

export default DeleteObjectModal;

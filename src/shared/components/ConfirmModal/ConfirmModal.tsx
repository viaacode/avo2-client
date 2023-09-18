import {
	Button,
	ButtonToolbar,
	type ButtonType,
	Modal,
	ModalBody,
	type ModalProps,
	Toolbar,
	ToolbarItem,
	ToolbarRight,
} from '@viaa/avo2-components';
import { noop } from 'lodash';
import React, { FunctionComponent, ReactNode } from 'react';

import useTranslation from '../../hooks/useTranslation';

export interface ConfirmModalProps {
	title?: string | ReactNode;
	body?: string | ReactNode;
	cancelLabel?: string;
	confirmLabel?: string;
	confirmButtonType?: ButtonType;
	size?: ModalProps['size'];
	isOpen: boolean;
	onClose?: () => void;
	confirmCallback?: () => void;
	className?: string;
}

const ConfirmModal: FunctionComponent<ConfirmModalProps> = ({
	title,
	body,
	cancelLabel = 'Annuleer',
	confirmLabel = 'Verwijder',
	confirmButtonType = 'danger',
	size = 'small',
	onClose = noop,
	isOpen,
	confirmCallback = noop,
	className,
}) => {
	const { tHtml } = useTranslation();

	return (
		<Modal
			className={className}
			isOpen={isOpen}
			title={
				title ||
				tHtml(
					'shared/components/delete-object-modal/delete-object-modal___ben-je-zeker-dat-je-deze-actie-wil-uitvoeren'
				)
			}
			size={size}
			onClose={onClose}
			scrollable
		>
			<ModalBody>
				{!!body && body}
				<Toolbar spaced>
					<ToolbarRight>
						<ToolbarItem>
							<ButtonToolbar>
								<Button type="secondary" label={cancelLabel} onClick={onClose} />
								<Button
									type={confirmButtonType}
									label={confirmLabel}
									onClick={confirmCallback}
								/>
							</ButtonToolbar>
						</ToolbarItem>
					</ToolbarRight>
				</Toolbar>
			</ModalBody>
		</Modal>
	);
};

export default ConfirmModal;

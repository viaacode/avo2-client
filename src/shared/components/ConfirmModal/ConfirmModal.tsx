import { sanitizeHtml, SanitizePreset } from '@meemoo/admin-core-ui';
import {
	Button,
	ButtonToolbar,
	ButtonType,
	Modal,
	ModalBody,
	Toolbar,
	ToolbarItem,
	ToolbarRight,
} from '@viaa/avo2-components';
import { ModalPropsSchema } from '@viaa/avo2-components/src/components/Modal/Modal';
import { noop } from 'lodash';
import React, { FunctionComponent, ReactNode } from 'react';

import useTranslation from '../../hooks/useTranslation';

export interface ConfirmModalProps {
	title?: string;
	body?: string | ReactNode;
	cancelLabel?: string;
	confirmLabel?: string;
	confirmButtonType?: ButtonType;
	size?: ModalPropsSchema['size'];
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
	const { tText } = useTranslation();

	return (
		<Modal
			className={className}
			isOpen={isOpen}
			title={sanitizeHtml(
				title ||
					tText(
						'shared/components/delete-object-modal/delete-object-modal___ben-je-zeker-dat-je-deze-actie-wil-uitvoeren'
					),
				SanitizePreset.basic
			)}
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

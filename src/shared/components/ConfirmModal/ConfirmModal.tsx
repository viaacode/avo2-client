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

import { sanitizeHtml } from '../../helpers';
import i18n from '../../translations/i18n';

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
	title = i18n.t(
		'shared/components/delete-object-modal/delete-object-modal___ben-je-zeker-dat-je-deze-actie-wil-uitvoeren'
	),
	body = i18n.t(
		'shared/components/delete-object-modal/delete-object-modal___deze-actie-kan-niet-ongedaan-gemaakt-worden'
	),
	cancelLabel = 'Annuleer',
	confirmLabel = 'Verwijder',
	confirmButtonType = 'danger',
	size = 'small',
	onClose = noop,
	isOpen,
	confirmCallback = noop,
	className,
}) => {
	return (
		<Modal
			className={className}
			isOpen={isOpen}
			title={title && sanitizeHtml(title, 'basic')}
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

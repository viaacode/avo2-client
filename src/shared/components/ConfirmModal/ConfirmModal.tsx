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
import { noop } from 'lodash';
import React, { FunctionComponent } from 'react';

import { sanitizeHtml } from '../../helpers';
import i18n from '../../translations/i18n';
import Html from '../Html/Html';

export interface ConfirmModalProps {
	title?: string;
	body?: string;
	cancelLabel?: string;
	confirmLabel?: string;
	confirmButtonType?: ButtonType;
	isOpen: boolean;
	onClose?: () => void;
	confirmCallback?: () => void;
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
	onClose = noop,
	isOpen,
	confirmCallback = noop,
}) => {
	const handleConfirm = () => {
		onClose();
		confirmCallback();
	};

	return (
		<Modal
			isOpen={isOpen}
			title={title && sanitizeHtml(title, 'basic')}
			size="small"
			onClose={onClose}
			scrollable
		>
			<ModalBody>
				{!!body && <Html content={body} />}
				<Toolbar spaced>
					<ToolbarRight>
						<ToolbarItem>
							<ButtonToolbar>
								<Button type="secondary" label={cancelLabel} onClick={onClose} />
								<Button
									type={confirmButtonType}
									label={confirmLabel}
									onClick={handleConfirm}
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

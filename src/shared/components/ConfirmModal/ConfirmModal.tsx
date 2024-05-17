import { useLocalStorage } from '@uidotdev/usehooks';
import {
	Button,
	ButtonToolbar,
	type ButtonType,
	Checkbox,
	FormGroup,
	Modal,
	ModalBody,
	type ModalProps,
	Spacer,
	Toolbar,
	ToolbarItem,
	ToolbarRight,
} from '@viaa/avo2-components';
import { noop } from 'lodash-es';
import React, { type FunctionComponent, type ReactNode, useEffect, useMemo } from 'react';

import useTranslation from '../../hooks/useTranslation';

import { RememberConfirmationKeys } from './ConfirmModal.const';

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
	remember?: keyof typeof RememberConfirmationKeys;
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
	remember,
}) => {
	const { tHtml } = useTranslation();

	const rememberKey = useMemo(
		() => (remember ? RememberConfirmationKeys[remember] : ''),
		[remember]
	);

	const shouldRemember = rememberKey !== '';
	const [isRemembered, setRemember] = useLocalStorage(rememberKey, false);

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
				{shouldRemember && (
					<Spacer margin="top">
						<FormGroup>
							<Checkbox
								label={tHtml(
									'shared/components/confirm-modal/confirm-modal___deze-boodschap-niet-meer-tonen-in-de-toekomst'
								)}
								checked={isRemembered}
								onChange={setRemember}
							/>
						</FormGroup>
					</Spacer>
				)}
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
